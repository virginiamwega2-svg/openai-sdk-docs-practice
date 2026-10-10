import OpenAI from "openai";

export function getErrorMessage(error) {
  if (error instanceof OpenAI.AuthenticationError) {
    return "Authentication failed. Check that your API key is valid.";
  }

  if (error instanceof OpenAI.PermissionDeniedError) {
    return "Permission denied. Check your API key permissions and project access.";
  }

  if (error instanceof OpenAI.RateLimitError) {
    return "Rate limit or quota issue. Check your usage limits and billing settings.";
  }

  if (error instanceof OpenAI.APIConnectionError) {
    return "Connection failed. Check your network connection and try again.";
  }

  return "The request failed. Check your configuration and try again.";
}