import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function run(command, args, options = {}) {
  try {
    const result = await execFileAsync(command, args, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 10,
      ...options
    });

    return {
      ok: true,
      stdout: result.stdout.trimEnd(),
      stderr: result.stderr.trimEnd()
    };
  } catch (error) {
    return {
      ok: false,
      stdout: error.stdout?.trimEnd() ?? "",
      stderr: error.stderr?.trimEnd() ?? error.message,
      code: error.code
    };
  }
}
