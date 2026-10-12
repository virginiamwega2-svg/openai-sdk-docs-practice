# Troubleshooting

This guide helps developers diagnose common setup and API errors when using the OpenAI SDK in this practice project.

## 1. Missing API key

**Symptom**

The application displays:

`Missing API key. Add a valid OPENAI_API_KEY to your .env file.`

**Cause**

The API key is missing, or the `.env` file still contains the placeholder value.

**How to fix it**

1. Create or open the `.env` file in the project root.
2. Set `OPENAI_API_KEY` to a valid API key.
3. Save the file and run `npm start` again.

Never commit your real API key to GitHub.

## 2. Authentication error

**Symptom**

The application reports that authentication failed.

**Cause**

The API key may be invalid, incorrectly copied, revoked, or unavailable to the request.

**How to fix it**

1. Check that the environment variable contains the correct key.
2. Make sure there are no accidental spaces or quotation marks around the value.
3. Confirm that the key is active.
4. Retry the request.

Do not share your API key when asking for help.

## 3. Permission or quota error

**Symptom**

The request fails with a permission, rate-limit, or quota-related message.

**Cause**

The API key may lack the required permissions, the selected project may not have access to the requested model, or the account may have reached a usage limit.

**How to fix it**

1. Check that your API key has the required permissions and that the selected project has access to the requested model.
2. Review your usage limits and billing settings.
3. If the issue persists, consult the official OpenAI API documentation.

## 4. Connection error

**Symptom**

The request fails because the application cannot connect to the API.

**Cause**

The network may be unavailable, or a connection-related failure may have occurred.

**How to fix it**

1. Check your internet connection.
2. Retry after a short wait.
3. If the issue continues, check the API's status and your network configuration.

The current error handler provides a specific message for `APIConnectionError`. Other connection-related failures may use the general fallback message.

## 5. Other request errors

**Symptom**

The application displays:

`The request failed. Check your configuration and try again.`

**Cause**

The error does not match one of the specific error types handled by this project.

**How to fix it**

1. Confirm that your environment variables and project configuration are correct.
2. Review the terminal output and any available error details.
3. Consult the official OpenAI API documentation if the problem persists.

This project uses a general fallback message for unexpected errors. It does not provide a separate message for every possible API failure.

## Scope of this guide

The local tests verify the project's missing-key message and error-handling logic. They do not make live API requests or verify that a real API key, model, or account has access to the API.
