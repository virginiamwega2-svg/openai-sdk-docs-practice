import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import { performance } from "node:perf_hooks";

const tracer = trace.getTracer("openai-sdk-docs-practice");

export async function withObservability(
  operationName,
  operation,
  onMetric = console.log
) {
  const span = tracer.startSpan(operationName);
  span.setAttribute("app.operation.name", operationName);

  const startTime = performance.now();
  let status = "success";

  try {
    return await context.with(
      trace.setSpan(context.active(), span),
      async () => await operation()
    );
  } catch (error) {
    status = "error";

    if (error instanceof Error) {
      // Record a generic exception event without exporting the message or stack.
      span.addEvent("exception", {
        "exception.type": "Error",
      });
    }
    span.setStatus({ code: SpanStatusCode.ERROR });

    throw error;
  } finally {
    const durationMs = Number(
      (performance.now() - startTime).toFixed(2)
    );

    span.setAttribute("app.operation.duration_ms", durationMs);
    span.setAttribute("app.operation.status", status);

    if (status === "success") {
      span.setStatus({ code: SpanStatusCode.OK });
    }

    try {
      onMetric(
        {
          operation: operationName,
          durationMs,
          status,
        },
        span
      );
    } catch {
      // A metrics callback failure must not affect the operation.
    }

    span.end();
  }
}