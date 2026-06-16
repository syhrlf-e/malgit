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
    return detectDocsTarget(files);
  }

  if (type === "chore" && files.some((file) => file.path.toLowerCase() === "package.json")) {
    return detectPackageTarget(files);
  }

  if (type === "test" || files.every((file) => /\.(test|spec)\./.test(file.path.toLowerCase()))) {
    return "test cases";
  }

  if (type === "ci" || files.every((file) => file.path.toLowerCase().startsWith(".github/workflows/"))) {
    return "workflow";
  }

  if (type === "style" && files.every((file) => /\.(css|scss|sass|less)$/.test(file.path.toLowerCase()))) {
    return "styles";
  }

  const tokens = collectTokens(selectTargetFiles(type, files));
  if (
    type === "feat" &&
    files.some((file) => /src\/(analyzer|classifier|generator)\//.test(file.path.toLowerCase()))
  ) {
    return "commit message classification";
  }
  if (type === "perf" && tokens.some((token) => ["cache", "cached", "memo", "memoized"].includes(token))) {
    return "caching";
  }
  if (type === "refactor" && tokens.includes("calculate") && tokens.includes("total")) {
    return "total calculation";
  }
  if (type === "refactor" && tokens.some((token) => ["subtotal", "tax", "discount", "shipping"].includes(token))) {
    return "calculation logic";
  }
  if (tokens.includes("email") && (tokens.includes("verify") || tokens.includes("verification"))) {
    return "email verification";
  }
  if (tokens.includes("validate") || tokens.includes("validation")) return "validation handling";
  if (tokens.includes("auth") || tokens.includes("authentication")) return "authentication logic";
  if (tokens.length > 0) return tokens.slice(0, 3).join(" ");

  return TYPE_TARGET_FALLBACK[type] ?? "project files";
}

function detectDocsTarget(files) {
  const docsFiles = files.filter((file) => {
    const path = file.path.toLowerCase();
    return path === "readme.md" || path.startsWith("docs/") || path.endsWith(".md");
  });
  const selectedFiles = docsFiles.length > 0 ? docsFiles : files;
  const docsText = collectChangedText(selectedFiles);
  const tokens = collectTokens(selectedFiles);

  if (tokens.some((token) => ["author", "authors", "maintainer", "maintainers"].includes(token))) {
    return "author information";
  }

  if (tokens.some((token) => ["install", "installation", "npm", "link"].includes(token))) {
    return "installation guide";
  }

  if (tokens.some((token) => ["command", "commands", "usage", "example", "examples"].includes(token))) {
    return "usage instructions";
  }

  if (tokens.some((token) => ["config", "configuration", "malgitrc"].includes(token))) {
    return "configuration guide";
  }

  if (/\b(?:git|malgit)\s+(?:add|commit|diff|status)\b|--(?:dry-run|yes)\b/.test(docsText)) {
    return "commit workflow";
  }

  if (tokens.some((token) => ["description", "overview", "intro", "introduction"].includes(token))) {
    return "project description";
  }

  if (docsFiles.some((file) => file.path.toLowerCase() === "readme.md")) {
    return "project description";
  }

  return "documentation";
}

function detectPackageTarget(files) {
  const packageFiles = files.filter((file) => file.path.toLowerCase() === "package.json");
  const tokens = collectTokens(packageFiles);

  if (tokens.some((token) => ["dependencies", "devdependencies", "dependency"].includes(token))) {
    return "dependencies";
  }

  if (tokens.some((token) => ["scripts", "test", "start", "dev", "lint"].includes(token))) {
    return "package scripts";
  }

  if (tokens.some((token) => ["bin", "files", "exports", "main", "types"].includes(token))) {
    return "package metadata";
  }

  return "package metadata";
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
  const text = files.flatMap((file) => [file.path, ...file.addedLines, ...file.removedLines]).join(" ");

  return normalizeWords(text)
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word));
}

function collectChangedText(files) {
  return files
    .flatMap((file) => [...file.addedLines, ...file.removedLines])
    .join(" ")
    .toLowerCase();
}

function normalizeWords(text) {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
