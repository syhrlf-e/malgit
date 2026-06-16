import { Command } from "commander";
import { runCommitCommand } from "./commands/commit.js";
import { runConfigCommand } from "./commands/config.js";
import { runExplainCommand } from "./commands/explain.js";
import { runSuggestCommand } from "./commands/suggest.js";

const VERSION = "0.2.0";

export function createProgram() {
  const program = new Command();

  program
    .name("malgit")
    .description("Generate Conventional Commit messages from staged Git changes")
    .usage("<command> [options]")
    .version(VERSION, "-V, --version", "Display version number")
    .helpOption("-h, --help", "Display help for command")
    .showHelpAfterError("(run `malgit --help` for usage)")
    .addHelpText(
      "beforeAll",
      [
        `MalGit v${VERSION}`,
        "Generate Conventional Commit messages from staged Git changes.",
        "",
        "Workflow:",
        "  1. Stage your changes with `git add`",
        "  2. Review the suggestion with `malgit suggest` or `malgit explain`",
        "  3. Commit safely with `malgit commit`",
        ""
      ].join("\n")
    )
    .addHelpText(
      "after",
      [
        "",
        "Examples:",
        "  $ malgit suggest",
        "  $ malgit suggest --lang id",
        "  $ malgit explain",
        "  $ malgit commit --dry-run",
        "  $ malgit config set language id",
        "",
        "Notes:",
        "  MalGit reads staged changes only. Run `git add <file>` first.",
        "  `malgit commit` asks for confirmation unless `--yes` is used."
      ].join("\n")
    );

  program
    .command("suggest")
    .description("Generate commit message suggestions from staged changes")
    .option("--lang <language>", "Output language: en or id")
    .option("--en", "Use English output")
    .option("--id", "Use Indonesian output")
    .action(runSuggestCommand);

  program
    .command("explain")
    .description("Show changed files, scores, confidence, and suggested type")
    .option("--lang <language>", "Output language: en or id")
    .option("--en", "Use English output")
    .option("--id", "Use Indonesian output")
    .action(runExplainCommand);

  program
    .command("commit")
    .description("Generate a message, confirm it, then run git commit")
    .option("--lang <language>", "Output language: en or id")
    .option("--en", "Use English output")
    .option("--id", "Use Indonesian output")
    .option("-y, --yes", "Commit without confirmation")
    .option("--dry-run", "Preview the commit command without committing")
    .action(runCommitCommand);

  const config = program.command("config").description("Read or update .malgitrc");

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
