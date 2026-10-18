# Streaming AI Responses with the OpenAI JavaScript SDK

## Overview

This cookbook demonstrates how to consume streamed text output from the OpenAI Responses API using the OpenAI JavaScript SDK.

Unlike a standard request that waits for the complete response, streaming lets an application process text fragments as they arrive. This can help applications display responses progressively instead of waiting for generation to finish.

This example builds on the existing `openai-sdk-docs-practice` project.

## Prerequisites

Before starting, make sure you have:

- Node.js 22 or later.
- npm installed.
- The project dependencies installed with `npm install`.
- A valid OpenAI API key for live API testing.

The automated tests use mocked streaming events and do not require a live API key.

## How streaming works

The example uses the Responses API with `stream: true`. The SDK returns an asynchronous stream of events. The application iterates over those events and processes text-delta events as they arrive.

The implementation in `index.js` is:

```javascript
export async function streamText(client, prompt, onText) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  if (typeof onText !== "function") {
    throw new Error("A text callback is required.");
  }

  const stream = await client.responses.create({
    model: MODEL,
    input: prompt,
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      onText(event.delta);
    }
  }
}
```

The function validates its inputs, requests a streamed response, and forwards each text fragment to the supplied callback.

## Run the example

From the project directory, run:

```powershell
node index.js stream "Explain how an API works"
```

The CLI writes text fragments to standard output as they arrive.

The example uses the `OPENAI_API_KEY` environment variable loaded from the project's `.env` file. Never commit a real API key to source control.

## Automated tests

Run the existing test suite:

```powershell
npm test
```

The streaming tests use a mocked client and simulated events to verify that:

- Text fragments are delivered in order.
- Non-text events are ignored.
- An empty prompt is rejected.
- A missing callback is rejected.

These tests verify the application's handling of mocked events. They do not prove that a live OpenAI request succeeds.

## Troubleshooting

### The prompt is missing

Provide a non-empty prompt after the `stream` command.

```powershell
node index.js stream "Explain how an API works"
```

### The API key is missing or invalid

Check that `OPENAI_API_KEY` is configured correctly in `.env`. Keep the file private and ensure it is excluded from Git.

### Authentication, permission, quota, or connection errors occur

Check the error message, API key validity, project permissions, usage limits, and network connection. The project's shared error handler provides general guidance for these error categories.

### The stream does not produce text

Confirm that the request uses `stream: true` and that the application processes `response.output_text.delta` events. Also check the terminal output and any error reported by the SDK.

## Verification status

The latest local test run reported 26 passing tests and zero failures.

- The streaming function is implemented in `index.js`.
- The CLI includes a `stream` command.
- The automated test suite passed all 26 tests.
- Streaming behavior was tested with mocked events.
- A live API streaming request has not yet been verified.

Passing mocked tests demonstrates application behavior under controlled conditions; it does not prove that a live API streaming request succeeds.

## Related project documentation

- [README](./README.md)
- [SDK Integration Guide](./SDK-INTEGRATION-GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Validation Report](./VALIDATION-REPORT.md)
- [Developer Experience Case Study](./CASE-STUDY.md)
