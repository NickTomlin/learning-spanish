import { readFile, writeFile, rename } from "node:fs/promises";

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw new Error(`Cannot read story history from ${path}: ${error.message}`);
  }
}

function validEntry(entry) {
  return ["seed", "theme", "scenario", "complication", "opening"].every(
    (field) => typeof entry?.ingredients?.[field] === "string" && entry.ingredients[field].trim()
  ) && typeof entry?.outline?.title === "string" && Array.isArray(entry.outline.beats) &&
    entry.outline.beats.every((beat) => typeof beat === "string");
}

export async function loadStoryHistory(path, outlinePath) {
  const history = await readJson(path);
  if (history !== undefined) {
    if (!Array.isArray(history) || !history.every(validEntry)) {
      throw new Error(`Invalid story history: ${path}`);
    }
    return history;
  }
  // Older quizzes do not contain structured scenario metadata. Start with
  // the existing outline when upgrading an installation without history.
  const previous = await readJson(outlinePath);
  return validEntry(previous) ? [previous] : [];
}

export async function recordStoryHistory(path, history, ingredients, outline) {
  // Replaying a seed does not make it a new use of that scenario.
  const entries = history.some((entry) => entry.ingredients.seed === ingredients.seed &&
    entry.ingredients.scenario === ingredients.scenario && entry.ingredients.theme === ingredients.theme) ? history : [...history, { ingredients, outline }];
  // Keep compact local context independently of the 15-quiz lookup archive.
  const temporary = `${path}.tmp`;
  await writeFile(temporary, JSON.stringify(entries.slice(-100), null, 2) + "\n");
  await rename(temporary, path);
}
