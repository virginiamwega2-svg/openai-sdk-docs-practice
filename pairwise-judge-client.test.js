import test from "node:test";
import assert from "node:assert/strict";

import {
  createPairwiseJudge,
  renderPairwiseJudgePrompt,
} from "./pairwise-judge-client.js";

const input = {
  sourceText: "The library closes at 6 p.m.",
  criteria: [
    "Preserve the stated closing time",
    "Do not invent facts",
  ],
  responseA: "The library closes at 6 p.m.",
  responseB: "The library closes at 7 p.m.",
};

const validOutput = {
  preference: "A",
  responseAEvaluation: "A preserves the stated closing time.",
  responseBEvaluation: "B changes the closing time.",
  rationale: "A matches the source text.",
  confidence: "high",
};

const template = [
  "Source: {{sourceText}}",
  "Criteria:",
  "{{criteria}}",
  "Response A: {{responseA}}",
  "Response B: {{responseB}}",
].join("\n");

function createMockClient(outputText) {
  const requests = [];

  return {
    requests,
    client: {
      responses: {
        create: async (request) => {
          requests.push(request);
          return { output_text: outputText };
        },
      },
    },
  };
}

test("renders all prompt placeholders", () => {
  const prompt = renderPairwiseJudgePrompt(template, input);

  assert.ok(prompt.includes(input.sourceText));
  assert.ok(prompt.includes(input.responseA));
  assert.ok(prompt.includes(input.responseB));
  assert.ok(prompt.includes("- Preserve the stated closing time"));
  assert.ok(!prompt.includes("{{sourceText}}"));
});

test("rejects an empty candidate response", () => {
  assert.throws(
    () =>
      renderPairwiseJudgePrompt(template, {
        ...input,
        responseA: " ",
      }),
    /responseA must be a non-empty string/,
  );
});

test("sends a mocked request and validates the judge result", async () => {
  const mock = createMockClient(JSON.stringify(validOutput));

  const judge = createPairwiseJudge({
    client: mock.client,
    model: "test-model",
    promptTemplate: template,
  });

  const result = await judge(input);

  assert.deepEqual(result, validOutput);
  assert.equal(mock.requests.length, 1);
  assert.equal(mock.requests[0].model, "test-model");
  assert.equal(
    mock.requests[0].text.format.type,
    "json_schema",
  );
  assert.ok(mock.requests[0].input.includes(input.sourceText));
});

test("rejects an invalid judge result", async () => {
  const mock = createMockClient(
    JSON.stringify({ preference: "C" }),
  );

  const judge = createPairwiseJudge({
    client: mock.client,
    model: "test-model",
    promptTemplate: template,
  });

  await assert.rejects(
    () => judge(input),
    /exactly the five required fields/,
  );
});