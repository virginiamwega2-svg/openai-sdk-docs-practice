
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import OpenAI from "openai";
import { getErrorMessage } from "./error-handler.js";
import { generateGreeting } from "./index.js";

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