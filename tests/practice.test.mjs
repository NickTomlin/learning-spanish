import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, writeFile, chmod, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { storyIngredients } from "../story-prompts.mjs";
import { loadStoryHistory, recordStoryHistory } from "../story-history.mjs";
import { reviewIssues } from "../story-review.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const exec = promisify(execFile);

test("a seed selects repeatable, varied story ingredients", () => {
  assert.deepEqual(storyIngredients("garden-1"), storyIngredients("garden-1"));
  const scenarios = new Set(Array.from({ length: 20 }, (_, i) => storyIngredients(`round-${i}`).scenario));
  assert.ok(scenarios.size >= 5);
  const childhood = storyIngredients("round-1", "childhood");
  assert.match(childhood.scenario, /child/i);
  assert.ok(childhood.opening);
  assert.equal("time" in childhood, false);
  assert.throws(() => storyIngredients("round-1", "unknown"), /Unknown theme/);
});

test("review verdicts fail closed and catch compound answers", () => {
  const story = { questions: Array.from({ length: 6 }, () => ({ answers: ["cantaba"], explanations: ["Imperfect: singing was ongoing."] })) };
  assert.deepEqual(reviewIssues({ pass: true, issues: [] }, story), []);
  assert.deepEqual(reviewIssues({ pass: false, issues: ["Question 1: wrong form"] }, story), ["Question 1: wrong form"]);
  story.questions[1].answers = ["había cantado"];
  assert.match(reviewIssues({ pass: true, issues: [] }, story)[0], /Question 2: compound tense/);
  assert.throws(() => reviewIssues({ pass: false, issues: [] }, story), /invalid verdict/);
  assert.throws(() => reviewIssues({ pass: true, issues: ["wrong"] }, story), /invalid verdict/);
});

test("local history rotates every scenario before repeating, including across cycles", () => {
  for (const [theme, size] of [["any", 15], ["childhood", 5]]) {
    const history = [];
    for (let i = 0; i < size * 3; i++) {
      const ingredients = storyIngredients(`rotation-${i}`, theme, history);
      assert.deepEqual(ingredients, storyIngredients(`rotation-${i}`, theme, history));
      assert.ok(!history.slice(-(size - 1)).some((entry) => entry.ingredients.scenario === ingredients.scenario));
      assert.ok(!history.slice(-4).some((entry) => entry.ingredients.complication === ingredients.complication));
      const openingCount = theme === "childhood" ? 4 : 5;
      assert.ok(!history.slice(-(openingCount - 1)).some((entry) => entry.ingredients.opening === ingredients.opening));
      history.push({ ingredients });
    }
    assert.equal(new Set(history.slice(0, size).map((entry) => entry.ingredients.scenario)).size, size);
  }
});

test("history shares scenario use across themes", () => {
  const ingredients = storyIngredients("bakery-1", "childhood");
  const history = [{ ingredients }];
  assert.notEqual(storyIngredients("bakery-1", "any", history).scenario, ingredients.scenario);
  assert.notEqual(storyIngredients("bakery-1", "childhood", history).scenario, ingredients.scenario);
});

test("history survives reloads, starts with the previous outline, and rejects corruption", async () => {
  const dir = await mkdtemp(join(tmpdir(), "spanish-history-"));
  try {
    const path = join(dir, "history.json");
    const outlinePath = join(dir, "outline.json");
    assert.deepEqual(await loadStoryHistory(path, outlinePath), []);
    const previous = { ingredients: storyIngredients("previous"), outline: { title: "Previous", beats: ["An event"] } };
    await writeFile(outlinePath, JSON.stringify(previous));
    const history = await loadStoryHistory(path, outlinePath);
    assert.deepEqual(history, [previous]);
    const ingredients = storyIngredients("next", "any", history);
    assert.notEqual(ingredients.scenario, previous.ingredients.scenario);
    await recordStoryHistory(path, history, ingredients, previous.outline);
    const reloaded = await loadStoryHistory(path, outlinePath);
    assert.equal(reloaded.length, 2);
    await recordStoryHistory(path, reloaded, ingredients, previous.outline);
    assert.deepEqual(await loadStoryHistory(path, outlinePath), reloaded);
    await writeFile(path, "broken JSON");
    await assert.rejects(loadStoryHistory(path, outlinePath), /Cannot read story history/);
    await writeFile(path, "{}");
    await assert.rejects(loadStoryHistory(path, outlinePath), /Invalid story history/);
    await writeFile(path, "null");
    await assert.rejects(loadStoryHistory(path, outlinePath), /Invalid story history/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("generated quizzes require one nonempty explanation per answer", () => {
  for (const explanations of [undefined, [], [""], ["one", "extra"], [null]]) {
    const story = { questions: Array.from({ length: 6 }, () => ({ answers: ["cantaba"], explanations })) };
    assert.equal(reviewIssues({ pass: true, issues: [] }, story).length, 6);
  }
});

test("deterministic worksheets and opt-in printing", async () => {
  const dir = await mkdtemp(join(tmpdir(), "spanish-practice-"));
  try {
    for (const file of ["practice.mjs", "story-prompts.mjs", "story-review.mjs", "story-history.mjs", "story_archive.py", "print-story.py", "print-worksheet.py", "worksheet.html"]) {
      await cp(join(ROOT, file), join(dir, file));
    }
    for (const folder of ["css", "lib", "sheets", "templates", "examples"]) {
      await cp(join(ROOT, folder), join(dir, folder), { recursive: true });
    }

    const run = (...args) => exec(join(dir, "practice.mjs"), args, { cwd: dir });
    const usagePath = join(dir, "printing/current-story-usage.json");
    const reviewPath = join(dir, "printing/current-story-review.json");
    const historyPath = join(dir, "printing/story-variety-history.json");
    await mkdir(join(dir, "printing"));
    await writeFile(historyPath, "[]\n");
    await writeFile(usagePath, "stale model usage");
    await writeFile(reviewPath, "stale review");
    await run("make", "--seed", "garden-1", "--story", "examples/past-tenses.json");
    await assert.rejects(readFile(usagePath));
    await assert.rejects(readFile(reviewPath));
    const manifestPath = join(dir, "printing/current-run.json");
    const first = JSON.parse(await readFile(manifestPath, "utf8"));
    assert.equal(first.seed, "garden-1");
    assert.equal(first.pdfs.length, 3);
    for (const pdf of first.pdfs) {
      assert.match((await readFile(join(dir, pdf))).subarray(0, 4).toString(), /^%PDF$/);
    }

    await run("make", "--reuse");
    assert.deepEqual(JSON.parse(await readFile(manifestPath, "utf8")), first);
    assert.equal(await readFile(historyPath, "utf8"), "[]\n");

    const marker = join(dir, "lp-calls");
    const printer = join(dir, "lp");
    await writeFile(printer, `#!/bin/sh\nprintf '%s\\n' "$*" >> '${marker}'\n`);
    await chmod(printer, 0o755);
    await exec(join(dir, "practice.mjs"), ["print"], {
      cwd: dir, env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
    });
    const calls = (await readFile(marker, "utf8")).trim().split("\n");
    assert.equal(calls.length, 3);
    assert.ok(calls.every((call) => call.includes("sides=two-sided-long-edge")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
