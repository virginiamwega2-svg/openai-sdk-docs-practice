# AI Output Evaluation Criteria

## Purpose

Define the intended quality criteria for summaries produced by
the project's `summarizeText()` function and document what the
current evaluation tool actually checks.

## Intended Quality Criteria

A good summary should meet five criteria:

### 1. Faithfulness

The summary should not introduce facts, statistics, or conclusions
that are unsupported by the source text.

### 2. Key Information Coverage

The summary should preserve the important facts and conclusions
needed to understand the source.

### 3. Relevance

The summary should focus on the source's main topic and avoid
unnecessary details.

### 4. Clarity

The summary should be understandable, logically organized,
and grammatically clear.

### 5. Conciseness

The summary should avoid unnecessary detail without removing
essential meaning.

These criteria describe the intended quality standard. The current
automated evaluator does not independently assess all five criteria.

## Current Automated Evaluation

The current evaluator uses explicit phrase checks defined in
`evaluation-dataset.json`.

- `requiredPhrases` identifies phrases that must appear in a summary.
- `forbiddenPhrases` identifies phrases that should not appear.
- Text matching ignores capitalization and punctuation differences.
- The evaluator reports missing required phrases and detected
  forbidden phrases.

Run the examples with:

```bash
npm run evaluate