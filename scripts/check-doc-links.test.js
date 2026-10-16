import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const checkerPath = path.join(scriptDirectory, "check-doc-links.js");

function createFixture(t, markdown) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "doc-link-check-")
  );

  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  const scriptsDirectory = path.join(root, "scripts");
  fs.mkdirSync(scriptsDirectory);

  fs.copyFileSync(
    checkerPath,
    path.join(scriptsDirectory, "check-doc-links.js")
  );

  fs.writeFileSync(path.join(root, "README.md"), markdown, "utf8");

  return {
    root,
    checker: path.join(scriptsDirectory, "check-doc-links.js"),
  };
}

function runChecker(checker) {
  return spawnSync(process.execPath, [checker], {
    encoding: "utf8",
  });
}

test("passes when a local Markdown link exists", (t) => {
  const fixture = createFixture(t, "[Read the guide](guide.md)");

  fs.writeFileSync(
    path.join(fixture.root, "guide.md"),
    "# Guide",
    "utf8"
  );

  const result = runChecker(fixture.checker);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /link check passed/i);
});

test("fails when a local link target does not exist", (t) => {
  const fixture = createFixture(
    t,
    "[Read the missing guide](missing-guide.md)"
  );

  const result = runChecker(fixture.checker);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /target does not exist/i);
});

test("rejects local links that escape the project directory", (t) => {
  const fixture = createFixture(t, "[Outside file](../outside.md)");

  const result = runChecker(fixture.checker);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /outside the project/i);
});
