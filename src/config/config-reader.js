import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DEFAULT_SCOPE_MAPPING, SUPPORTED_LANGUAGES } from "../constants.js";
import { MalGitError } from "../errors.js";

export const CONFIG_FILE = ".malgitrc";

export const DEFAULT_CONFIG = {
  language: "en",
  defaultMode: "staged",
  confirmBeforeCommit: true,
  scopeMapping: DEFAULT_SCOPE_MAPPING
};

export async function readConfig(cwd = process.cwd()) {
  const configPath = join(cwd, CONFIG_FILE);

  try {
    const rawConfig = await readFile(configPath, "utf8");
    const userConfig = JSON.parse(rawConfig);

    return normalizeConfig(userConfig);
  } catch (error) {
    if (error.code === "ENOENT") {
      return DEFAULT_CONFIG;
    }

    if (error instanceof SyntaxError) {
      throw new MalGitError(`MalGit Error:\nInvalid JSON in ${CONFIG_FILE}.`);
    }

    throw error;
  }
}

export function normalizeConfig(config = {}) {
  const language = config.language ?? DEFAULT_CONFIG.language;

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new MalGitError(
      `Unsupported language: ${language}\n\nSupported languages:\n- en\n- id`
    );
  }

  return {
    ...DEFAULT_CONFIG,
    ...config,
    language,
    scopeMapping: {
      ...DEFAULT_SCOPE_MAPPING,
      ...(config.scopeMapping ?? {})
    }
  };
}

export function resolveLanguage(options = {}, config = DEFAULT_CONFIG) {
  if (options.en) return "en";
  if (options.id) return "id";

  const language = options.lang ?? config.language ?? DEFAULT_CONFIG.language;

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new MalGitError(
      `Unsupported language: ${language}\n\nSupported languages:\n- en\n- id`
    );
  }

  return language;
}
