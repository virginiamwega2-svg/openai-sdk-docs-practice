# OpenAI SDK Documentation Practice
[![Run Tests](https://github.com/virginiamwega2-svg/openai-sdk-docs-practice/actions/workflows/tests.yml/badge.svg)](https://github.com/virginiamwega2-svg/openai-sdk-docs-practice/actions/workflows/tests.yml)


A hands-on project exploring the developer experience of using the OpenAI JavaScript SDK. It focuses on developer onboarding, secure API key configuration, error handling, troubleshooting, and automated testing.

## What This Project Demonstrates

* Setting up a Node.js project with the OpenAI JavaScript SDK.
* Managing environment variables securely with `dotenv`.
* Making requests using the OpenAI Responses API.
* Providing clear, actionable error messages for common failures.
* Writing automated tests without making live API requests.
* Improving developer documentation through practical testing and iteration.

## Lightweight Operation Observability

The project includes a lightweight `withObservability()` helper that records basic metrics for asynchronous operations.

For each operation, it records:

- **Operation:** The name of the operation being measured.
- **Duration:** How long the operation takes, in milliseconds.
- **Status:** Whether the operation succeeds or throws an error.

The helper supports an optional metrics callback, allowing callers to customize how metrics are handled. By default, metrics are printed to the console.

The helper also prevents a metrics callback failure from changing the operation's result or replacing its original error.

**Current scope:** This is a lightweight, in-process helper. It does not provide persistent metric storage, distributed tracing, token usage or cost tracking, or production monitoring.

The behavior is covered by automated tests that verify successful operations, failures, and metrics callback errors without making live API requests.

## Getting Started

### Prerequisites

* Node.js 22 or later.
* npm.
* A code editor, such as Visual Studio Code.

**Note:** You do not need a real OpenAI API key to install dependencies or run the local tests. A valid API key is required only when making a live API request.

### 1. Install Dependencies

Clone the repository, navigate to the project directory, and install the dependencies:

```bash
npm ci
```

### 2. Configure Your Environment

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_api_key_here
```

Replace the placeholder with a valid API key only if you intend to make a live API request.

**Security:** Never commit your real API key to GitHub. Keep your `.env` file private.

**If you haven't configured an API key:** You can still install dependencies and run the automated tests. Running `npm start` or the live summarization example requires a valid `OPENAI_API_KEY`. Without one, the application displays a missing API key message and exits.

### 3. Run the Tests

Run the automated test suite:

```bash
npm test
```

The local tests verify missing API key handling and error-message behavior without making live API requests.


### 4. Run the Example

The project supports two commands:

**Generate a greeting**

```powershell
node index.js
```

**Summarize text**

```powershell
node index.js summarize "Developer documentation helps developers use software effectively."
```

Both commands make live API requests and require a valid OpenAI API key in your `.env` file, along with the necessary API access and configuration.

For input validation examples, see the [QuickStart Guide](./QUICKSTART.md).

**Note:** Live API requests may incur charges depending on your account and usage. The automated tests use mocks and do not require live API access.


### 5. Explore the Documentation

* [QuickStart Guide](./QUICKSTART.md) — Set up the project and run the example.
* [API Reference](./API-REFERENCE.md) — Review the exported functions, parameters, return values, validation, and error behaviour.
* [SDK Integration Guide](./SDK-INTEGRATION-GUIDE.md) — Understand how the OpenAI SDK is integrated and how the example works.
* [Troubleshooting Guide](./TROUBLESHOOTING.md) — Diagnose common issues and learn how to recover.
* [Validation Report](./VALIDATION-REPORT.md) — Review the checks performed to verify documentation against the implementation.
* [SDK Documentation Audit](./SDK-DOCUMENTATION-AUDIT.md) — Review documentation quality and opportunities to improve the developer experience.
* [AI Observability Guide](./AI-OBSERVABILITY-GUIDE.md) — Learn about AI request tracing, latency, token usage, costs, streaming failures, evaluation, and privacy.


## Project Limitations

The local tests do not verify live API access, model availability, account permissions, or billing.

**Passing the local tests does not guarantee that a live API request will succeed.** Live requests depend on valid credentials, API access, model availability, account configuration, and network connectivity.

## Why This Project Exists

The goal is to make SDK onboarding easier by testing documentation against the actual implementation, anticipating common errors, and helping developers understand how to recover when something goes wrong.

This project treats documentation as an essential part of the developer experience: instructions should be clear, examples should be usable, and errors should help developers take the next step.

## Continuous Integration

This project uses GitHub Actions to verify code behavior and documentation quality whenever changes are pushed to the repository or a pull request is opened.

The workflow performs two checks:

- **Automated tests:** Runs `npm test` to verify application behavior and catch regressions.
- **Documentation link check:** Runs `npm run check:docs` to identify broken local Markdown links and links that point outside the project directory.

### Run the checks locally

Run the automated tests:

```bash
npm test
```

Check local documentation links:

```bash
npm run check:docs
```

Both checks should pass before changes are pushed.

**Workflow:** `.github/workflows/tests.yml`
