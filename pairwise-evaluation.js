const VALID_PREFERENCES = new Set(["A", "B", "tie"]);

export function scorePairwiseJudgment(
  comparison,
  predictedPreference
) {
  if (!comparison || typeof comparison !== "object") {
    throw new TypeError("A valid comparison is required.");
  }

  if (typeof comparison.id !== "string" || !comparison.id.trim()) {
    throw new TypeError("The comparison must have a non-empty id.");
  }

  if (!VALID_PREFERENCES.has(comparison.preferredResponse)) {
    throw new TypeError(
      "The reference preference must be A, B, or tie."
    );
  }

  if (!VALID_PREFERENCES.has(predictedPreference)) {
    throw new TypeError(
      "The predicted preference must be A, B, or tie."
    );
  }

  return {
    id: comparison.id,
    expectedPreference: comparison.preferredResponse,
    predictedPreference,
    correct: comparison.preferredResponse === predictedPreference,
  };
}

export function summarizePairwiseResults(results) {
  if (!Array.isArray(results)) {
    throw new TypeError("Results must be an array.");
  }

  const correctCount = results.filter(
    (result) => result.correct === true
  ).length;

  const total = results.length;

  return {
    total,
    correct: correctCount,
    incorrect: total - correctCount,
    agreementPercent:
      total === 0 ? 0 : Math.round((correctCount / total) * 100),
    disagreements: results
      .filter((result) => !result.correct)
      .map((result) => ({
        id: result.id,
        expected: result.expectedPreference,
        predicted: result.predictedPreference,
      })),
  };
}
export function findMissingComparisonIds(comparisons, judgedIds) {
  if (!Array.isArray(comparisons)) {
    throw new TypeError("Comparisons must be an array.");
  }

  if (!(judgedIds instanceof Set)) {
    throw new TypeError("Judged IDs must be a Set.");
  }

  return comparisons
    .filter((comparison) => !judgedIds.has(comparison.id))
    .map((comparison) => comparison.id);
}