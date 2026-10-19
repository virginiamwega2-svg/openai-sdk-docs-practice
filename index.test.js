import { withObservability } from "./observability.js";
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import OpenAI from "openai";
import { getErrorMessage } from "./error-handler.js";
import {generateGreeting,summarizeText,streamText,} from "./index.js";

// CLI validation tests
test("shows a helpful error when the API key is missing", () => {
  const result = spawnSync(process.execPath, ["index.js"], {
    encoding: "utf8",
    env: {
      ...process.env,
      OPENAI_API_KEY: "your_api_key_here",
    },
  });

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Missing API key\. Add a valid OPENAI_API_KEY to your \.env file\./
  );
});

test("shows a helpful message when summarize text is missing", () => {
  const result = spawnSync(
    process.execPath,
    ["index.js", "summarize"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        OPENAI_API_KEY: "your_api_key_here",
      },
    }
  );

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Please provide text to summarize/
  );
});

test("shows a helpful message for unknown commands", () => {
  const result = spawnSync(
    process.execPath,
    ["index.js", "unknown"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        OPENAI_API_KEY: "your_api_key_here",
      },
    }
  );

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Unknown command\. Use "greet", "summarize", or "stream"\./
  );
});

// SDK error-handling tests

test("returns a helpful message for authentication errors", () => {
  const error = new OpenAI.AuthenticationError(
    401,
    { message: "Invalid API key" },
    "Invalid API key",
    new Headers()
  );

  assert.equal(
    getErrorMessage(error),
    "Authentication failed. Check that your API key is valid."
  );
});

test("returns a helpful message for permission errors", () => {
  const error = new OpenAI.PermissionDeniedError(
    403,
    { message: "Permission denied" },
    "Permission denied",
    new Headers()
  );

  assert.equal(
    getErrorMessage(error),
    "Permission denied. Check your API key permissions and project access."
  );
});

test("returns a helpful message for rate limit errors", () => {
  const error = new OpenAI.RateLimitError(
    429,
    { message: "Rate limit exceeded" },
    "Rate limit exceeded",
    new Headers()
  );

  assert.equal(
    getErrorMessage(error),
    "Rate limit or quota issue. Check your usage limits and billing settings."
  );
});

test("returns a helpful message for connection errors", () => {
  const error = new OpenAI.APIConnectionError({
    message: "Connection failed",
  });

  assert.equal(
    getErrorMessage(error),
    "Connection failed. Check your network connection and try again."
  );
});

test("returns a generic message for unknown errors", () => {
  assert.equal(
    getErrorMessage(new Error("Internal details")),
    "The request failed. Check your configuration and try again."
  );
});

// Successful SDK response tests using mocks

test("returns the greeting and records a success metric", async () => {
  const expectedGreeting = "Hello, developer!";
  const metrics = [];

  const mockClient = {
    responses: {
      create: async () => ({
        output_text: expectedGreeting,
        usage: {
          input_tokens: 12,
          input_tokens_details: {
            cached_tokens: 2,
          },
          output_tokens: 8,
          total_tokens: 20,
        },
      }),
    },
  };

  const greeting = await generateGreeting(
    mockClient,
    (metric) => metrics.push(metric)
  );

  assert.equal(greeting, expectedGreeting);
  assert.equal(metrics.length, 1);
  assert.equal(metrics[0].operation, "generateGreeting");
  assert.equal(metrics[0].status, "success");
  assert.equal(typeof metrics[0].durationMs, "number");
  assert.ok(metrics[0].durationMs >= 0);

  assert.equal(metrics[0].inputTokens, 12);
  assert.equal(metrics[0].outputTokens, 8);
  assert.equal(metrics[0].totalTokens, 20);

  assert.ok(
    Math.abs(metrics[0].estimatedCostUsd - 0.000291) < 1e-12
  );
});

test("returns a summary and records token usage metrics", async () => {
  const expectedSummary = "This is a summary.";
  const metrics = [];

  const mockClient = {
    responses: {
      create: async () => ({
        output_text: expectedSummary,
        usage: {
          input_tokens: 30,
          output_tokens: 10,
          total_tokens: 40,
        },
      }),
    },
  };

  const summary = await summarizeText(
    mockClient,
    "Text to summarize",
    (metric) => metrics.push(metric)
  );

  assert.equal(summary, expectedSummary);
  assert.equal(metrics.length, 1);
  assert.equal(metrics[0].operation, "summarizeText");
  assert.equal(metrics[0].status, "success");
  assert.equal(metrics[0].inputTokens, 30);
  assert.equal(metrics[0].outputTokens, 10);
  assert.equal(metrics[0].totalTokens, 40);
});

  test("rejects empty text without calling the SDK", async () => {
  const mockClient = {
    responses: {
      create: async () => {
        throw new Error("The API should not be called.");
      },
    },
  };

  await assert.rejects(
    summarizeText(mockClient, ""),
    {
      message: "Text to summarize is required.",
    }
  );
});

test("rejects whitespace-only text without calling the SDK", async () => {
  const mockClient = {
    responses: {
      create: async () => {
        throw new Error("The API should not be called.");
      },
    },
  };

  await assert.rejects(
    summarizeText(mockClient, "   "),
    {
      message: "Text to summarize is required.",
    }
  );
});

 // Streaming SDK tests using mocked events
