export const PAIRWISE_JUDGE_JSON_SCHEMA = {
  type: "object",
  properties: {
    preference: {
      type: "string",
      enum: ["A", "B", "tie"],
    },
    responseAEvaluation: {
      type: "string",
    },
    responseBEvaluation: {
      type: "string",
    },
    rationale: {
      type: "string",
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
  },
  required: [
    "preference",
    "responseAEvaluation",
    "responseBEvaluation",
    "rationale",
    "confidence",
  ],
  additionalProperties: false,
};

const REQUIRED_FIELDS = Object.keys(
  PAIRWISE_JUDGE_JSON_SCHEMA.properties
).sort();

const ALLOWED_PREFERENCES = new Set(["A", "B", "tie"]);
const ALLOWED_CONFIDENCE = new Set(["low", "medium", "high"]);

export function parseJudgeOutput(outputText) {
  if (typeof outputText !== "string") {
    throw new TypeError("Judge output must be a JSON string.");
  }

  let result;

  try {
    result = JSON.parse(outputText);
  } catch {
    throw new TypeError("Judge output must be valid JSON.");
  }

  if (
    result === null ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    throw new TypeError("Judge output must be a JSON object.");
  }

  const actualFields = Object.keys(result).sort();

  if (
    actualFields.length !== REQUIRED_FIELDS.length ||
    actualFields.some((field, index) => field !== REQUIRED_FIELDS[index])
  ) {
    throw new TypeError(
      "Judge output must contain exactly the five required fields."
    );
  }

  if (!ALLOWED_PREFERENCES.has(result.preference)) {
    throw new TypeError(
      'Preference must be "A", "B", or "tie".'
    );
  }

  if (!ALLOWED_CONFIDENCE.has(result.confidence)) {
    throw new TypeError(
      'Confidence must be "low", "medium", or "high".'
    );
  }

  for (const field of [
    "responseAEvaluation",
    "responseBEvaluation",
    "rationale",
  ]) {
    if (
      typeof result[field] !== "string" ||
      !result[field].trim()
    ) {
      throw new TypeError(`${field} must be a non-empty string.`);
    }
  }

  return result;
}