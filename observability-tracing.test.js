import test from "node:test";
import assert from "node:assert/strict";

import { SpanStatusCode, trace } from "@opentelemetry/api";
import {
  SimpleSpanProcessor,
  TracerProvider,
} from "@opentelemetry/sdk-trace";

class TestSpanExporter {
  spans = [];

  export(spans, resultCallback) {
    this.spans.push(...spans);
    resultCallback({ code: 0 });
  }

  async forceFlush() {}

  async shutdown() {}

  reset() {
    this.spans = [];
  }

  getFinishedSpans() {
    return [...this.spans];
  }
}

const exporter = new TestSpanExporter();

const provider = new TracerProvider({
  spanProcessors: [
    new SimpleSpanProcessor({ exporter }),
  ],
});

const registered = trace.setGlobalTracerProvider(provider);

if (!registered) {
  throw new Error("Could not register the test tracer provider.");
}

// Register the test provider before loading modules that create tracers.
const { generateGreeting } = await import("./index.js");
const { withObservability } = await import("./observability.js");

test("records token usage and estimated cost on the greeting span", async () => {
  exporter.reset();

  const mockClient = {
    responses: {
      create: async () => ({
        output_text: "Hello, developer!",
        usage: {
          input_tokens: 12,
          input_tokens_details: {
            cached_tokens: 2,
          },
          output_tokens: 8,
          total_tokens: 20,
        },
      }),
    },
  };

  await generateGreeting(mockClient, () => {});
  await provider.forceFlush();

  const span = exporter
    .getFinishedSpans()
    .find((item) => item.name === "generateGreeting");

  assert.ok(span, "Expected a generateGreeting span");

  assert.equal(span.attributes["gen_ai.usage.input_tokens"], 12);
  assert.equal(span.attributes["gen_ai.usage.output_tokens"], 8);
  assert.equal(
    span.attributes["gen_ai.usage.cache_read.input_tokens"],
    2
  );
  assert.equal(span.attributes["app.usage.total_tokens"], 20);

  assert.ok(
    Math.abs(span.attributes["app.cost.estimated_usd"] - 0.000291) <
      1e-12
  );
});

test("records error status and an exception on a failed span", async () => {
  exporter.reset();

  const expectedError = new Error("Simulated operation failure");

  await assert.rejects(
    withObservability(
      "test.failed-operation",
      async () => {
        throw expectedError;
      },
      () => {}
    ),
    (error) => error === expectedError
  );

  await provider.forceFlush();

  const span = exporter
    .getFinishedSpans()
    .find((item) => item.name === "test.failed-operation");

  assert.ok(span, "Expected a span for the failed operation");
  assert.equal(span.status.code, SpanStatusCode.ERROR);
  assert.equal(span.attributes["app.operation.status"], "error");

  assert.ok(
    span.events.some((event) => event.name === "exception"),
    "Expected the span to contain an exception event"
  );
});
test("records success status and duration without changing the operation result", async () => {
  exporter.reset();

  let recordedMetric;

  const result = await withObservability(
    "test.successful-operation",
    async () => "operation result",
    (measurement) => {
      recordedMetric = measurement;
    }
  );

  await provider.forceFlush();

  const span = exporter
    .getFinishedSpans()
    .find((item) => item.name === "test.successful-operation");

  assert.equal(result, "operation result");

  assert.ok(span, "Expected a span for the successful operation");
  assert.equal(span.attributes["app.operation.status"], "success");

  assert.ok(recordedMetric, "Expected a recorded metric");
  assert.equal(recordedMetric.operation, "test.successful-operation");
  assert.equal(recordedMetric.status, "success");
  assert.ok(Number.isFinite(recordedMetric.durationMs));
  assert.ok(recordedMetric.durationMs >= 0);
});
test("does not export sensitive error content in tracing telemetry", async () => {
  exporter.reset();

  const sensitiveMarker = "PRIVATE_PROMPT_DO_NOT_LOG";
  const expectedError = new Error(
    `Provider failure; prompt=${sensitiveMarker}`
  );

  await assert.rejects(
    withObservability(
      "test.privacy-safe-error",
      async () => {
        throw expectedError;
      },
      () => {}
    ),
    (error) => error === expectedError
  );

  await provider.forceFlush();

  const span = exporter
    .getFinishedSpans()
    .find((item) => item.name === "test.privacy-safe-error");

  assert.ok(span, "Expected a span for the failed operation");

  const exportedTelemetry = JSON.stringify({
    attributes: span.attributes,
    events: span.events.map(({ name, attributes }) => ({
      name,
      attributes,
    })),
  });

  assert.equal(
    exportedTelemetry.includes(sensitiveMarker),
    false,
    "Sensitive error content must not appear in exported telemetry"
  );
});