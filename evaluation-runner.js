import { readFileSync } from "node:fs";
import { evaluateSummary } from "./evaluation.js";

function readJsonFile(filename) {
  return JSON.parse(
    readFileSync(new URL(filename, import.meta.url), "utf8")
  );
}

const dataset = readJsonFile("./evaluation-dataset.json");
const examples = readJsonFile("./evaluation-examples.json");

if (!Array.isArray(dataset) || !Array.isArray(examples)) {
  throw new TypeError("Dataset and examples must both be JSON arrays.");
}

const casesById = new Map(dataset.map((item) => [item.id, item]));

let passedCases = 0;
let totalScore = 0;

for (const example of examples) {
  const testCase = casesById.get(example.id);

  if (!testCase) {
    throw new Error(`No evaluation case found for ID: ${example.id}`);
  }

  const result = evaluateSummary(testCase, example.summary);

  console.log(`\nEvaluation: ${result.id}`);
  console.log(`Status: ${result.passed ? "PASS" : "FAIL"}`);
  console.log(`Score: ${result.scorePercent}%`);
  console.log(`Checks passed: ${result.passedChecks}/${result.totalChecks}`);

  if (result.missingRequiredPhrases.length > 0) {
    console.log(
      "Missing required phrases:",
      result.missingRequiredPhrases
    );
  }

  if (result.detectedForbiddenPhrases.length > 0) {
    console.log(
      "Detected forbidden phrases:",
      result.detectedForbiddenPhrases
    );
  }

  if (result.passed) {
    passedCases++;
  }

  totalScore += result.scorePercent;
}

const averageScore =
  examples.length === 0 ? 0 : Math.round(totalScore / examples.length);

console.log("\n--- Evaluation Summary ---");
console.log(`Cases passed: ${passedCases}/${examples.length}`);
console.log(`Average phrase-check score: ${averageScore}%`);

if (passedCases !== examples.length) {
  process.exitCode = 1;
}