# OpenAI SDK Documentation Practice

[![Run Tests](https://github.com/virginiamwega2-svg/openai-sdk-docs-practice/actions/workflows/tests.yml/badge.svg)](https://github.com/virginiamwega2-svg/openai-sdk-docs-practice/actions/workflows/tests.yml)

A hands-on project exploring **AI Developer Experience (DevEx)** through OpenAI SDK integration, developer documentation, automated testing, observability, and LLM evaluation.

The goal is to make AI integrations easier to understand, test, debug, and evaluate.

## What This Project Demonstrates

- **SDK integration:** Working with the OpenAI JavaScript SDK and Responses API.
- **Developer experience:** Clear onboarding instructions, input validation, and actionable error messages.
- **Automated testing:** Testing application behavior with mocked API responses.
- **AI observability:** Recording operation duration, token usage, estimated cost, streaming timing, and OpenTelemetry spans.
- **LLM evaluation:** Evaluating sample summaries against predefined phrase checks.
- **Pairwise evaluation:** Comparing candidate summaries against reference judgments and measuring agreement.
- **Documentation quality:** Maintaining practical guides and checking local Markdown links.

## Quick Start

### Prerequisites

- Node.js 22 or later.
- npm.
- A code editor, such as Visual Studio Code.

**You do not need an OpenAI API key** to install dependencies, run the automated tests, or use the current evaluation demonstrations.

### 1. Install dependencies

Clone the repository and enter its directory:

```bash
git clone https://github.com/virginiamwega2-svg/openai-sdk-docs-practice.git
cd openai-sdk-docs-practice
npm ci
```

### 2. Run the automated tests

```bash
npm test
```

The tests cover application behavior, error handling, observability, evaluation logic, judge-output validation, and other project checks. Mocked SDK responses allow these tests to run without live API requests.

### 3. Check documentation links

```bash
npm run check:docs
```

This checks local Markdown links and rejects links that escape the project directory.

## Available Commands

| Command | Purpose |
|---|---|
| `npm test` | Run the automated test suite |
| `npm run check:docs` | Check local Markdown links |
| `npm run test:otel` | Run the mocked OpenTelemetry demonstration |
| `npm run evaluate` | Evaluate sample summaries using phrase checks |
| `npm run evaluate:pairwise` | Compare simulated judge preferences against reference judgments |

## Optional: Run a Live API Example

The live examples require a valid OpenAI API key and appropriate API access. They are optional; the local tests and evaluation demonstrations work without one.

### Configure the API key

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_api_key_here
```

Replace the placeholder with a valid API key when you have one. Never commit your `.env` file or expose your API key.

### Generate a greeting

```bash
node index.js
```

### Summarize text

```bash
node index.js summarize "Developer documentation helps developers use software effectively."
```

### Stream a response

```bash
node index.js stream "Explain how an API works."
```

These commands make live API requests and may incur charges. Without a valid API key, the application displays a missing-key message.

## AI Observability and OpenTelemetry

The project records application-level measurements for AI operations.

### Operation metrics

The `withObservability()` helper records the operation name, duration, and success or error status.

When usage information is available, the examples also report:

- Input, output, and total token counts.
- Time to first non-empty text delta for streaming operations.
- Estimated request cost based on the pricing assumptions configured in the code.

Cost estimates are illustrative, not guaranteed invoice totals. They may not account for every pricing adjustment or additional charge.

### Run the tracing demonstration

```bash
npm run test:otel
```

This demonstration uses a mocked SDK response and exports an OpenTelemetry span to the console. It does not require a live API request.

The current implementation provides application-level spans. It does not yet provide a persistent observability backend or dashboard, automatic OpenAI SDK HTTP instrumentation, or verified distributed trace-context propagation.

For more detail, see the [AI Observability Guide](./AI-OBSERVABILITY-GUIDE.md).

## LLM Output Evaluation

The project includes a rule-based baseline for evaluating sample summaries against predefined expectations.

### Run the evaluation examples

```bash
npm run evaluate
```

The dataset covers three scenarios:

- Preserving events, dates, and planned actions.
- Respecting conditions and limitations.
- Avoiding unsupported conclusions about survey results.

Key files:

- `EVALUATION-CRITERIA.md` — intended quality criteria and evaluation limitations.
- `evaluation-dataset.json` — source texts and required or forbidden phrases.
- `evaluation-examples.json` — sample summaries.
- `evaluation.js` — phrase-check evaluation logic.
- `evaluation-runner.js` — runs the examples and reports scores.
- `evaluation.test.js` — tests the evaluator.

### Understanding the scores

The evaluator checks whether configured phrases are present or absent and calculates a phrase-check score.

This is a **rule-based baseline, not a comprehensive AI quality score**. It can reject a valid paraphrase or miss a misleading statement expressed in different words. The sample summaries are hand-written, not outputs from a live model.

## Pairwise LLM Evaluation

The project includes an experimental workflow for comparing two candidate summaries against reference judgments.

### Run the pairwise benchmark

```bash
npm run evaluate:pairwise
```

The benchmark contains three comparison cases covering factual faithfulness, preservation of conditions, and appropriate handling of uncertainty.

Key files:

- `evaluation-comparisons.json` — candidate summaries, reference preferences, criteria, and rationales.
- `PAIRWISE-JUDGE-PROMPT.md` — proposed instructions for a future LLM judge.
- `pairwise-judge-output.js` — validates the expected judge-output structure.
- `pairwise-judge-output.test.js` — tests output validation.
- `pairwise-evaluation.js` — scores preferences and calculates agreement.
- `pairwise-evaluation.test.js` — tests pairwise scoring and missing-result detection.
- `pairwise-evaluation-runner.js` — runs the benchmark and reports disagreements.
- `pairwise-judge-results.json` — simulated structured judge results.
- `pairwise-predictions.json` — simulated preference predictions.

### Understanding the benchmark

The current benchmark uses **simulated judge results**, not judgments generated by a live AI model.

The reported agreement rate measures whether the supplied predictions match the reference labels. The current 67% result demonstrates the scoring pipeline; it is not a validated AI judge accuracy score.

The judge prompt and structured-output contract have not yet been validated against real model judgments. The benchmark does not currently make model-based quality judgments.

## Documentation

| Guide | Purpose |
|---|---|
| [QuickStart Guide](./QUICKSTART.md) | Set up the project and run examples |
| [API Reference](./API-REFERENCE.md) | Understand functions, parameters, and errors |
| [SDK Integration Guide](./SDK-INTEGRATION-GUIDE.md) | Explore the SDK integration |
| [Streaming Cookbook](./STREAMING-COOKBOOK.md) | Learn about streaming responses |
| [Troubleshooting Guide](./TROUBLESHOOTING.md) | Diagnose common integration problems |
| [Validation Report](./VALIDATION-REPORT.md) | Review documentation validation |
| [SDK Documentation Audit](./SDK-DOCUMENTATION-AUDIT.md) | Review documentation quality |
| [AI Observability Guide](./AI-OBSERVABILITY-GUIDE.md) | Understand metrics and tracing |
| [Evaluation Criteria](./EVALUATION-CRITERIA.md) | Review evaluation goals and limitations |
| [Pairwise Judge Prompt](./PAIRWISE-JUDGE-PROMPT.md) | Review the proposed judge instructions |

## Security and Limitations

- Never commit API keys, credentials, or private environment files.
- Live API requests require valid credentials and appropriate API access.
- Live API usage may incur charges.
- Mocked tests do not verify live model behavior, availability, performance, or actual billing.
- Phrase-check scores do not establish that a summary is correct.
- Simulated pairwise results do not establish that an AI judge is reliable.

Documented concepts should not be interpreted as implemented capabilities unless supported by code, configuration, and tests.

## Continuous Integration

The GitHub Actions workflow in `.github/workflows/tests.yml` runs the automated tests and documentation-link checks.

Run both locally before submitting changes:

```bash
npm test
npm run check:docs
```

The aim of this project is to make AI integrations easier for developers to use and understand through working examples, testable behavior, accurate documentation, and transparent evaluation limitations.