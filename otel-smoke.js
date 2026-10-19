import { generateGreeting } from "./index.js";
import { sdk } from "./instrumentation.js";

const mockClient = {
  responses: {
    create: async () => ({
      output_text: "Hello from a traced AI operation!",
      usage: {
        input_tokens: 5,
        input_tokens_details: {
          cached_tokens: 0,
        },
        output_tokens: 6,
        total_tokens: 11,
      },
    }),
  },
};

try {
  const greeting = await generateGreeting(
    mockClient,
    (metric) => {
      console.log("Application metrics:", metric);
    }
  );

  console.log("Mocked AI response:", greeting);
} finally {
  await sdk.shutdown();
}