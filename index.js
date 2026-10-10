
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