import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace";
import {
  defaultResource,
  resourceFromAttributes,
} from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "openai-sdk-docs-practice",
    [ATTR_SERVICE_VERSION]: "1.0.0",
  })
);

const sdk = new NodeSDK({
  resource,
  spanProcessors: [
    new SimpleSpanProcessor({
      exporter: new ConsoleSpanExporter(),
    }),
  ],
});

sdk.start();

export { sdk };