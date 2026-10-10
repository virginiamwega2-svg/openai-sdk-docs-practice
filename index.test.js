import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("shows a helpful error when the API key is missing", () => {
  const result = spawnSync(process.execPath, ["index.js"], {
    encoding: "utf8",
    env: {
      ...process.env,
      OPENAI_API_KEY: "your_api_key_here",
    },
  });

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Missing API key\. Add a valid OPENAI_API_KEY to your \.env file\./
  );
});