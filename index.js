
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