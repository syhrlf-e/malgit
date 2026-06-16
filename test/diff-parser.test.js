import test from "node:test";
import assert from "node:assert/strict";
import { isMeaningfulLine, parseDiff } from "../src/parser/diff-parser.js";

test("filters comments, whitespace, and ordinary imports", () => {
  assert.equal(isMeaningfulLine("   "), false);
  assert.equal(isMeaningfulLine("// comment"), false);
  assert.equal(isMeaningfulLine("import x from 'y';"), false);
  assert.equal(isMeaningfulLine("const verifyEmail = async () => {}"), true);
});

test("parses added and removed lines per file", () => {
  const diff = [
    "diff --git a/src/auth/service.ts b/src/auth/service.ts",
    "index 111..222 100644",
    "--- a/src/auth/service.ts",
    "+++ b/src/auth/service.ts",
    "@@ -1 +1 @@",
    "-const login = async () => {}",
    "+const verifyEmail = async () => {}"
  ].join("\n");

  const parsed = parseDiff(diff, [{ path: "src/auth/service.ts", status: "modified" }]);

  assert.equal(parsed.files.length, 1);
  assert.deepEqual(parsed.files[0].addedLines, ["const verifyEmail = async () => {}"]);
  assert.deepEqual(parsed.files[0].removedLines, ["const login = async () => {}"]);
});

test("ignores lock files when other files changed", () => {
  const parsed = parseDiff("", [
    { path: "package-lock.json", status: "modified" },
    { path: "package.json", status: "modified" }
  ]);

  assert.deepEqual(
    parsed.files.map((file) => file.path),
    ["package.json"]
  );
});
