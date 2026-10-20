import test from "node:test";
import assert from "node:assert/strict";

import {
  scorePairwiseJudgment,
  summarizePairwiseResults,
  findMissingComparisonIds,
} from "./pairwise-evaluation.js";

const comparison = {
  id: "launch-delay-comparison",
  preferredResponse: "A",
};

test("marks a judgment correct when it matches the reference", () => {
  const result = scorePairwiseJudgment(comparison, "A");

  assert.equal(result.correct, true);
  assert.equal(result.expectedPreference, "A");
  assert.equal(result.predictedPreference, "A");
});

test("marks a judgment incorrect when it disagrees with the reference", () => {
  const result = scorePairwiseJudgment(comparison, "B");

  assert.equal(result.correct, false);
  assert.equal(result.expectedPreference, "A");
  assert.equal(result.predictedPreference, "B");
});

test("calculates agreement and identifies disagreements", () => {
  const results = [
    {
      id: "case-1",
      expectedPreference: "A",
      predictedPreference: "A",
      correct: true,
    },
    {
      id: "case-2",
      expectedPreference: "B",
      predictedPreference: "A",
      correct: false,
    },
    {
      id: "case-3",
      expectedPreference: "A",
      predictedPreference: "A",
      correct: true,
    },
  ];

  const summary = summarizePairwiseResults(results);

  assert.equal(summary.total, 3);
  assert.equal(summary.correct, 2);
  assert.equal(summary.incorrect, 1);
  assert.equal(summary.agreementPercent, 67);

  assert.deepEqual(summary.disagreements, [
    {
      id: "case-2",
      expected: "B",
      predicted: "A",
    },
  ]);
});

test("reports zero agreement for an empty result set", () => {
  const summary = summarizePairwiseResults([]);

  assert.equal(summary.total, 0);
  assert.equal(summary.correct, 0);
  assert.equal(summary.agreementPercent, 0);
});

test("rejects an unsupported predicted preference", () => {
  assert.throws(
    () => scorePairwiseJudgment(comparison, "C"),
    {
      name: "TypeError",
      message: "The predicted preference must be A, B, or tie.",
    }
  );
});
test("identifies comparisons that have no judge result", () => {
  const comparisons = [
    { id: "case-1" },
    { id: "case-2" },
    { id: "case-3" },
  ];

  const judgedIds = new Set(["case-1", "case-3"]);

  assert.deepEqual(
    findMissingComparisonIds(comparisons, judgedIds),
    ["case-2"]
  );
});

test("returns no missing IDs when every comparison was judged", () => {
  const comparisons = [
    { id: "case-1" },
    { id: "case-2" },
  ];

  const judgedIds = new Set(["case-1", "case-2"]);

  assert.deepEqual(
    findMissingComparisonIds(comparisons, judgedIds),
    []
  );
});