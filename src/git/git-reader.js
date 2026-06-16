import { MalGitError } from "../errors.js";
import { readStagedDiff } from "./git-diff.js";
import { parseStatus } from "./git-status.js";
import { run } from "../utils/shell.js";

export async function readGitChanges() {
  const repoCheck = await run("git", ["rev-parse", "--is-inside-work-tree"]);

  if (!repoCheck.ok || repoCheck.stdout !== "true") {
    throw new MalGitError("MalGit Error:\nCurrent directory is not a Git repository.");
  }

  const statusResult = await run("git", ["status", "--short"]);
  const files = parseStatus(statusResult.stdout).filter((file) => file.staged);

  if (files.length === 0) {
    throw new MalGitError("No staged changes found.\n\nRun:\ngit add <file>");
  }

  const diffResult = await readStagedDiff();

  if (!diffResult.ok) {
    throw new MalGitError(`MalGit Error:\n${diffResult.stderr}`);
  }

  return {
    status: "success",
    diff: diffResult.stdout,
    files
  };
}
