import { readFileSync } from "node:fs";

import {
  scorePairwiseJudgment,
  summarizePairwiseResults,
  findMissingComparisonIds,
} from "./pairwise-evaluation.js";

import { parseJudgeOutput } from "./pairwise-judge-output.js";

function readJsonFile(filename) {
  return JSON.parse(
    readFileSync(new URL(filename, import.meta.url), "utf8")
  );
}

const comparisons = readJsonFile("./evaluation-comparisons.json");
const judgeResults = readJsonFile("./pairwise-judge-results.json");

if (!Array.isArray(comparisons) || !Array.isArray(judgeResults)) {
  throw new TypeError(
    "Comparisons and judge results must be JSON arrays."
  );
}

const comparisonsById = new Map(
  comparisons.map((comparison) => [comparison.id, comparison])
);

const seenIds = new Set();
const results = [];

for (const record of judgeResults) {
  if (
    typeof record.comparisonId !== "string" ||
    !record.comparisonId.trim()
  ) {
    throw new TypeError("Each judge result must have a comparisonId.");
  }

  if (seenIds.has(record.comparisonId)) {
    throw new Error(`Duplicate judge result: ${record.comparisonId}`);
  }

  seenIds.add(record.comparisonId);

  const comparison = comparisonsById.get(record.comparisonId);

  if (!comparison) {
    throw new Error(
      `No reference comparison found for: ${record.comparisonId}`
    );
  }

  const judgeOutput = parseJudgeOutput(
    JSON.stringify(record.judgeOutput)
  );

  const result = scorePairwiseJudgment(
    comparison,
    judgeOutput.preference
  );

  results.push(result);

  console.log(`\nComparison: ${result.id}`);
  console.log(`Reference preference: ${result.expectedPreference}`);
  console.log(`Judge preference: ${result.predictedPreference}`);
  console.log(`Judge confidence: ${judgeOutput.confidence}`);
  console.log(`Result: ${result.correct ? "AGREEMENT" : "DISAGREEMENT"}`);
  console.log(`Rationale: ${judgeOutput.rationale}`);
}
const missingComparisons = findMissingComparisonIds(
  comparisons,
  seenIds
);

if (missingComparisons.length > 0) {
  throw new Error(
    `Missing judge results for comparisons: ${missingComparisons.join(", ")}`
  );
}
const summary = summarizePairwiseResults(results);

console.log("\n--- Pairwise Evaluation Summary ---");
console.log(`Judgments evaluated: ${summary.total}`);
console.log(`Agreements: ${summary.correct}`);
console.log(`Disagreements: ${summary.incorrect}`);
console.log(`Agreement rate: ${summary.agreementPercent}%`);

if (summary.disagreements.length > 0) {
  console.log("\nCases to review:");

  for (const disagreement of summary.disagreements) {
    console.log(
      `- ${disagreement.id}: expected ${disagreement.expected}, ` +
      `predicted ${disagreement.predicted}`
    );
  }
}