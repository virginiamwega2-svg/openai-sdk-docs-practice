# SDK Integration Guide

## Overview

This guide explains how to integrate the OpenAI JavaScript SDK into a Node.js application, configure API credentials securely, make a request, and handle common errors.

It builds on the [QuickStart](QUICKSTART.md) by focusing on how developers can incorporate the SDK into their own applications.

## Who This Guide Is For

This guide is for JavaScript developers who want to integrate the OpenAI SDK into a Node.js project.

## What You'll Learn

By the end of this guide, you'll know how to:

* Install and configure the SDK.
* Store your API key securely using environment variables.
* Make a request using the SDK.
* Handle common errors.
* Test your integration and troubleshoot problems.

## Prerequisites

Before starting, make sure you have:

* **Node.js:** An installed version compatible with the project's requirements.
* **npm:** The package manager used to install dependencies.
* **An OpenAI API key:** Required to make authenticated requests to the OpenAI API.
* **Basic JavaScript knowledge:** Familiarity with importing packages, using environment variables, and working with asynchronous functions.

You should also have a terminal and a code editor available.

**Important:** Never commit your real API key to Git or expose it in client-side code. Store it in a local environment file and keep that file out of version control.

## Installation and Configuration

### 1. Install the Dependencies

In your project directory, run:

```bash
npm install
```

This installs the packages listed in `package.json`, including the OpenAI SDK and dotenv for environment variable loading.

### 2. Configure Environment Variables

Create a `.env` file in the project root if one does not already exist.

Add your API key:

```dotenv
OPENAI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key. Do not include quotation marks unless your environment requires them.

### 3. Keep Credentials Secure

* Never commit your real `.env` file to version control.
* Do not hardcode API keys in application source code.
* Do not expose secret API keys in browser-side applications.
* If a key is exposed, revoke it and create a replacement.

### 4. Verify the Configuration

Before making a request, confirm that the environment variable is set and contains a valid API key.

The application checks for a missing or placeholder key and displays a helpful error instead of attempting the request.

## Making a Request

Once the dependencies and environment variables are configured, your application can use the OpenAI JavaScript SDK to send a request.

### Example

The following function uses an existing SDK client to request a friendly greeting:

```javascript
export async function generateGreeting(client) {
  const response = await client.responses.create({
    model: "gpt-5.5",
    input: "Write a friendly one-sentence greeting.",
  });

  return response.output_text;
}
```

### How It Works

1. **Accept the client:** The function receives an initialized OpenAI client.
2. **Send the request:** `client.responses.create()` sends the model and input to the Responses API.
3. **Wait for the response:** `await` pauses execution until the request resolves or fails.
4. **Return the result:** `response.output_text` provides the generated text.

### Why Pass the Client Into the Function?

Passing the client as an argument separates request logic from client initialization. It also makes the function easier to test with a mocked client, without requiring a real API key or network request.

**Note:** This example uses the model configured in this project. Confirm that the model is available to your account before testing against the live API.

## Error Handling

SDK requests can fail for several reasons, including invalid credentials, insufficient permissions, rate limits, and network connectivity problems.

This project uses `error-handler.js` to convert common SDK errors into more understandable messages.

### Common Errors

| Error                | What It Means                                               | What to Check                                            |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| Authentication error | The API key may be invalid or missing                       | Verify `OPENAI_API_KEY`                                  |
| Permission error     | The account may not have access to the requested resource   | Check your account permissions and model access          |
| Rate limit error     | The request may exceed an applicable rate limit or quota    | Check your usage, limits, and billing status             |
| Connection error     | The application could not establish a successful connection | Check your network connection and retry when appropriate |
| Unknown error        | The failure does not match a specifically handled case      | Inspect the error details securely                       |

### Recommended Practices

* Give developers actionable error messages.
* Never print API keys or other secrets in error logs.
* Avoid retrying every failure indiscriminately.
* Use bounded retries with backoff for transient failures when appropriate.
* Check the underlying error details during development, while avoiding the exposure of sensitive information.

### Testing Error Handling

The project's automated tests use simulated errors to verify that the error handler produces the expected messages.

These tests verify local error-handling behaviour; they do not establish that a live API request will succeed.

## Testing the Integration

Testing helps verify that the SDK integration behaves as expected and that common failure cases are handled clearly.

### Run the Automated Tests

From the project root, run:

```bash
npm test
```

The test suite uses Node.js's built-in test runner to check the application's behaviour.

### What the Tests Cover

The current tests verify that:

* The application reports a missing API key.
* Common SDK errors are converted into helpful messages.
* Unknown errors receive a generic fallback message.
* The greeting function returns the text from a successful mocked SDK response.

### Understand the Limitations

The tests use simulated responses and errors. They do not send real requests to the OpenAI API.

A passing test suite confirms the behaviour covered by those tests, but it does not verify API credentials, account permissions, model availability, network connectivity, or live API responses.

### Before Testing Against the Live API

Once you have a valid API key, you can run the application using the instructions in [QUICKSTART.md](QUICKSTART.md).

Confirm that your credentials are configured securely and that the selected model is available to your account before making a live request.
