
import { performance } from "node:perf_hooks";

export async function withObservability(
  operationName,
  operation,
  onMetric = console.log
) {
  const startTime = performance.now();
  let status = "success";

  try {
    return await operation();
  } catch (error) {
    status = "error";
    throw error;
  } finally {
    const durationMs = Number(
      (performance.now() - startTime).toFixed(2)
    );

    try {
      onMetric({
        operation: operationName,
        durationMs,
        status,
      });
    } catch {
      // A metrics callback failure must not affect the operation.
    }
  }
}
