
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const ignoredDirectories = new Set([
  ".git",
  "node_modules",
]);

function getMarkdownFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    if (
      entry.isDirectory() &&
      ignoredDirectories.has(entry.name)
    ) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".md")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractLocalLinks(markdown) {
  const links = [];
  const pattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;

  for (const match of markdown.matchAll(pattern)) {
    const target = match[1].replace(/^<|>$/g, "");

    if (
      target.startsWith("#") ||
      /^[a-z][a-z\d+.-]*:/i.test(target) ||
      target.startsWith("//")
    ) {
      continue;
    }

    const pathname = decodeURIComponent(
      target.split("#")[0].split("?")[0]
    );

    if (pathname) {
      links.push(pathname);
    }
  }

  return links;
}

const markdownFiles = getMarkdownFiles(projectRoot);
const brokenLinks = [];

for (const sourceFile of markdownFiles) {
  const content = fs.readFileSync(sourceFile, "utf8");

  for (const link of extractLocalLinks(content)) {
    const targetPath = path.resolve(
      path.dirname(sourceFile),
      link
    );

    const relativeTarget = path.relative(
      projectRoot,
      targetPath
    );

    if (
      relativeTarget === ".." ||
      relativeTarget.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativeTarget)
    ) {
      brokenLinks.push({
        sourceFile,
        link,
        reason: "target is outside the project",
      });
      continue;
    }

    if (!fs.existsSync(targetPath)) {
      brokenLinks.push({
        sourceFile,
        link,
        reason: "target does not exist",
      });
    }
  }
}

if (brokenLinks.length > 0) {
  console.error(`Found ${brokenLinks.length} broken local link(s):`);

  for (const item of brokenLinks) {
    console.error(
      `- ${path.relative(projectRoot, item.sourceFile)}: ` +
      `"${item.link}" (${item.reason})`
    );
  }

  process.exitCode = 1;
} else {
  console.log(
    `Documentation link check passed: scanned ${markdownFiles.length} Markdown file(s).`
  );
}
