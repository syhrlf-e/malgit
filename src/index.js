import { Command } from "commander";
import { runCommitCommand } from "./commands/commit.js";
import { runConfigCommand } from "./commands/config.js";
import { runExplainCommand } from "./commands/explain.js";
import { runSuggestCommand } from "./commands/suggest.js";

export function createProgram() {
  const program = new Command();

  program
    .name("malgit")
    .description("Generate commit messages from git diff")
    .version("0.2.0");

  program
    .command("suggest")
    .description("Suggest a Conventional Commit message from staged changes")
    .option("--lang <language>", "Output language: en or id")
    .option("--en", "Use English output")
    .option("--id", "Use Indonesian output")
    .action(runSuggestCommand);

  program
    .command("explain")
    .description("Explain staged changes and score breakdown")
    .option("--lang <language>", "Output language: en or id")
    .option("--en", "Use English output")
    .option("--id", "Use Indonesian output")
    .action(runExplainCommand);

  program
    .command("commit")
    .description("Generate a commit message and run git commit")
    .option("--lang <language>", "Output language: en or id")
    .option("--en", "Use English output")
    .option("--id", "Use Indonesian output")
    .option("-y, --yes", "Commit without confirmation")
    .option("--dry-run", "Preview the commit command without committing")
    .action(runCommitCommand);

  const config = program.command("config").description("Read or update MalGit config");

  config
    .command("set <key> <value>")
    .description("Set a config value in .malgitrc")
    .action((key, value) => runConfigCommand({ action: "set", key, value }));

  config
    .command("get [key]")
    .description("Get a config value from .malgitrc")
    .action((key) => runConfigCommand({ action: "get", key }));

  config.action(() => runConfigCommand({ action: "list" }));

  return program;
}
