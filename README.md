# OpenAI SDK Documentation Practice

A hands-on project exploring the developer experience of using the OpenAI JavaScript SDK. It focuses on setup instructions, API key handling, error messages, troubleshooting, and automated tests.

## What this project demonstrates

* Setting up a Node.js project with the OpenAI SDK.
* Configuring environment variables securely with `dotenv`.
* Making a request using the OpenAI Responses API.
* Providing helpful error messages for common failures.
* Writing local tests without making live API requests.

## Getting started

### Prerequisites

* Node.js and npm installed.
* A code editor such as VS Code.

**Note:** You do not need a real OpenAI API key to install the dependencies or run the local tests. A valid API key is required only if you want to make a live API request.



### 1. Install dependencies

```bash
npm install
```

### 2. Configure your environment

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_api_key_here
```

Replace the placeholder with a valid API key only if you intend to make a live API request.

**Security:** Never commit your real API key to GitHub.

### 3. Run the tests

```bash
npm test
```

The local test suite checks missing-key handling and error-message behavior without making live API requests.

### 4. Explore the documentation

* [Quickstart guide](./QUICKSTART.md)
* [Troubleshooting guide](./TROUBLESHOOTING.md)

## Project limitations

The local tests do not verify live API access, model availability, account permissions, or billing. A successful test run does not mean a live API request has succeeded.

## Why this project exists

The goal is to make SDK onboarding easier by testing instructions, anticipating common errors, and documenting practical ways for developers to recover when something goes wrong.
