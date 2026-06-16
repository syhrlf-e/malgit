import { run } from "../utils/shell.js";

export async function readStagedDiff() {
  return run("git", ["diff", "--staged", "--no-ext-diff", "--unified=0"]);
}
