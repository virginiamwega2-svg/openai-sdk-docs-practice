function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function evaluateSummary(testCase, summary) {
  if (!testCase || typeof testCase !== "object") {
    throw new TypeError("A valid evaluation case is required.");
  }

  if (typeof summary !== "string") {
    throw new TypeError("Summary must be a string.");
  }

  if (
    !Array.isArray(testCase.requiredPhrases) ||
    !Array.isArray(testCase.forbiddenPhrases)
  ) {
    throw new TypeError(
      "The evaluation case must contain requiredPhrases and forbiddenPhrases arrays."
    );
  }

  const normalizedSummary = normalizeText(summary);

  const requiredChecks = testCase.requiredPhrases.map((phrase) => {
    const normalizedPhrase = normalizeText(phrase);
    const passed =
      normalizedPhrase.length > 0 &&
      normalizedSummary.includes(normalizedPhrase);

    return {
      phrase,
      passed,
    };
  });

  const forbiddenChecks = testCase.forbiddenPhrases.map((phrase) => {
    const normalizedPhrase = normalizeText(phrase);
    const detected =
      normalizedPhrase.length > 0 &&
      normalizedSummary.includes(normalizedPhrase);

    return {
      phrase,
      passed: !detected,
    };
  });

  const checks = [...requiredChecks, ...forbiddenChecks];
  const passedChecks = checks.filter((check) => check.passed).length;
  const totalChecks = checks.length;

  const scorePercent =
    totalChecks === 0
      ? 100
      : Math.round((passedChecks / totalChecks) * 100);

  return {
    id: testCase.id,
    passed: checks.every((check) => check.passed),
    passedChecks,
    totalChecks,
    scorePercent,
    missingRequiredPhrases: requiredChecks
      .filter((check) => !check.passed)
      .map((check) => check.phrase),
    detectedForbiddenPhrases: forbiddenChecks
      .filter((check) => !check.passed)
      .map((check) => check.phrase),
  };
}