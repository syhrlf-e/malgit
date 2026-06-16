import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_FILE, normalizeConfig, readConfig } from "./config-reader.js";

const JSON_INDENT = 2;

export async function setConfigValue(key, value, cwd = process.cwd()) {
  const config = await readConfig(cwd);
  const updatedConfig = normalizeConfig({
    ...config,
    [key]: parseConfigValue(value)
  });

  await writeFile(
    join(cwd, CONFIG_FILE),
    `${JSON.stringify(updatedConfig, null, JSON_INDENT)}\n`,
    "utf8"
  );

  return updatedConfig;
}

function parseConfigValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
