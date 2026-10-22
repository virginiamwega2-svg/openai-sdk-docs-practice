import test from "node:test";
import assert from "node:assert/strict";

import {
  runPairwiseLiveEvaluation,
} from "./pairwise-live-evaluation-runner.js";

const comparisons = [
  {
    id: "example-comparison",
    sourceCaseId: "example-source",
    responseA: "The library closes at 6 p.m.",
    responseB: "The library closes at 7 p.m.",
    preferredResponse: "A",
    criteria: ["faithfulness", "avoid-unsupported-claims"],
  },
];

const dataset = [
  {
    id: "example-source",
    sourceText: "The library closes at 6 p.m.",
  },
];

const validJudgment = {
  preference: "A",
  responseAEvaluation: "A preserves the stated closing time.",
  responseBEvaluation: "B changes the closing time.",
  rationale: "A agrees with the source text.",
  confidence: "high",
};

test("passes source text and comparison data to the judge", async () => {
  let receivedInput;

  const { results, summary } = await runPairwiseLiveEvaluation({
    comparisons,
    dataset,
    judge: async (input) => {
      receivedInput = input;
      return validJudgment;
    },
    log: () => {},
  });

  assert.deepEqual(receivedInput, {
    sourceText: dataset[0].sourceText,
    criteria: comparisons[0].criteria,
    responseA: comparisons[0].responseA,
    responseB: comparisons[0].responseB,
  });

  assert.equal(results[0].correct, true);
  assert.equal(summary.total, 1);
  assert.equal(summary.correct, 1);
});

test("rejects a comparison with no matching source text", async () => {
  await assert.rejects(
    () =>
      runPairwiseLiveEvaluation({
        comparisons,
        dataset: [],
        judge: async () => validJudgment,
        log: () => {},
      }),
    /Source case not found/,
  );
});

test("rejects invalid judge output", async () => {
  await assert.rejects(
    () =>
      runPairwiseLiveEvaluation({
        comparisons,
        dataset,
        judge: async () => ({ preference: "C" }),
        log: () => {},
      }),
    /exactly the five required fields/,
  );
});

test("rejects an empty comparison dataset", async () => {
  await assert.rejects(
    () =>
      runPairwiseLiveEvaluation({
        comparisons: [],
        dataset,
        judge: async () => validJudgment,
        log: () => {},
      }),
    /At least one comparison is required/,
  );
});


test("propagates judge failures without returning a partial summary", async () => {
  await assert.rejects(
    () =>
      runPairwiseLiveEvaluation({
        comparisons,
        dataset,
        judge: async () => {
          throw new Error("Judge request failed");
        },
        log: () => {},
      }),
    {
      name: "Error",
      message: "Judge request failed",
    }
  );
});
