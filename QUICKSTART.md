# OpenAI Node.js SDK Quickstart

This guide walks you through setting up the OpenAI Node.js SDK, protecting your API key, running a simple example, and troubleshooting common errors.

This practice project demonstrates SDK setup, local error handling, and automated testing. You do not need a real API key to install dependencies or run the tests.

## Choose Your Path

This guide supports two ways to get started:

* **Use the existing project:** If you have cloned this repository, follow the prerequisites, install the dependencies, and run the example and automated tests.
* **Build from scratch:** If you want to create the example yourself, follow the project setup, configuration, and code sections in order. You will also need to create the `error-handler.js` and `index.test.js` files described below.

## Prerequisites

Before you begin, make sure you have:

* **Node.js:** Version 22 or later. Check the [OpenAI Node.js SDK README](https://github.com/openai/openai-node) for the currently supported Node.js versions.
* **npm:** Included with Node.js.
* **An OpenAI API key:** Required only if you want to make a live API request.

Check your installed versions:

```bash
node --version
npm --version
```

**Note:** You can install dependencies and run the local tests without a real API key. A valid API key is required to make a live API request.

## 1. Create a Project

If you are building the example from scratch, create a project folder and initialize it:

```bash
mkdir openai-sdk-docs-practice
cd openai-sdk-docs-practice
npm init -y
```

If you have already cloned this repository, open its existing folder instead of creating another project.

## 2. Install the Dependencies

Install the OpenAI SDK and `dotenv`, which loads environment variables from a `.env` file:

```bash
npm install openai dotenv
```

This project uses Node.js's built-in test runner, so you do not need to install a separate testing framework.

If you cloned the repository, use its existing `package.json` and lockfile rather than recreating the project configuration.

## 3. Configure Your Project

Open `package.json`.

Make sure the following property appears at the top level:

```json
"type": "module"
```

Inside the existing `scripts` object, make sure you have:

```json
"start": "node index.js",
"test": "node --test"
```

Keep any other existing scripts and dependencies. Ensure that commas and braces are correctly placed so the file remains valid JSON.

The `"type": "module"` setting allows the project to use JavaScript's `import` syntax.

The project should also declare its minimum Node.js version:

```json
"engines": {
  "node": ">=22.0.0"
}
```

This specifies the minimum Node.js version declared by the project. It does not guarantee that every Node.js release at or above that version is officially supported by the OpenAI SDK.

## 4. Configure Your API Key Securely

Create a file named `.env` in the project root:

```text
OPENAI_API_KEY=your_api_key_here
```

The value above is a placeholder, not a real API key. Replace it with a valid key only when you are ready to make a live API request.

Create a `.gitignore` file in the project root if one does not already exist:

```text
.env
node_modules/
```

**Keep your API key private.**

* Never commit your `.env` file to Git.
* Never publish your API key in screenshots, messages, or public repositories.
* Never expose a secret API key in browser-side code.
* If a real key is accidentally exposed, revoke it and create a replacement.

The practice project includes a safeguard that detects a missing or placeholder API key before attempting an API request.

## 5. Create the SDK Example

Create a file named `index.js` in the project root and add the following code:

```javascript
import "dotenv/config";
import OpenAI from "openai";
import { getErrorMessage } from "./error-handler.js";

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    console.error(
      "Missing API key. Add a valid OPENAI_API_KEY to your .env file."
    );
    process.exitCode = 1;
    return;
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model: "gpt-5.5",
    input: "Write a friendly one-sentence greeting.",
  });

  console.log(response.output_text);
}

main().catch((error) => {
  console.error(getErrorMessage(error));
  process.exitCode = 1;
});
```

This example uses `error-handler.js` to convert common API errors into more helpful messages. Make sure that file exists in the project root and exports a `getErrorMessage` function.

### How the Example Works

* `import "dotenv/config"` loads environment variables from `.env`.
* The API key check stops execution if the key is missing or still contains the placeholder.
* `new OpenAI({ apiKey })` creates an SDK client using the supplied key.
* `client.responses.create()` sends a request to the Responses API.
* `model` specifies the model requested.
* `input` contains the prompt sent to the model.
* `response.output_text` provides the generated text.
* The error handler displays a helpful message if the request fails and sets a non-zero exit code.

The configured model must be available to your API project, and your credentials must have the necessary permissions.

### Required Supporting Files

When building from scratch, create the supporting files used by the example and tests:

* `error-handler.js` — Exports `getErrorMessage` and handles the error categories covered by the tests.
* `index.test.js` — Contains six local tests covering missing credentials and error handling.

If you are using the existing repository, these files should already be included.

## 6. Run the Example

In your terminal, run:

```bash
npm start
```

### If You Have Not Configured a Real API Key

The program should display:

```text
Missing API key. Add a valid OPENAI_API_KEY to your .env file.
```

It stops before sending an API request and sets the exit code to `1`.

**This missing-key behavior has been verified in the practice project.**

### If You Have a Valid API Key

With a valid API key, the necessary permissions, and access to the configured model, the program should send a request and print the generated greeting.

**A successful live API request has not yet been verified in this project.**

Real API requests may incur charges. Check your API access and billing before making one.

## 7. Run the Automated Tests

The project includes local tests for the missing-key check and common error messages.

Run:

```bash
npm test
```

The six tests cover:

1. Missing or placeholder API key.
2. Authentication errors.
3. Permission errors.
4. Rate-limit or quota errors.
5. Connection errors.
6. Unknown errors.

The tests run locally without making a live API request or incurring API usage charges.

A successful run should report results equivalent to:

```text
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

The exact output format may vary by Node.js version.

Passing these tests confirms that the tested local error-handling behavior works. It does not confirm that a live API request succeeds.

## 8. Troubleshooting

### Missing API Key

Check that:

* `.env` is in the project root.
* The variable is named `OPENAI_API_KEY`.
* You have replaced the placeholder with a valid key when making a live request.
* The file is named `.env`, not `.env.txt`.
* `.env` is not committed to Git.

The program checks for a missing or placeholder key before sending a request.

### `npm start` Does Not Work

Check that:

* You are in the correct project folder.
* `index.js` exists in the project root.
* `package.json` contains `"start": "node index.js"` inside `scripts`.
* Node.js and npm are installed.
* You have installed the project dependencies.

### Authentication Error

Your API key may be invalid, expired, or revoked.

* Check that the key is correct and active.
* Confirm that the application loads the key from `.env`.
* Make sure the key has not been copied incorrectly.

### Permission Error

Check whether your API key and project have permission to make the requested API call. Also confirm that the configured model is available to your project.

### Rate-Limit or Quota Error

This error may mean that requests are arriving too quickly or that a usage limit has been reached.

* Check the error details.
* Reduce request frequency if you are hitting a rate limit.
* Review usage and billing settings if the error indicates a quota or spending limit.

### Connection Error

Check your internet connection, network or proxy settings, and firewall configuration. If the issue persists, try again later.

### Another API Request Error

Check the error message and request configuration. Confirm that the model is available to your project and that the request uses supported parameters.

### Unsupported Node.js Version

Check the [OpenAI Node.js SDK README](https://github.com/openai/openai-node) for the currently supported Node.js versions. Upgrade to a supported version if necessary.

### Automated Tests Fail

Run:

```bash
npm test
```

Read the failing test's error message and compare it with the expected behavior. The tests check local error handling and do not require a real API key.

## 9. What Success Looks Like

You have completed the local setup and verification when you can:

* Install the required dependencies.
* Configure an API key without exposing it.
* Run `npm start` and understand the expected missing-key behavior when no real key is configured.
* Explain the difference between a missing-key check and a live API request.
* Run all six automated tests successfully.
* Find guidance for common errors without guessing what to do next.

A successful live API request additionally requires valid credentials, suitable permissions, and access to the configured model. It has not been verified as part of this practice project.

## Official References

* [OpenAI Node.js SDK repository](https://github.com/openai/openai-node)
* [OpenAI API Quickstart](https://developers.openai.com/api/docs/quickstart)
* [OpenAI SDK authentication guide](https://github.com/openai/openai-node/blob/main/docs/authentication.md)
