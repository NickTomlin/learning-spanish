import assert from 'node:assert/strict';
import { normalizeSheet } from '../lib/sheet.js';
import { buildExercises } from '../lib/worksheet-page.js';
import preteriteRaw from '../sheets/preterite.js';
import imperfectRaw from '../sheets/imperfect.js';

for (const rawSheet of [preteriteRaw, imperfectRaw]) {
  const sheet = normalizeSheet(rawSheet);
  const opts = {
    cats: [sheet.categories[0].id],
    axisIndices: [0, 2, 4],
    blanks: 12,
    tables: 2,
    seed: 'subject-filter',
  };
  const exercises = buildExercises(sheet, opts);
  assert.equal(exercises.blanks.length, opts.blanks);
  assert.equal(exercises.tableItems.length, opts.tables);
  assert.ok(exercises.blanks.every((q) => opts.axisIndices.includes(q.axisIndex)));
  assert.ok(exercises.blanks.every((q) => q.answer === q.item.forms[q.axisIndex]));
  assert.ok(exercises.blanks.every((q) => q.item.category === opts.cats[0]));
  assert.equal(new Set(exercises.blanks.map((q) => q.key)).size, opts.blanks);
  assert.ok(exercises.blanks.every((q) => !exercises.tableItems.includes(q.item)));
  assert.deepEqual(buildExercises(sheet, opts), exercises, 'same seed and options reproduce the worksheet');

  const oneSubject = buildExercises(sheet, { ...opts, axisIndices: [3], blanks: 200, tables: 0 });
  assert.equal(oneSubject.blanks.length, sheet.items.filter((i) => i.category === opts.cats[0]).length);
  assert.ok(oneSubject.blanks.every((q) => q.axisIndex === 3));

  const defaults = buildExercises(sheet, { ...opts, axisIndices: undefined, blanks: 200, tables: 0 });
  assert.equal(new Set(defaults.blanks.map((q) => q.axisIndex)).size, sheet.axis.values.length);
}

console.log('Validated subject filtering, category filtering, answer alignment, and reproducible worksheets for both tenses.');
