import { ACTION_BY_TYPE, TYPE_TARGET_FALLBACK } from "./templates.js";
import { formatDescription } from "../formatter/language-formatter.js";

const STOP_WORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "async",
  "await",
  "return",
  "export",
  "default",
  "class",
  "new",
  "true",
  "false",
  "null",
  "undefined",
  "string",
  "number",
  "boolean",
  "void"
]);

export function generateMessage(classification, parsedDiff, language) {
  const description = createDescription(classification.type, parsedDiff, language);
  const scope = classification.scope ? `(${classification.scope})` : "";

  return {
    ...classification,
    description,
    message: `${classification.type}${scope}: ${description}`,
    suggestions: classification.lowConfidence
      ? classification.rankedTypes.slice(0, 3).map(({ type }) => {
          const optionDescription = createDescription(type, parsedDiff, language);
          const optionScope = classification.scope ? `(${classification.scope})` : "";

          return {
            type,
            scope: classification.scope,
            description: optionDescription,
            message: `${type}${optionScope}: ${optionDescription}`
          };
        })
      : []
  };
}

export function createDescription(type, parsedDiff, language = "en") {
  const action = ACTION_BY_TYPE[type] ?? "update";
  const target = detectTarget(type, parsedDiff);

  return formatDescription({ action, target }, language);
}

function detectTarget(type, parsedDiff) {
  const files = parsedDiff.files;

  if (type === "docs" || files.every((file) => file.path.toLowerCase().endsWith(".md"))) {
    return "documentation";
  }

  if (type === "chore" && files.some((file) => file.path.toLowerCase() === "package.json")) {
    return "dependencies";
  }

  if (type === "test" || files.every((file) => /\.(test|spec)\./.test(file.path.toLowerCase()))) {
    return "test cases";
  }

  if (type === "ci" || files.every((file) => file.path.toLowerCase().startsWith(".github/workflows/"))) {
    return "workflow";
  }

  const tokens = collectTokens(selectTargetFiles(type, files));
  if (tokens.includes("email") && (tokens.includes("verify") || tokens.includes("verification"))) {
    return "email verification";
  }
  if (tokens.includes("auth") || tokens.includes("authentication")) return "authentication logic";
  if (tokens.includes("validate") || tokens.includes("validation")) return "validation handling";
  if (tokens.length > 0) return tokens.slice(0, 3).join(" ");

  return TYPE_TARGET_FALLBACK[type] ?? "project files";
}

function selectTargetFiles(type, files) {
  if (["feat", "fix", "perf", "refactor"].includes(type)) {
    const implementationFiles = files.filter((file) => {
      const path = file.path.toLowerCase();
      return (
        !path.endsWith(".md") &&
        path !== "package.json" &&
        path !== "package-lock.json" &&
        path !== "yarn.lock" &&
        path !== "pnpm-lock.yaml"
      );
    });

    return implementationFiles.length > 0 ? implementationFiles : files;
  }

  return files;
}

function collectTokens(files) {
  const text = files
    .flatMap((file) => [file.path, ...file.addedLines])
    .join(" ");

  return normalizeWords(text)
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word));
}

function normalizeWords(text) {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
