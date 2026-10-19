import { withObservability } from "./observability.js";
import "dotenv/config";
import OpenAI from "openai";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getErrorMessage } from "./error-handler.js";
import { performance } from "node:perf_hooks";
const MODEL = "gpt-5.5";

// Add token usage to an existing observability metric when available.
function reportMetricsWithUsage(metric, usage, onMetric, span) {
  const tokenMetrics = {};

  const inputTokens = usage?.input_tokens;
  const outputTokens = usage?.output_tokens;
  const totalTokens = usage?.total_tokens;

  if (Number.isFinite(inputTokens)) {
    tokenMetrics.inputTokens = inputTokens;
  }

  if (Number.isFinite(outputTokens)) {
    tokenMetrics.outputTokens = outputTokens;
  }

  if (Number.isFinite(totalTokens)) {
    tokenMetrics.totalTokens = totalTokens;
  }

  // Standard GPT-5.5 text-token prices in USD per million tokens.
  const pricing = {
    input: 5,
    cachedInput: 0.50,
    output: 30,
  };

  if (
    Number.isFinite(inputTokens) &&
    inputTokens >= 0 &&
    Number.isFinite(outputTokens) &&
    outputTokens >= 0
  ) {
    const reportedCachedTokens =
      usage?.input_tokens_details?.cached_tokens;

    const cachedInputTokens = Number.isFinite(reportedCachedTokens)
      ? Math.min(Math.max(reportedCachedTokens, 0), inputTokens)
      : 0;

    const uncachedInputTokens = inputTokens - cachedInputTokens;

    const estimatedCostUsd =
      (uncachedInputTokens * pricing.input) / 1_000_000 +
      (cachedInputTokens * pricing.cachedInput) / 1_000_000 +
      (outputTokens * pricing.output) / 1_000_000;

    tokenMetrics.estimatedCostUsd = Number(
      estimatedCostUsd.toFixed(12)
    );
  }
  if (span) {
    if (Number.isFinite(inputTokens)) {
      span.setAttribute("gen_ai.usage.input_tokens", inputTokens);
    }

    if (Number.isFinite(outputTokens)) {
      span.setAttribute("gen_ai.usage.output_tokens", outputTokens);
    }

    if (Number.isFinite(totalTokens)) {
      span.setAttribute("app.usage.total_tokens", totalTokens);
    }

    const reportedCachedTokens =
      usage?.input_tokens_details?.cached_tokens;

    if (
      Number.isFinite(inputTokens) &&
      Number.isFinite(reportedCachedTokens)
    ) {
      const cachedInputTokens = Math.min(
        Math.max(reportedCachedTokens, 0),
        inputTokens
      );

      span.setAttribute(
        "gen_ai.usage.cache_read.input_tokens",
        cachedInputTokens
      );
    }

    if (Number.isFinite(tokenMetrics.estimatedCostUsd)) {
      span.setAttribute(
        "app.cost.estimated_usd",
        tokenMetrics.estimatedCostUsd
      );
    }
  }
  onMetric({
    ...metric,
    ...tokenMetrics,
  });
}

// Shared wrapper for non-streaming Responses API operations.
function withResponseUsageMetrics(
  operationName,
  request,
  onMetric = console.log
) {
  let usage;

  return withObservability(
    operationName,
    async () => {
      const response = await request();
      usage = response.usage;

      return response.output_text;
    },
        (metric, span) =>
      reportMetricsWithUsage(metric, usage, onMetric, span)
  );
}

export async function generateGreeting(
  client,
  onMetric = console.log
) {
  return withResponseUsageMetrics(
    "generateGreeting",
    () =>
      client.responses.create({
        model: MODEL,
        input: "Write a friendly one-sentence greeting.",
      }),
    onMetric
  );
}

export async function summarizeText(
  client,
  text,
  onMetric = console.log
) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Text to summarize is required.");
  }

  return withResponseUsageMetrics(
    "summarizeText",
    () =>
      client.responses.create({
        model: MODEL,
        input: `Summarize the following text clearly and concisely:\n\n${text}`,
      }),
    onMetric
  );
}

export async function streamText(
  client,
  prompt,
  onText,
  onMetric = console.log
) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  if (typeof onText !== "function") {
    throw new Error("A text callback is required.");
  }

  let usage;
  let timeToFirstTokenMs;

  return withObservability(
    "streamText",
    async () => {
      const requestStartedAt = performance.now();

      const stream = await client.responses.create({
        model: MODEL,
        input: prompt,
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          if (
            timeToFirstTokenMs === undefined &&
            typeof event.delta === "string" &&
            event.delta.length > 0
          ) {
            timeToFirstTokenMs = Number(
              (performance.now() - requestStartedAt).toFixed(2)
            );
          }

          onText(event.delta);
        }

        if (event.type === "response.completed") {
          usage = event.response?.usage;
        }
      }
    },
    (metric, span) => {
      const enrichedMetric = {
        ...metric,
        ...(timeToFirstTokenMs !== undefined
          ? { timeToFirstTokenMs }
          : {}),
      };

      reportMetricsWithUsage(enrichedMetric, usage, onMetric, span);
    }
  );
}
async function main() {
  const [command = "greet", ...args] = process.argv.slice(2);

  if (!["greet", "summarize", "stream"].includes(command)) {
    console.error(
      'Unknown command. Use "greet", "summarize", or "stream".'
    );
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

  if (command === "stream" && !text) {
    console.error(
      'Please provide a prompt. Example: node index.js stream "Explain how an API works"'
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

  if (command === "stream") {
    await streamText(client, text, (chunk) => {
      process.stdout.write(chunk);
    });
    process.stdout.write("\n");
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