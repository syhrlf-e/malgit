import test from "node:test";
import assert from "node:assert/strict";
import { analyzeChanges } from "../src/analyzer/change-analyzer.js";
import { classifyCommit } from "../src/classifier/commit-classifier.js";
import { DEFAULT_CONFIG } from "../src/config/config-reader.js";
import { generateMessage } from "../src/generator/message-generator.js";

test("classifies auth verification as feature with auth scope", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/auth/service.ts",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["const verifyEmail = async () => {}"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "feat");
  assert.equal(classification.scope, "auth");
  assert.equal(suggestion.message, "feat(auth): add email verification");
});

test("supports Indonesian description formatting", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/auth/service.ts",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["const verifyEmail = async () => {}"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "id");

  assert.equal(suggestion.message, "feat(auth): menambahkan verifikasi email");
});

test("uses priority order when scores tie", () => {
  const classification = classifyCommit({
    dominantScope: "auth",
    confidence: 0.5,
    globalScores: {
      feat: 2,
      fix: 2,
      docs: 0,
      style: 0,
      refactor: 0,
      test: 0,
      chore: 0,
      perf: 0,
      ci: 0
    }
  });

  assert.equal(classification.type, "feat");
  assert.equal(classification.lowConfidence, true);
});

test("keeps feature target when source and README change together", () => {
  const parsedDiff = {
    files: [
      {
        path: "src/auth/service.ts",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["const verifyEmail = async () => {}"],
        removedLines: []
      },
      {
        path: "README.md",
        status: "modified",
        additions: 1,
        deletions: 0,
        addedLines: ["## Email verification"],
        removedLines: []
      }
    ]
  };

  const analysis = analyzeChanges(parsedDiff, DEFAULT_CONFIG);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, "en");

  assert.equal(classification.type, "feat");
  assert.equal(suggestion.message, "feat(auth): add email verification");
});
