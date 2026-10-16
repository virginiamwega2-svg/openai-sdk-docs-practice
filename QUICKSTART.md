# OpenAI Node.js SDK Quickstart

This guide walks you through setting up the OpenAI JavaScript SDK, protecting your API key, running a simple example, and testing common success and failure scenarios.

This practice project demonstrates SDK integration, developer onboarding, error handling, and automated testing. You can install dependencies and run all local tests without a real API key.

## Choose Your Path

* **Use the existing project:** Install dependencies, configure your environment, run the example, and execute the tests.
* **Build from scratch:** Follow the setup and code sections in order, including the supporting error handler and test files.

## Prerequisites

Before you begin, make sure you have:

* **Node.js 22 or later:** This is the minimum version declared by this practice project. Check the [OpenAI Node.js SDK repository](https://github.com/openai/openai-node) for current SDK requirements.
* **npm:** Included with Node.js.
* **An OpenAI API key:** Required only for live API requests.

Check your installed versions:

```bash
node --version
npm --version
```

You can install dependencies and run local tests without a real API key.

## 1. Create or Open the Project

### Using the existing repository

Open your cloned `openai-sdk-docs-practice` folder in VS Code or navigate to it in your terminal.

### Building from scratch

Create a project folder and initialize it:

```bash
mkdir openai-sdk-docs-practice
cd openai-sdk-docs-practice
npm init -y
```

If you cloned the repository, do not initialize a new project or replace its existing configuration.

## 2. Install the Dependencies

If you are building from scratch, install the OpenAI SDK and `dotenv`:

```bash
npm install openai dotenv
```

The `dotenv` package loads environment variables from your `.env` file.

This project uses Node.js's built-in test runner, so a separate testing framework is not required.

If you cloned the repository and its `package-lock.json` file is present, run:

```bash
npm ci
```

This installs the exact dependency versions recorded in the lockfile, helping ensure a reproducible setup. Note that `npm ci` removes the existing `node_modules` directory before installing dependencies.

For an existing project, use `npm install` when you intentionally need to update dependencies or regenerate the lockfile.

## 3. Configure the Project

Open `package.json`.

Ensure that the following properties are present at the top level:

```json
{
  "type": "module",
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "start": "node index.js",
    "test": "node --test"
  }
}
```

This is an illustrative configuration snippet, not a complete replacement for your existing `package.json`. Preserve your project's name, dependencies, and other configuration.

The `type` property enables JavaScript ES modules. The `start` script runs the example, while the `test` script runs the local automated tests.

**Important:** If you are using the existing repository, follow the scripts already defined in its `package.json`. Do not replace a working configuration just to match this example.

## 4. Configure Your API Key Securely

Create a file named `.env` in the project root:

```text
OPENAI_API_KEY=your_api_key_here
```

The value above is a placeholder, not a real API key. Replace it with a valid key only when you are ready to make a live API request.

Ensure that `.gitignore` includes:

```text
.env
node_modules/
```

If `.gitignore` already exists, add these entries without removing its other rules.

### Keep your API key private

* Never commit your `.env` file or a real API key to Git.
* Never publish your key in screenshots, messages, or public repositories.
* Never expose a secret API key in browser-side code.
* If a real key is accidentally exposed, revoke it and create a replacement.

The example checks for a missing or placeholder API key before attempting a request. This is a useful safeguard, but it does not replace secure secret management.

## 5. Understand the Existing SDK Implementation

If you are using the existing repository, you do not need to recreate `index.js`. The project already includes the CLI implementation, SDK integration, input validation, and error handling for the `greet`, `summarize`, and `stream` commands.

Read the existing `index.js` to understand how the application initializes the OpenAI SDK, validates inputs, handles errors, and processes API responses.

The simplified example below illustrates the greeting request flow. It is a learning example, not a complete replacement for the repository's implementation. If you are building from scratch, follow the example and create the required supporting files, then add the summarization command and its validation before expecting the full CLI behavior documented in Section 6.


```javascript
import "dotenv/config";
import OpenAI from "openai";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getErrorMessage } from "./error-handler.js";

export async function generateGreeting(client) {
  const response = await client.responses.create({
    model: "gpt-5.5",
    input: "Write a friendly one-sentence greeting.",
  });

  return response.output_text;
}

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
  const greeting = await generateGreeting(client);

  console.log(greeting);
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(getErrorMessage(error));
    process.exitCode = 1;
  });
}
```

This example uses the OpenAI Responses API to request a short greeting. It relies on `error-handler.js` to translate recognized API errors into clearer messages.

Ensure that the configured model is available to your API project and that your credentials have the required access.

### How the example works

* `import "dotenv/config"` loads environment variables from `.env`.
* The API key check stops execution if the key is missing or still contains the placeholder.
* `new OpenAI({ apiKey })` creates an SDK client using the supplied key.
* `generateGreeting(client)` sends a request through the SDK and returns the generated text.
* `client.responses.create()` calls the Responses API.
* `model` identifies the requested model.
* `input` contains the prompt sent to the model.
* `response.output_text` provides the generated text.
* `pathToFileURL()` and `resolve()` help determine whether the file is being run directly, including on Windows.
* The error handler displays a user-friendly message when a request fails.

Setting `process.exitCode = 1` indicates failure to the operating system without immediately terminating the process.

### Required supporting files

The complete practice project includes:

* **`error-handler.js`** — Exports `getErrorMessage` and handles the error categories covered by the tests.
* **`index.test.js`** — Contains 12 local tests covering CLI validation, SDK error handling, mocked successful responses, and summarization input validation.


When building from scratch, create these files as well. The example will not run correctly without its imported error handler.

If you are using the existing repository, these files should already be included.

## 6. Run the Example

This project supports three commands: `greet`, `summarize`, and `stream`.

### Run the greeting example

To generate a friendly greeting, run:

```powershell
npm start
```

You can also specify the command explicitly:

```powershell
node index.js greet
```

If you have not configured a valid API key, the program should display:

```text
Missing API key. Add a valid OPENAI_API_KEY to your .env file.
```

It stops before making an API request and sets a non-zero exit code.

### Run the summarization example

Pass the text you want to summarize in quotation marks:

```powershell
node index.js summarize "Developer documentation helps developers understand and use software independently."
```

The program sends the supplied text to the configured model and prints the returned summary.

### Run the streaming example

To display generated text incrementally as the model produces it, run:

```powershell
node index.js stream "Explain how an API works"
```

The program writes text fragments to the terminal as they arrive, then prints a newline when streaming finishes.

The streaming command requires a valid `OPENAI_API_KEY`, access to the configured model, and a working network connection.

Local tests cover streaming behavior without requiring a live API request.
If the prompt is missing, the program displays usage guidance and exits with a non-zero exit code.

### Understand input validation

Try running the summarization command without text:

```powershell
node index.js summarize
```

The program should display usage guidance and exit with a non-zero exit code without making an API request.

Try an unsupported command:

```powershell
node index.js unknown
```

The program should explain that the supported commands are `greet`, `summarize`, and `stream`, then exit with a non-zero exit code.

### API key and live execution

Local validation and automated tests do not require a valid API key. Live greeting and summarization requests do.

A successful live API request has **not yet been verified** in this project. Live execution depends on valid credentials, API access, model availability, account configuration, and network connectivity.

Live API requests may incur charges. Check your API access and applicable pricing before making one.


## 7. Run the Automated Tests

Run the local test suite:

```bash
npm test
```
The **26 automated tests** cover:

- CLI validation and helpful error messages.
- SDK error handling for authentication, permissions, rate limits, connection failures, and unexpected errors.
- Mocked successful greeting and summarization requests.
- Summarization input validation.
- Streaming behavior, including text fragments, ignored non-text events, invalid inputs, and error propagation.
- Observability metrics, including handling failures in the metrics callback.
- Documentation link validation, including valid links, missing targets, and links that escape the project directory.

The tests run locally without making live API requests.

A successful run should report results equivalent to:

```text
ℹ tests 26
ℹ pass 26
ℹ fail 0
```

The exact output format may vary by Node.js version.

**Verified locally:** All 26 tests passed in the latest recorded test run. This confirms the tested local behavior, not the success of a live API request.

The successful-response test uses a mock client that returns a response-shaped object. It verifies how `generateGreeting()` handles that object; it does not verify the live OpenAI SDK, network connectivity, or model access.

If a test fails, read the failure message and compare the actual behavior with the expected result before changing the implementation.

## 8. Troubleshooting

### Missing API key

Check that:

* `.env` is in the project root.
* The variable is named `OPENAI_API_KEY`.
* The file is named `.env`, not `.env.txt`.
* You have replaced the placeholder with a valid key when making a live request.
* `.env` is not committed to Git.

The example checks for a missing or placeholder key before sending a request.

### `npm start` does not work

Check that:

* You are in the correct project directory.
* `index.js` exists in the project root.
* `package.json` defines `"start": "node index.js"` inside `scripts`.
* Node.js and npm are installed.
* You have installed the project dependencies.

You can bypass the `start` script and run `node index.js` directly.

### Authentication error

Your API key may be invalid, revoked, or otherwise unusable.

* Check that the key is valid and active.
* Confirm that the application loads the key from `.env`.
* Make sure the key was copied correctly.
* Never share the key when asking for help.

### Permission error

Check whether your API key and project have permission to make the requested API call. Confirm that the configured model is available to your project.

### Rate-limit or quota error

This may indicate that requests are arriving too quickly or that a usage or spending limit has been reached.

* Read the error details.
* Reduce request frequency if you are hitting a rate limit.
* Review usage and billing settings if the error indicates a quota or spending limit.

### Connection error

Check your internet connection, network or proxy settings, and firewall configuration. If the issue persists, try again later.

### Another API request error

Review the error message and request configuration. Confirm that the model is available to your project and that the request uses supported parameters.

### Unsupported Node.js version

Check the [OpenAI Node.js SDK repository](https://github.com/openai/openai-node) for the SDK's current Node.js requirements. Upgrade to a supported version if necessary.

### Automated tests fail

Run:

```bash
npm test
```

Read the failing test's output and compare the actual behavior with the expected result. The local tests do not require a real API key.

## 9. What Success Looks Like

You have completed the local setup and verification when you can:

* Install the project's dependencies.
* Configure an API key without exposing it.
* Run the example and understand its missing-key behavior.
* Explain the difference between a local validation check, a mocked response, and a live API request.
* Run all 26 automated tests successfully.
* Find guidance for common errors and understand the next troubleshooting step.

A successful live API request additionally requires valid credentials, suitable permissions, access to the configured model, and working network connectivity. Live API success has not been verified as part of this practice project.

## Official References

* [OpenAI Node.js SDK repository](https://github.com/openai/openai-node)
* [OpenAI API Quickstart](https://developers.openai.com/api/docs/quickstart)
* [OpenAI SDK authentication guide](https://github.com/openai/openai-node/blob/main/docs/authentication.md)