test("streams text fragments in order and records token usage metrics", async () => {
  const receivedText = [];
  const metrics = [];

  const events = [
    { type: "response.output_text.delta", delta: "Hello" },
    { type: "response.output_text.delta", delta: ", developer!" },
    {
      type: "response.completed",
      response: {
        usage: {
          input_tokens: 25,
          output_tokens: 9,
          total_tokens: 34,
        },
      },
    },
  ];

  const mockClient = {
    responses: {
      create: async (options) => {
        assert.equal(options.stream, true);
        return (async function* () {
          for (const event of events) {
            yield event;
          }
        })();
      },
    },
  };

  await streamText(
    mockClient,
    "Say hello",
    (chunk) => receivedText.push(chunk),
    (metric) => metrics.push(metric)
  );

  assert.deepEqual(receivedText, ["Hello", ", developer!"]);
  assert.equal(metrics.length, 1);
  assert.equal(metrics[0].operation, "streamText");
  assert.equal(metrics[0].status, "success");
  assert.equal(typeof metrics[0].durationMs, "number");
  assert.ok(metrics[0].durationMs >= 0);
  assert.equal(typeof metrics[0].timeToFirstTokenMs, "number");
assert.ok(metrics[0].timeToFirstTokenMs >= 0);

  assert.equal(metrics[0].inputTokens, 25);
  assert.equal(metrics[0].outputTokens, 9);
  assert.equal(metrics[0].totalTokens, 34);
});

test("ignores non-text streaming events", async () => {
  const receivedText = [];

  const mockClient = {
    responses: {
      create: async () =>
        (async function* () {
          yield { type: "response.created" };
          yield {
            type: "response.output_text.delta",
            delta: "Useful text",
          };
          yield { type: "response.completed" };
        })(),
    },
  };

  await streamText(mockClient, "Give me useful text", (text) => {
    receivedText.push(text);
  });

  assert.deepEqual(receivedText, ["Useful text"]);
});

test("rejects an empty streaming prompt without calling the SDK", async () => {
  const mockClient = {
    responses: {
      create: async () => {
        throw new Error("The API should not be called.");
      },
    },
  };

  await assert.rejects(
    streamText(mockClient, "", () => {}),
    { message: "Prompt is required." }
  );
});

test("rejects a missing streaming callback without calling the SDK", async () => {
  const mockClient = {
    responses: {
      create: async () => {
        throw new Error("The API should not be called.");
      },
    },
  };

  await assert.rejects(
    streamText(mockClient, "Explain streaming"),
    { message: "A text callback is required." }
  );
});

test("shows a helpful message when the streaming prompt is missing", () => {
  const result = spawnSync(
    process.execPath,
    ["index.js", "stream"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        OPENAI_API_KEY: "your_api_key_here",
      },
    }
  );

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Please provide a prompt\. Example: node index\.js stream/
  );
});

test("shows all supported commands for unknown commands", () => {
  const result = spawnSync(
    process.execPath,
    ["index.js", "unknown"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        OPENAI_API_KEY: "your_api_key_here",
      },
    }
  );

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Unknown command\. Use "greet", "summarize", or "stream"\./
  );
});


test("records a streaming error and propagates the original SDK error", async () => {
  const sdkError = new Error("SDK request failed");
  const metrics = [];

  const mockClient = {
    responses: {
      create: async () => {
        throw sdkError;
      },
    },
  };

  await assert.rejects(
    streamText(
      mockClient,
      "Explain streaming",
      () => {},
      (metric) => metrics.push(metric)
    ),
    (error) => error === sdkError
  );

  assert.equal(metrics.length, 1);
  assert.equal(metrics[0].operation, "streamText");
  assert.equal(metrics[0].status, "error");
  assert.equal(typeof metrics[0].durationMs, "number");
  assert.ok(metrics[0].durationMs >= 0);
});


test("records duration and success for a successful operation", async () => {
  const metrics = [];

  const result = await withObservability(
    "testOperation",
    async () => "hello",
    (metric) => metrics.push(metric)
  );

  assert.equal(result, "hello");
  assert.equal(metrics.length, 1);
  assert.equal(metrics[0].operation, "testOperation");
  assert.equal(metrics[0].status, "success");
  assert.equal(typeof metrics[0].durationMs, "number");
  assert.ok(metrics[0].durationMs >= 0);
});

test("records an error and rethrows when an operation fails", async () => {
  const metrics = [];
  const expectedError = new Error("Test failure");

  await assert.rejects(
    withObservability(
      "testOperation",
      async () => {
        throw expectedError;
      },
      (metric) => metrics.push(metric)
    ),
    (error) => error === expectedError
  );

  assert.equal(metrics.length, 1);
  assert.equal(metrics[0].operation, "testOperation");
  assert.equal(metrics[0].status, "error");
  assert.equal(typeof metrics[0].durationMs, "number");
  assert.ok(metrics[0].durationMs >= 0);
});

test("preserves a successful result when the metrics callback fails", async () => {
  const result = await withObservability(
    "testOperation",
    async () => "operation succeeded",
    () => {
      throw new Error("Metrics callback failed");
    }
  );

  assert.equal(result, "operation succeeded");
});

test("preserves the original operation error when the metrics callback fails", async () => {
  const operationError = new Error("Original operation failed");

  await assert.rejects(
    withObservability(
      "testOperation",
      async () => {
        throw operationError;
      },
      () => {
        throw new Error("Metrics callback failed");
      }
    ),
    (error) => error === operationError
  );
});
