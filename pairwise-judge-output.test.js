import test from "node:test";
import assert from "node:assert/strict";

import {
  PAIRWISE_JUDGE_JSON_SCHEMA,
  parseJudgeOutput,
} from "./pairwise-judge-output.js";

const validOutput = {
  preference: "A",
  responseAEvaluation: "A preserves the key dates and planned test.",
  responseBEvaluation: "B invents a successful launch.",
  rationale: "The source confirms the launch was postponed.",
  confidence: "high",
};

test("parses a valid judge result", () => {
  const result = parseJudgeOutput(JSON.stringify(validOutput));

  assert.deepEqual(result, validOutput);
});

test("rejects invalid JSON", () => {
  assert.throws(
    () => parseJudgeOutput("{not valid JSON"),
    {
      name: "TypeError",
      message: "Judge output must be valid JSON.",
    }
  );
});

test("rejects an unsupported preference", () => {
  const output = { ...validOutput, preference: "C" };

  assert.throws(
    () => parseJudgeOutput(JSON.stringify(output)),
    {
      name: "TypeError",
      message: 'Preference must be "A", "B", or "tie".',
    }
  );
});

test("rejects an unsupported confidence level", () => {
  const output = { ...validOutput, confidence: "certain" };

  assert.throws(
    () => parseJudgeOutput(JSON.stringify(output)),
    {
      name: "TypeError",
      message: 'Confidence must be "low", "medium", or "high".',
    }
  );
});

test("rejects missing and unexpected fields", () => {
  const missingRationale = { ...validOutput };
  delete missingRationale.rationale;

  const extraField = {
    ...validOutput,
    explanation: "An unexpected field",
  };

  assert.throws(
    () => parseJudgeOutput(JSON.stringify(missingRationale)),
    /exactly the five required fields/
  );

  assert.throws(
    () => parseJudgeOutput(JSON.stringify(extraField)),
    /exactly the five required fields/
  );
});

test("rejects an empty rationale", () => {
  const output = { ...validOutput, rationale: "   " };

  assert.throws(
    () => parseJudgeOutput(JSON.stringify(output)),
    {
      name: "TypeError",
      message: "rationale must be a non-empty string.",
    }
  );
});

test("rejects non-string input", () => {
  assert.throws(
    () => parseJudgeOutput({ ...validOutput }),
    {
      name: "TypeError",
      message: "Judge output must be a JSON string.",
    }
  );
});

test("schema requires all five fields and disallows extra properties", () => {
  assert.deepEqual(
    PAIRWISE_JUDGE_JSON_SCHEMA.required,
    [
      "preference",
      "responseAEvaluation",
      "responseBEvaluation",
      "rationale",
      "confidence",
    ]
  );

  assert.equal(
    PAIRWISE_JUDGE_JSON_SCHEMA.additionalProperties,
    false
  );
});