import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import OpenAI from "openai";
import { getErrorMessage } from "./error-handler.js";
import {
  generateGreeting,
  summarizeText,
  streamText,
} from "./index.js";

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

test("returns the greeting from a successful SDK response", async () => {
  const expectedGreeting = "Hello, developer!";

  const mockClient = {
    responses: {
      create: async () => ({
        output_text: expectedGreeting,
      }),
    },
  };

  const greeting = await generateGreeting(mockClient);

  assert.equal(greeting, expectedGreeting);
});

test("returns a summary from a successful SDK response", async () => {
  const expectedSummary = "AI makes it easier to summarize text.";

  const mockClient = {
    responses: {
      create: async () => ({
        output_text: expectedSummary,
      }),
    },
  };

  const summary = await summarizeText(
    mockClient,
    "Artificial intelligence can help developers summarize long documents."
  );

  assert.equal(summary, expectedSummary);
});

// Input validation tests

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

test("streams text fragments in order", async () => {
  const receivedText = [];

  const events = [
    { type: "response.output_text.delta", delta: "Hello" },
    { type: "response.output_text.delta", delta: ", developer!" },
    { type: "response.completed" },
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

  await streamText(mockClient, "Greet a developer", (text) => {
    receivedText.push(text);
  });

  assert.deepEqual(receivedText, ["Hello", ", developer!"]);
  assert.equal(receivedText.join(""), "Hello, developer!");
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

test("propagates an SDK error when streaming fails to start", async () => {
  const sdkError = new Error("SDK request failed");

  const mockClient = {
    responses: {
      create: async () => {
        throw sdkError;
      },
    },
  };

  await assert.rejects(
    streamText(mockClient, "Explain streaming", () => {}),
    (error) => error === sdkError
  );
});