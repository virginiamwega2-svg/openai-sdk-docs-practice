# OpenAI Node.js SDK QuickStart

This guide walks you through setting up the OpenAI Node.js SDK, configuring your API key securely, and running your first request.

## Prerequisites

Before you begin, make sure you have:

* [Node.js](https://nodejs.org/) installed. Use a supported Node.js version listed in the [OpenAI Node.js SDK README](https://github.com/openai/openai-node).
* npm installed.
* An OpenAI API key for making real API requests.

Check your installed versions:

```bash
node --version
npm --version
```

## 1. Create a project

Create a new folder for your project, open it in your terminal, and initialize it:

```bash
mkdir openai-sdk-docs-practice
cd openai-sdk-docs-practice
npm init -y
```

If you already have a project folder, navigate into it instead of creating another one.

## 2. Install the dependencies

Install the OpenAI SDK and the package used to load environment variables:

```bash
npm install openai dotenv
```

## 3. Configure your project

Open `package.json` and ensure it includes:

```json
"type": "module"
```

Inside the existing `scripts` object, add the following entry:

```json
"start": "node index.js"
```

Keep any other existing scripts and dependencies.

Your project will use ES modules, which support the `import` syntax used in this guide.

## 4. Configure your API key securely

Create a file named `.env` in the project root:

```text
OPENAI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key when you are ready to make a real request.

**Security rules:**

* Never share your API key in public repositories, screenshots, or messages.
* Never expose secret API keys in browser-side code.
* Do not commit your `.env` file to Git.

Create a `.gitignore` file in the project root containing:

```text
.env
node_modules/
```

## 5. Create the first SDK example

Create a file named `index.js` in the project root.

Add the following code:

```javascript
import "dotenv/config";

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    console.error(
      "Missing API key. Add a valid OPENAI_API_KEY to your .env file."
    );
    process.exitCode = 1;
    return;
  }

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model: "gpt-5.5",
    input: "Write a friendly one-sentence greeting.",
  });

  console.log(response.output_text);
}

main().catch((error) => {
  console.error(
    "The request failed. Check your API key, model access, and network connection."
  );
  console.error(error.message);
  process.exitCode = 1;
});
```

### How the example works

* `import "dotenv/config"` loads environment variables from `.env`.
* The API-key check prevents the example from sending a request when the key is missing or still uses the placeholder.
* The OpenAI client provides methods for interacting with the API.
* `client.responses.create()` sends a request to the Responses API.
* `response.output_text` retrieves the generated text.
* The error handler reports a failed request and sets a non-zero exit code.

## 6. Run the example

In your project terminal, execute:

```bash
npm start
```

### Expected behavior without a real API key

If the key is missing or still uses the placeholder, the example prints:

```text
Missing API key. Add a valid OPENAI_API_KEY to your .env file.
```

It stops before making an API request and exits with status code `1`.

We verified this behavior in the practice project.

### Expected behavior with a valid API key

With a valid API key and access to the configured model, the example should send a request and print a friendly one-sentence greeting.

API usage may incur charges. Check your account's API access and billing before making a real request.
## 7. Run the automated tests

You can verify the missing-API-key behavior without making an API request or needing a real API key.

Run:

```bash
npm test
```

The test checks that the application exits with status code `1` and displays a helpful error message when the API key is missing or still uses the placeholder.

A successful test run should report **1 passing test and 0 failures**.

**Note:** This test verifies the missing-key error path. It does not verify a successful API request.

## 8. Troubleshooting

### Missing API key

Check that:

* The `.env` file is in the project root.
* The variable is named `OPENAI_API_KEY`.
* You have replaced the placeholder with a valid API key.
* The file is named `.env`, not `.env.txt`.
* The `.env` file is not committed to Git.

The application checks for a missing or placeholder key before sending a request.

### `npm start` does not work

Check that:

* You are in the correct project folder.
* `index.js` exists in the project root.
* `package.json` contains `"start": "node index.js"` inside its `scripts` object.
* Node.js and npm are installed.

### Authentication error

The API key may be invalid, expired, or revoked.

* Check that the key is correct and active.
* Confirm that the key is loaded from your `.env` file.
* Make sure you have not accidentally added extra spaces.

### Permission error

Check whether your API key, project, and account have the permissions required for the request.

### Rate limit or quota error

A rate-limit error can indicate that requests are arriving too quickly or that a usage or billing limit has been reached.

* Check the error details to identify the cause.
* Reduce request frequency if you are exceeding a rate limit.
* Check your API usage and billing settings if the error indicates a quota or spending limit.

### Connection error

Check your internet connection, network or proxy configuration, and firewall settings. If the problem persists, try again later.

### The API request fails for another reason

Check the error category and your request configuration. Confirm that the requested model is available to your project and that the request uses the expected parameters.

### Unsupported Node.js version

Check the official [OpenAI Node.js SDK README](https://github.com/openai/openai-node) for supported Node.js versions.

### Automated tests

Run:

```bash
npm test
```

The tests verify the missing-key behavior and the error-message handling for authentication, permission, rate-limit, connection, and unknown errors. They run locally without making a paid API request.

Passing these tests does not verify that a real API request succeeds.

## 9. What success looks like

You have completed the QuickStart when you can:

* Install the SDK and its required dependencies.
* Configure your API key without exposing it.
* Run `npm start`.
* Receive a response from the API when valid credentials and model access are available.
* Understand what to check when the example fails.

## Official references

* [OpenAI Node.js SDK repository](https://github.com/openai/openai-node)
* [OpenAI API Quickstart](https://developers.openai.com/api/docs/quickstart)
* [OpenAI SDK authentication guide](https://github.com/openai/openai-node/blob/main/docs/authentication.md)
