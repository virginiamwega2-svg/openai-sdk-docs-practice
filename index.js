
import "dotenv/config";
import OpenAI from "openai";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getErrorMessage } from "./error-handler.js";

const MODEL = "gpt-5.5";

export async function generateGreeting(client) {
  const response = await client.responses.create({
    model: MODEL,
    input: "Write a friendly one-sentence greeting.",
  });

  return response.output_text;
}

export async function summarizeText(client, text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Text to summarize is required.");
  }

  const response = await client.responses.create({
    model: MODEL,
    input: `Summarize the following text clearly and concisely:\n\n${text}`,
  });

  return response.output_text;
}

async function main() {
  const [command = "greet", ...args] = process.argv.slice(2);

  if (command !== "greet" && command !== "summarize") {
    console.error('Unknown command. Use "greet" or "summarize".');
    process.exitCode = 1;
    return;
  }

  const text = args.join(" ").trim();

  if (command === "summarize" && !text) {
    console.error(
      'Please provide text to summarize. Example: node index.js summarize "Your text here"'
    );
    process.exitCode = 1;
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    console.error(
      "Missing API key. Add a valid OPENAI_API_KEY to your .env file."
    );
    process.exitCode = 1;
    return;
  }

  const client = new OpenAI({ apiKey });

  if (command === "summarize") {
    const summary = await summarizeText(client, text);
    console.log(summary);
    return;
  }

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