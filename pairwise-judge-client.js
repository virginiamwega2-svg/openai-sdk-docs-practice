import "dotenv/config";
import OpenAI from "openai";
import { readFile } from "node:fs/promises";

import {
  PAIRWISE_JUDGE_JSON_SCHEMA,
  parseJudgeOutput,
} from "./pairwise-judge-output.js";

const DEFAULT_MODEL = "gpt-5.5";
const PROMPT_URL = new URL(
  "./PAIRWISE-JUDGE-PROMPT.md",
  import.meta.url,
);

const INPUT_FIELDS = [
  "sourceText",
  "criteria",
  "responseA",
  "responseB",
];

let cachedPromptTemplate;

async function loadPromptTemplate() {
  if (cachedPromptTemplate === undefined) {
    cachedPromptTemplate = await readFile(PROMPT_URL, "utf8");
  }

  return cachedPromptTemplate;
}

function validateInput(input) {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    throw new TypeError("Judge input must be an object.");
  }

  for (const field of INPUT_FIELDS) {
    const value = input[field];

    if (field === "criteria" && Array.isArray(value)) {
      if (
        value.length === 0 ||
        value.some(
          (item) =>
            typeof item !== "string" || !item.trim(),
        )
      ) {
        throw new TypeError(
          "Criteria must contain non-empty strings.",
        );
      }

      continue;
    }

    if (typeof value !== "string" || !value.trim()) {
      throw new TypeError(
        `${field} must be a non-empty string.`,
      );
    }
  }
}

export function renderPairwiseJudgePrompt(template, input) {
  if (typeof template !== "string" || !template.trim()) {
    throw new TypeError(
      "Prompt template must be a non-empty string.",
    );
  }

  validateInput(input);

  const missingPlaceholders = INPUT_FIELDS.filter(
    (field) => !template.includes(`{{${field}}}`),
  );

  if (missingPlaceholders.length > 0) {
    throw new TypeError(
      `Prompt template is missing placeholders: ${missingPlaceholders.join(", ")}.`,
    );
  }

  const values = {
    ...input,
    criteria: Array.isArray(input.criteria)
      ? input.criteria.map((item) => `- ${item}`).join("\n")
      : input.criteria,
  };

  return template.replace(
    /\{\{(sourceText|criteria|responseA|responseB)\}\}/g,
    (_, field) => values[field],
  );
}

export function createPairwiseJudge({
  client,
  model = process.env.OPENAI_JUDGE_MODEL || DEFAULT_MODEL,
  promptTemplate,
  clientFactory = (options) => new OpenAI(options),
} = {}) {
  if (typeof model !== "string" || !model.trim()) {
    throw new TypeError("Model must be a non-empty string.");
  }

  let activeClient = client;

  return async function judgePair(input) {
    validateInput(input);

    const template =
      promptTemplate ?? (await loadPromptTemplate());

    const prompt = renderPairwiseJudgePrompt(
      template,
      input,
    );

    if (!activeClient) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error(
          "OPENAI_API_KEY is required for live judging. Configure it in your environment before making an API request.",
        );
      }

      activeClient = clientFactory({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30_000,
        maxRetries: 0,
      });
    }

    const response = await activeClient.responses.create({
      model,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "pairwise_judge_result",
          description:
            "A structured evaluation comparing two candidate summaries.",
          strict: true,
          schema: PAIRWISE_JUDGE_JSON_SCHEMA,
        },
      },
    });

    if (
      typeof response?.output_text !== "string" ||
      !response.output_text.trim()
    ) {
      throw new Error(
        "The judge response did not contain text output.",
      );
    }

    return parseJudgeOutput(response.output_text);
  };
}
