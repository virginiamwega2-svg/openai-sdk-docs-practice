import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createPairwiseJudge } from "./pairwise-judge-client.js";

import {
  scorePairwiseJudgment,
  summarizePairwiseResults,
} from "./pairwise-evaluation.js";

import { parseJudgeOutput } from "./pairwise-judge-output.js";

function readJsonFile(filename) {
  return JSON.parse(
    readFileSync(new URL(filename, import.meta.url), "utf8")
  );
}

export async function runPairwiseLiveEvaluation({
  comparisons,
  dataset,
  judge,
  log = console.log,
}) {
  if (!Array.isArray(comparisons) || !Array.isArray(dataset)) {
    throw new TypeError(
      "Comparisons and dataset must be JSON arrays."
    );
  }

  if (typeof judge !== "function") {
    throw new TypeError("Judge must be a function.");
  }

  if (comparisons.length === 0) {
    throw new TypeError("At least one comparison is required.");
  }

  const datasetById = new Map();

  for (const sourceCase of dataset) {
    if (
      !sourceCase ||
      typeof sourceCase.id !== "string" ||
      !sourceCase.id.trim()
    ) {
      throw new TypeError("Each source case must have an ID.");
    }

    if (datasetById.has(sourceCase.id)) {
      throw new Error(`Duplicate source case: ${sourceCase.id}`);
    }

    if (
      typeof sourceCase.sourceText !== "string" ||
      !sourceCase.sourceText.trim()
    ) {
      throw new TypeError(
        `Source text is missing for: ${sourceCase.id}`
      );
    }

    datasetById.set(sourceCase.id, sourceCase);
  }

  const seenIds = new Set();
  const results = [];

  for (const comparison of comparisons) {
    if (
      !comparison ||
      typeof comparison.id !== "string" ||
      !comparison.id.trim()
    ) {
      throw new TypeError("Each comparison must have an ID.");
    }

    if (seenIds.has(comparison.id)) {
      throw new Error(`Duplicate comparison: ${comparison.id}`);
    }

    seenIds.add(comparison.id);

    const sourceCase = datasetById.get(comparison.sourceCaseId);

    if (!sourceCase) {
      throw new Error(
        `Source case not found: ${comparison.sourceCaseId}`
      );
    }

    if (
      typeof comparison.responseA !== "string" ||
      !comparison.responseA.trim() ||
      typeof comparison.responseB !== "string" ||
      !comparison.responseB.trim() ||
      !Array.isArray(comparison.criteria) ||
      comparison.criteria.length === 0
    ) {
      throw new TypeError(
        `Comparison has invalid responses or criteria: ${comparison.id}`
      );
    }

    const rawOutput = await judge({
      sourceText: sourceCase.sourceText,
      criteria: comparison.criteria,
      responseA: comparison.responseA,
      responseB: comparison.responseB,
    });

    const judgeOutput = parseJudgeOutput(
      typeof rawOutput === "string"
        ? rawOutput
        : JSON.stringify(rawOutput)
    );

    const result = scorePairwiseJudgment(
      comparison,
      judgeOutput.preference
    );

    results.push(result);

    log(`\nComparison: ${result.id}`);
    log(`Reference preference: ${result.expectedPreference}`);
    log(`Judge preference: ${result.predictedPreference}`);
    log(`Judge confidence: ${judgeOutput.confidence}`);
    log(
      `Result: ${result.correct ? "AGREEMENT" : "DISAGREEMENT"}`
    );
    log(`Rationale: ${judgeOutput.rationale}`);
  }

  const summary = summarizePairwiseResults(results);

  log("\n--- Live Pairwise Evaluation Summary ---");
  log(`Judgments evaluated: ${summary.total}`);
  log(`Agreements: ${summary.correct}`);
  log(`Disagreements: ${summary.incorrect}`);
  log(`Agreement rate: ${summary.agreementPercent}%`);

  if (summary.disagreements.length > 0) {
    log("\nCases to review:");

    for (const disagreement of summary.disagreements) {
      log(
        `- ${disagreement.id}: expected ${disagreement.expected}, ` +
        `predicted ${disagreement.predicted}`
      );
    }
  }

  return { results, summary };
}

const isMainModule =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "OPENAI_API_KEY is required for live evaluation. " +
      "No API requests were made."
    );
    process.exitCode = 1;
  } else {
    try {
      const comparisons = readJsonFile("./evaluation-comparisons.json");
      const dataset = readJsonFile("./evaluation-dataset.json");
      const model = process.env.OPENAI_JUDGE_MODEL || "gpt-5.5";

      console.log(`Running live evaluation with model: ${model}`);

      await runPairwiseLiveEvaluation({
        comparisons,
        dataset,
        judge: createPairwiseJudge({ model }),
      });
    } catch (error) {
      console.error(
        `Live evaluation failed: ${error.message}`
      );
      process.exitCode = 1;
    }
  }
}