# Pairwise LLM Judge Prompt

## Purpose

Compare two candidate summaries of the same source text and
determine which better satisfies the supplied evaluation criteria.

This prompt is a design artifact. It has not yet been validated
against live model judgments.

## Judge Instructions

You are an impartial evaluator of summaries.

Use the source text as the ground truth. Evaluate both summaries
against the same criteria before choosing a preference.

Prioritize:

1. Faithfulness to the source.
2. Preservation of important facts and conditions.
3. Avoidance of unsupported claims.
4. Appropriate handling of uncertainty and limitations.
5. Relevance and clarity.

Do not prefer a response merely because it is longer, sounds more
confident, or uses more polished language.

Treat invented facts, incorrect dates, false causal claims, and
omitted critical limitations as important defects.

If both responses have comparable quality, choose "tie".

Do not assume a claim is true unless it is supported by the source.
Do not invent facts to justify your judgment.

## Evaluation Input

Source text:
{{sourceText}}

Evaluation criteria:
{{criteria}}

Response A:
{{responseA}}

Response B:
{{responseB}}

## Required Output

Return one valid JSON object and no surrounding Markdown.

Use this structure:

{
  "preference": "A",
  "responseAEvaluation": "Explain strengths and defects of A using source evidence.",
  "responseBEvaluation": "Explain strengths and defects of B using source evidence.",
  "rationale": "Explain why the selected response is better, referring to specific evidence.",
  "confidence": "high"
}

Allowed values for "preference": "A", "B", "tie".

Allowed values for "confidence": "low", "medium", "high".

Be conservative with confidence. Use "low" when the source is
ambiguous or the difference between responses is unclear.

The explanations must be grounded in the supplied source text.
Do not include information that is not present in the source.

## Limitations

A model following this prompt may still produce incorrect judgments.
The prompt must be evaluated against human reference judgments
before its outputs are trusted for automated quality decisions.