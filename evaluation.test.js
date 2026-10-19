import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { evaluateSummary } from "./evaluation.js";

const dataset = JSON.parse(
  readFileSync(
    new URL("./evaluation-dataset.json", import.meta.url),
    "utf8"
  )
);

const launchCase = dataset.find(
  (item) => item.id === "launch-delay"
);

test("passes a summary that satisfies the phrase checks", () => {
  const summary =
    "The launch was postponed from May 10 to May 17 because of a login issue. " +
    "The issue was fixed on May 14. A regression test on May 15 is planned " +
    "before confirming release.";

  const result = evaluateSummary(launchCase, summary);

  assert.equal(result.passed, true);
  assert.equal(result.scorePercent, 100);
  assert.deepEqual(result.missingRequiredPhrases, []);
  assert.deepEqual(result.detectedForbiddenPhrases, []);
});

test("detects missing phrases and a forbidden claim", () => {
  const summary =
    "The launch was postponed from May 10 to May 17. " +
    "The application has already launched.";

  const result = evaluateSummary(launchCase, summary);

  assert.equal(result.passed, false);
  assert.ok(result.missingRequiredPhrases.length > 0);

  assert.deepEqual(result.detectedForbiddenPhrases, [
    "the application has already launched"
  ]);
});

test("ignores capitalization and punctuation differences", () => {
  const summary =
    "THE LAUNCH WAS POSTPONED FROM MAY 10 TO MAY 17! " +
    "The login issue was fixed on May 14. " +
    "A regression test on May 15 is planned.";

  const result = evaluateSummary(launchCase, summary);

  assert.equal(result.passed, true);
});

test("rejects a non-string summary", () => {
  assert.throws(
    () => evaluateSummary(launchCase, 123),
    {
      name: "TypeError",
      message: "Summary must be a string."
    }
  );
});