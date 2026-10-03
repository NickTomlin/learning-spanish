#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { readFile, mkdir, writeFile, rm, access } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { storyIngredients } from "./story-prompts.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PRINTING = join(ROOT, "printing");
const STORY = join(PRINTING, "current-story.json");
const OUTLINE = join(PRINTING, "current-outline.json");
const STORY_USAGE = join(PRINTING, "current-story-usage.json");
const MANIFEST = join(PRINTING, "current-run.json");
const PROMPTER_MODEL = "openai-codex/gpt-5.6-luna";
const TEACHER_MODEL = "openai-codex/gpt-6-sol";
const exec = promisify(execFile);

function usage() {
  throw new Error("Usage: ./practice.mjs make [--reuse | --story FILE] [--theme childhood] [--seed TEXT] | print");
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function run(file, args) {
  const { stdout } = await exec(file, args, { cwd: ROOT, maxBuffer: 1024 * 1024 });
  return stdout;
}

function summarizeUsage(messages) {
  const total = { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, estimatedUsd: 0 };
  for (const message of messages) {
    if (message.role !== "assistant" || !message.usage) continue;
    for (const field of ["input", "output", "reasoning", "cacheRead", "cacheWrite", "totalTokens"]) {
      total[field] += message.usage[field] || 0;
    }
    total.estimatedUsd += message.usage.cost?.total || 0;
  }
  return total;
}

async function askPi(modelRuntime, modelName, systemPrompt, prompt) {
  const { createAgentSession, createExtensionRuntime, SessionManager, SettingsManager } =
    await import("@earendil-works/pi-coding-agent");
  const [provider, ...parts] = modelName.split("/");
  const model = modelRuntime.getModel(provider, parts.join("/"));
  if (!model) throw new Error(`Model not found: ${modelName}`);
  const resourceLoader = {
    getExtensions: () => ({ extensions: [], errors: [], runtime: createExtensionRuntime() }),
    getSkills: () => ({ skills: [], diagnostics: [] }),
    getPrompts: () => ({ prompts: [], diagnostics: [] }),
    getThemes: () => ({ themes: [], diagnostics: [] }),
    getAgentsFiles: () => ({ agentsFiles: [] }),
    getSystemPrompt: () => systemPrompt,
    getSystemPromptSource: () => undefined,
    getAppendSystemPrompt: () => [],
    getAppendSystemPromptSources: () => [],
    extendResources: () => {},
    reload: async () => {},
  };
  const { session } = await createAgentSession({
    cwd: ROOT, model, modelRuntime, resourceLoader, tools: [], thinkingLevel: "low",
    sessionManager: SessionManager.inMemory(ROOT), settingsManager: SettingsManager.inMemory(),
  });
  try {
    await session.prompt(prompt);
    const usage = summarizeUsage(session.messages);
    console.log(`${modelName}: ${usage.input} input, ${usage.output} output (${usage.reasoning} reasoning), ${usage.cacheRead} cache-read, ${usage.cacheWrite} cache-write tokens; estimated $${usage.estimatedUsd.toFixed(4)}`);
    const text = session.getLastAssistantText();
    if (!text) {
      const last = session.messages.at(-1);
      throw new Error(`${modelName} returned no text (${last?.stopReason || "no response"}: ${last?.errorMessage || "no details"})`);
    }
    return { value: JSON.parse(text), usage };
  } finally {
    session.dispose();
  }
}

async function generateStory(seed, theme) {
  const { ModelRuntime } = await import("@earendil-works/pi-coding-agent");
  const modelRuntime = await ModelRuntime.create();
  const saved = await readFile(OUTLINE, "utf8").then(JSON.parse).catch(() => null);
  const chosenTheme = theme || (saved?.ingredients?.seed === seed ? saved.ingredients.theme : "any");
  const ingredients = storyIngredients(seed, chosenTheme);
  console.log(`Story seed: ${seed}\nScenario: ${ingredients.scenario}`);
  let outline = JSON.stringify(saved?.ingredients) === JSON.stringify(ingredients) ? saved.outline : null;
  const stages = {};
  if (!outline) {
    const planned = await askPi(modelRuntime, PROMPTER_MODEL,
      "You plan varied Spanish-learning stories. Return only valid JSON, without Markdown.",
      `Write a short story OUTLINE in English from these ingredients: ${JSON.stringify(ingredients)}. Return {"title":"...","beats":["...", "...", "...", "...", "..."]} with five concrete chronological events and an ending. Honor the scenario, complication and opening approach. Keep ownership and chronology consistent, resolve the central problem, and do not repeat the same event as a new beat. A clock time, time of day or weather is NOT required; mention one only if the plot needs it. Vary the plot; avoid defaulting to rain, lost keys, or a package. Do not write quiz blanks or verb answers.`);
    outline = planned.value;
    stages.prompter = planned.usage;
  } else console.log("Reusing saved outline; no prompter call.");
  if (!outline || !Array.isArray(outline.beats) || outline.beats.length < 4) {
    throw new Error("Prompter returned an invalid outline");
  }
  await writeFile(OUTLINE, JSON.stringify({ ingredients, outline }, null, 2) + "\n");

  const skill = await readFile(join(ROOT, ".agents/skills/practice-spanish-past-tenses/SKILL.md"), "utf8");
  const taught = await askPi(modelRuntime, TEACHER_MODEL,
    "You are a Spanish teacher writing a printable preterite/imperfect exercise. Return only valid JSON, without Markdown.",
    `Turn this outline into one coherent intermediate-level past-tense story quiz: ${JSON.stringify(outline)}. Follow the skill guidance below, especially tense contrasts and printable format. Preserve the outline's distinctive events, opening approach and resolution without narrating the same event twice. Do not begin with a generic clock time, time of day, or weather unless the plot requires it. Every blank answer MUST be simple preterite (pretérito indefinido) or imperfect; never compound tenses such as había movido, present, future, or subjunctive. Rewrite an earlier event if necessary so its blank takes one of the two target tenses. Return {"title":"...","instructions":"...","questions":[{"text":"___ (infinitive) ...","answers":["conjugated form"],"note":"optional viewpoint explanation"}]} with 6–10 chronological questions, one or two ___ blanks in each, one answer per blank, and at least one nuanced case with a note. Do not include numbering in question text.\n\n${skill}`);
  const story = taught.value;
  stages.teacher = taught.usage;
  const estimatedUsd = Object.values(stages).reduce((total, usage) => total + usage.estimatedUsd, 0);
  await writeFile(STORY_USAGE, JSON.stringify({ seed, stages, estimatedUsd }, null, 2) + "\n");
  console.log(`Estimated model cost this generation: $${estimatedUsd.toFixed(4)} (catalog rates, not a bill)`);
  for (const [index, question] of (story.questions || []).entries()) {
    for (const answer of question.answers || []) {
      if (/\bhab(?:ía|ías|íamos|íais|ían)\s+\p{L}+/iu.test(answer)) {
        throw new Error(`Question ${index + 1} uses a compound tense (${answer}); rerun with the same seed to retry only Sol`);
      }
    }
  }
  await writeFile(STORY, JSON.stringify(story, null, 2) + "\n");
}

function pdfFrom(output) {
  const match = output.match(/^PDF: (.+)$/m);
  if (!match) throw new Error(`PDF script did not report a file:\n${output}`);
  const pdf = resolve(match[1]);
  if (!pdf.startsWith(PRINTING + sep)) throw new Error(`PDF outside printing/: ${pdf}`);
  return relative(ROOT, pdf);
}

async function make(options) {
  const previous = await readFile(MANIFEST, "utf8").then(JSON.parse).catch(() => null);
  const freshStory = !options.reuse && !options.story;
  const seed = options.seed || (!freshStory && previous?.seed) || randomBytes(4).toString("hex");
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(seed)) throw new Error("Seed must be 1–64 letters, numbers, hyphens or underscores");
  if (options.theme) storyIngredients(seed, options.theme);
  if (options.reuse && !(await exists(STORY))) throw new Error("No saved story to reuse; run make first");
  await mkdir(PRINTING, { recursive: true });
  await rm(MANIFEST, { force: true });

  if (options.story) {
    const source = resolve(options.story);
    if (source !== STORY) await writeFile(STORY, await readFile(source));
    await rm(STORY_USAGE, { force: true });
  } else if (!options.reuse) {
    console.log(`Outline: ${PROMPTER_MODEL} if needed; quiz: ${TEACHER_MODEL}...`);
    await generateStory(seed, options.theme);
  }

  const pdfs = [];
  for (const sheet of ["preterite", "imperfect"]) {
    const url = `worksheet.html?sheet=${sheet}&blanks=24&tables=0&seed=${seed}-${sheet}&key=1`;
    pdfs.push(pdfFrom(await run(join(ROOT, "print-worksheet.py"), [url])));
  }
  pdfs.push(pdfFrom(await run(join(ROOT, "print-story.py"), [STORY])));
  await writeFile(MANIFEST, JSON.stringify({ seed, pdfs }, null, 2) + "\n");
  console.log(`Seed: ${seed}\nReview before printing:`);
  for (const pdf of pdfs) console.log(`  ${pdf}`);
  console.log(`Story HTML: printing/current-story.html\nThen run: ./practice.mjs print`);
}

