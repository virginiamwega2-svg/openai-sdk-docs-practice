# OpenAI Node.js SDK Quickstart

This guide shows you how to set up the OpenAI Node.js SDK, protect your API key, run a simple example, and troubleshoot common errors.

The example includes local error handling and automated tests. You do not need a real  API key to run the tests.

## Choose your path

This guide supports two ways to get started:

* **Use the existing project:** If you cloned this repository, continue to the prerequisites, install the dependencies with `npm install`, and follow the sections on running the example and automated tests. The project files and configuration are already included.
* **Build from scratch:** If you want to create the example yourself, follow the project creation, dependency installation, configuration, and code sections in order.

You do not need a real API key to run the local automated tests or verify the missing-key behavior.

## Prerequisites

Before you begin, make sure you have:

* [Node.js](https://nodejs.org/) installed. Check the [OpenAI Node.js SDK README](https://github.com/openai/openai-node) for supported versions.
* npm installed.
* An OpenAI API key if you want to make a real API request.

Check your installed versions:

```bash
node --version
npm --version
```

## 1. Create a project

Create a project folder and initialize it:

```bash
mkdir openai-sdk-docs-practice
cd openai-sdk-docs-practice
npm init -y
```

If you already have this project, open its existing folder instead of creating another one.

## 2. Install the dependencies

Install the OpenAI SDK and `dotenv`, which loads environment variables from a `.env` file:

```bash
npm install openai dotenv
```

The practice project also uses Node.js's built-in test runner, so no separate test framework is needed. The tests use the `openai` package to check how common SDK errors are handled.


## 3. Configure your project

Open `package.json`.

Make sure it includes:

```json
"type": "module"
```

Inside the existing `scripts` object, add:

```json
"start": "node index.js"
```

Keep any existing scripts and dependencies.

The `"type": "module"` setting allows the project to use JavaScript's `import` syntax.

## 4. Configure your API key securely

Create a file named `.env` in the project root:

```text
OPENAI_API_KEY=your_api_key_here
```

The placeholder is not a real API key. Replace it with a valid key only when you are ready to make a real API request.

Create a `.gitignore` file in the project root:

```text
.env
node_modules/
```

**Keep your API key private.**

* Never commit your `.env` file to Git.
* Never publish your API key in screenshots, messages, or public repositories.
* Never expose a secret API key in browser-side code.

## 5. Create the SDK example

Create a file named `index.js` in the project root.

Add the following code:

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

This example uses `error-handler.js` to turn common API errors into more helpful messages. Make sure that file is present in your project.

### How the example works

* `import "dotenv/config"` loads the variables stored in `.env`.
* The API-key check stops the program if the key is missing or still contains the placeholder.
* `new OpenAI({ apiKey })` creates an SDK client using the key.
* `client.responses.create()` sends a request to the Responses API.
* `model` specifies the model requested.
* `input` contains the message sent to the model.
* `response.output_text` provides the generated text.
* The error handler displays a useful message if the request fails and sets a non-zero exit code.

## 6. Run the example

In your terminal, run:

```bash
npm start
```

### If you have not configured a real API key

The program should display:

```text
Missing API key. Add a valid OPENAI_API_KEY to your .env file.
```

It stops before sending an API request and sets the exit code to `1`.

We have verified this behavior in the practice project.

### If you have a valid API key

With a valid API key, the necessary permissions, and access to the configured model, the program should send a request and print the generated greeting.

The successful live request has not been verified in this project.

**Note:** Real API requests may incur charges. Check your API access and billing before making one.

## 7. Run the automated tests

The project includes local tests for the missing-key check and common error messages.

Run:

```bash
npm test
```

The tests cover:

1. Missing or placeholder API key.
2. Authentication errors.
3. Permission errors.
4. Rate-limit errors.
5. Connection errors.
6. Unknown errors.

The tests run locally without making a real or paid API request.

A successful run should report:

```text
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

Passing these tests confirms that the tested local error-handling behavior works. It does not confirm that a live API request succeeds.

## 8. Troubleshooting

### Missing API key

Check that:

* `.env` is in the project root.
* The variable is named `OPENAI_API_KEY`.
* You have replaced the placeholder with a valid key when making a real request.
* The file is named `.env`, not `.env.txt`.
* `.env` is not committed to Git.

The program checks for a missing or placeholder key before sending a request.

### `npm start` does not work

Check that:

* You are in the correct project folder.
* `index.js` exists in the project root.
* `package.json` contains `"start": "node index.js"` inside `scripts`.
* Node.js and npm are installed.

### Authentication error

Your API key may be invalid, expired, or revoked.

* Check that the key is correct and active.
* Confirm that the application loads the key from `.env`.
* Make sure the key has not been copied incorrectly.

### Permission error

Check whether your API key and project have permission to make the requested API call. Also confirm that the model is available to your project.

### Rate-limit or quota error

This error may mean that requests are arriving too quickly or that a usage limit has been reached.

* Check the error details.
* Reduce request frequency if you are hitting a rate limit.
* Review usage and billing settings if the error indicates a quota or spending limit.

### Connection error

Check your internet connection, network or proxy settings, and firewall configuration. If the issue persists, try again later.

### Another API request error

Check the error message and request configuration. Confirm that the model is available to your project and that the request uses supported parameters.

### Unsupported Node.js version

Check the [OpenAI Node.js SDK README](https://github.com/openai/openai-node) for the currently supported Node.js versions.

### Automated tests fail

Run:

```bash
npm test
```

Read the failing test's error message and compare it with the expected behavior. The tests are designed to check local error handling; they do not require a real API key.

## 9. What success looks like

You have completed the setup when you can:

* Install the required dependencies.
* Configure an API key without exposing it.
* Run `npm start`.
* Understand the difference between a missing-key check and a real API request.
* Run the six automated tests successfully.
* Find guidance for common errors without guessing what to do next.

A successful live API request requires valid credentials, suitable permissions, and access to the configured model. It has not been verified as part of this practice project.

## Official references

* [OpenAI Node.js SDK repository](https://github.com/openai/openai-node)
* [OpenAI API Quickstart](https://developers.openai.com/api/docs/quickstart)
* [OpenAI SDK authentication guide](https://github.com/openai/openai-node/blob/main/docs/authentication.md)
