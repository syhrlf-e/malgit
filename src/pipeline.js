import { analyzeChanges } from "./analyzer/change-analyzer.js";
import { classifyCommit } from "./classifier/commit-classifier.js";
import { readConfig, resolveLanguage } from "./config/config-reader.js";
import { readGitChanges } from "./git/git-reader.js";
import { generateMessage } from "./generator/message-generator.js";
import { parseDiff } from "./parser/diff-parser.js";
import { MalGitError } from "./errors.js";

export async function createSuggestion(options = {}) {
  const config = await readConfig();
  const language = resolveLanguage(options, config);
  const gitChanges = await readGitChanges();
  const parsedDiff = parseDiff(gitChanges.diff, gitChanges.files);

  if (parsedDiff.files.every((file) => file.additions === 0 && file.deletions === 0)) {
    throw new MalGitError("MalGit could not detect meaningful changes.");
  }

  const analysis = analyzeChanges(parsedDiff, config);
  const classification = classifyCommit(analysis);
  const suggestion = generateMessage(classification, parsedDiff, language);

  return {
    config,
    language,
    gitChanges,
    parsedDiff,
    analysis,
    suggestion
  };
}
