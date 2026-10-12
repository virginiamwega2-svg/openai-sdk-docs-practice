
# SDK Integration Guide

## Overview

This guide explains how to integrate the OpenAI JavaScript SDK into a Node.js application, configure API credentials securely, make requests using the Responses API, validate input, and test the integration.

It builds on the [QuickStart](QUICKSTART.md) by explaining how the example functions work and how to test them without a real API key.

## Who This Guide Is For

This guide is for JavaScript developers who want to integrate the OpenAI SDK into a Node.js project.

## What You'll Learn

By the end of this guide, you'll know how to:

- Install and configure the SDK.
- Store API credentials securely using environment variables.
- Generate a greeting and summarize text using the Responses API.
- Validate input before making a request.
- Handle common SDK errors.
- Test successful responses and invalid input using mocked clients.

## Prerequisites

Before starting, make sure you have:

- **Node.js:** Version 22 or later.
- **npm:** The package manager used to install dependencies.
- **Basic JavaScript knowledge:** Familiarity with imports, environment variables, and asynchronous functions.
- **An OpenAI API key:** Required only for live API requests, not for installation or local mocked tests.

You should also have a terminal and a code editor available.

**Security:** Never commit a real API key to Git or expose it in client-side code. Store it in a local `.env` file and keep that file out of version control.

## Installation and Configuration

### 1. Install the Dependencies

From the project directory, run:

```bash
npm install
```

This installs the packages listed in `package.json`, including the OpenAI SDK and `dotenv`.

### 2. Configure Environment Variables

Create a `.env` file in the project root if one does not already exist.

Add the following placeholder:

```dotenv
OPENAI_API_KEY=your_api_key_here
```

Replace the placeholder with a valid API key only when you intend to make a live API request.

### 3. Keep Credentials Secure

- Never commit your real `.env` file to version control.
- Do not hardcode API keys in application source code.
- Do not expose secret API keys in browser-side applications.
- If a key is exposed, revoke it and create a replacement.

### 4. Verify the Configuration

When the application starts, it checks whether `OPENAI_API_KEY` is missing or still contains the placeholder. If so, it displays a helpful error instead of making a request.

## Making Requests

The project exports two functions from `index.js`:

- `generateGreeting(client)` generates a friendly, one-sentence greeting.
- `summarizeText(client, text)` summarizes supplied text and rejects empty or whitespace-only input.

Both functions receive an initialized client as an argument. This makes them easier to test with a mock client.

### Example 1: Generate a Greeting

```javascript
export async function generateGreeting(client) {
  const response = await client.responses.create({
    model: "gpt-5.5",
    input: "Write a friendly one-sentence greeting.",
  });

  return response.output_text;
}
```

### Example 2: Summarize Text

```javascript
export async function summarizeText(client, text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Text to summarize is required.");
  }

  const response = await client.responses.create({
    model: "gpt-5.5",
    input: `Summarize the following text clearly and concisely:\n\n${text}`,
  });

  return response.output_text;
}
```

### How the Functions Work

1. **Accept the client:** Each function receives an initialized SDK client.
2. **Validate input:** The summarizer checks that the supplied text is a non-empty string.
3. **Send the request:** `client.responses.create()` sends the model and input to the Responses API.
4. **Wait for the response:** `await` waits for the request to resolve or fail.
5. **Return the result:** `response.output_text` provides the generated text.

### Why Pass the Client Into the Functions?

Passing the client as an argument separates request logic from client initialization. It also allows tests to provide a mock client, so the functions can be tested without a real API key or network request.

**Model availability:** The examples use the model configured in this project. Its availability has not been verified against a live API account. Confirm that the selected model is available to your account before making a live request.

## Input Validation

The summarizer rejects input that is not a string or contains only whitespace.

For example:

```javascript
await summarizeText(client, "");
await summarizeText(client, "   ");
```

Both calls reject with the error message:

```text
Text to summarize is required.
```

Validation prevents an unnecessary SDK request when the input is invalid. Applications using this function should handle the rejected promise appropriately.

## Error Handling

SDK requests can fail for several reasons, including invalid credentials, insufficient permissions, rate limits, and network connectivity problems.

This project uses `error-handler.js` to convert common SDK errors into more understandable messages.

### Common Errors

| Error | What It Means | What to Check |
|---|---|---|
| Authentication error | The API key may be invalid | Verify `OPENAI_API_KEY` |
| Permission error | The account may not have access to the requested resource | Check account permissions and model access |
| Rate limit error | The request may exceed an applicable limit or quota | Check usage, limits, and billing |
| Connection error | The application could not establish a successful connection | Check your network connection |
| Unknown error | The failure does not match a specifically handled case | Inspect error details securely |

### Recommended Practices

- Give developers actionable error messages.
- Never print API keys or other secrets in error logs.
- Avoid retrying every failure indiscriminately.
- Use bounded retries with backoff for transient failures when appropriate.
- Avoid exposing sensitive error details to end users.

## Testing the Integration

Run the automated tests from the project root:

```bash
npm test
```

The project uses Node.js's built-in test runner.

### What the Tests Cover

The current test suite verifies that:

- The application reports a missing API key.
- Common SDK errors are converted into helpful messages.
- Unknown errors receive a generic fallback message.
- The greeting function returns the expected text from a mocked SDK response.
- The summarizer returns the expected text from a mocked SDK response.
- Empty and whitespace-only summarizer inputs are rejected without calling the mocked SDK.

The latest local test run reported **10 passing tests and 0 failures**.

### Understand the Limitations

The tests use simulated responses and errors. They do not send real requests to the OpenAI API.

Passing tests confirms the behavior covered by the tests, but does not verify credentials, account permissions, model availability, network connectivity, or live API responses.

## Before Testing Against the Live API

Once you have a valid API key and the necessary API access, follow the instructions in [QUICKSTART.md](QUICKSTART.md).

Keep your credentials secure and verify model availability before making a live request.

## Related Documentation

- [QuickStart Guide](QUICKSTART.md) — Set up the project and run the example.
- [Troubleshooting Guide](TROUBLESHOOTING.md) — Diagnose common issues and recover.
- [Validation Report](VALIDATION-REPORT.md) — Review the existing documentation validation checks.
- [README](README.md) — Start here for an overview of the project.