async function print() {
  const { pdfs } = JSON.parse(await readFile(MANIFEST, "utf8"));
  if (!Array.isArray(pdfs) || pdfs.length !== 3) throw new Error("Invalid current-run.json; run make first");
  for (const entry of pdfs) {
    if (typeof entry !== "string" || isAbsolute(entry)) throw new Error("Invalid PDF path in current-run.json");
    const pdf = resolve(ROOT, entry);
    if (!pdf.startsWith(PRINTING + sep) || !(await exists(pdf))) {
      throw new Error(`Missing or invalid PDF: ${entry}`);
    }
  }
  for (const pdf of pdfs) {
    const result = await run("lp", ["-o", "sides=two-sided-long-edge", resolve(ROOT, pdf)]);
    process.stdout.write(result);
  }
}

try {
  const [command, ...args] = process.argv.slice(2);
  if (command === "make") {
    const options = {};
    while (args.length) {
      const arg = args.shift();
      if (arg === "--reuse") options.reuse = true;
      else if (arg === "--story" && args.length) options.story = args.shift();
      else if (arg === "--seed" && args.length) options.seed = args.shift();
      else if (arg === "--theme" && args.length) options.theme = args.shift();
      else usage();
    }
    if (options.reuse && options.story) usage();
    if (options.theme && (options.reuse || options.story)) usage();
    await make(options);
  } else if (command === "print" && !args.length) {
    await print();
  } else usage();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
