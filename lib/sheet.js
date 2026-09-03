/**
 * Core sheet model — shared by the interactive study page and the printable
 * worksheet, so both always agree on what a question is.
 *
 * A sheet definition looks like:
 *
 *   {
 *     id, title, titleHTML?, subtitle?, footer?,
 *     itemNoun?, itemNounPlural?, inputPlaceholder?, searchPlaceholder?,
 *     worksheetInstructions?, referenceInstructions?,
 *     axis:       { label, values: [...], shortValues?: [...] },
 *     categories: [ { id, name, desc?, highlight?: [colIndex, ...] } ],
 *     items:      [ { term, gloss?, category, forms: [...], note? } ],
 *     patterns?:  [ { title, table?: { head, rows, accentColumn? }, list?: [html] } ],
 *   }
 *
 * `forms` is positional: forms[i] is the answer for axis.values[i].
 */

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function stripAccents(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Loose comparison for answer checking: case- and whitespace-insensitive. */
export function normalizeAnswer(s) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Fill in defaults and validate the shape enough to fail loudly on typos
 * rather than rendering a half-broken page.
 */
export function normalizeSheet(sheet) {
  if (!sheet || !sheet.id) throw new Error('Sheet is missing an id');
  if (!sheet.axis || !Array.isArray(sheet.axis.values) || !sheet.axis.values.length) {
    throw new Error(`Sheet "${sheet.id}" is missing axis.values`);
  }

  const axis = {
    label: sheet.axis.label || 'Form',
    values: sheet.axis.values,
    shortValues: sheet.axis.shortValues || sheet.axis.values,
  };
  const width = axis.values.length;

  const categories = (sheet.categories || []).map((c) => ({
    desc: '',
    highlight: [],
    ...c,
  }));
  const knownCats = new Set(categories.map((c) => c.id));

  const items = (sheet.items || []).map((item) => {
    if (!knownCats.has(item.category)) {
      throw new Error(`Sheet "${sheet.id}": item "${item.term}" has unknown category "${item.category}"`);
    }
    if (item.forms.length !== width) {
      throw new Error(
        `Sheet "${sheet.id}": item "${item.term}" has ${item.forms.length} forms, expected ${width}`
      );
    }
    return { gloss: '', note: '', ...item };
  });

  return {
    titleHTML: esc(sheet.title),
    subtitle: '',
    footer: '',
    itemNoun: 'item',
    itemNounPlural: 'items',
    inputPlaceholder: 'answer…',
    searchPlaceholder: 'Search…',
    worksheetInstructions: 'Write the correct form for each prompt.',
    referenceInstructions: 'Every form, grouped by pattern.',
    patterns: [],
    ...sheet,
    axis,
    categories,
    items,
  };
}

export function itemsInCategory(sheet, categoryId) {
  return sheet.items.filter((i) => i.category === categoryId);
}

/** Every (item, axis position) pair a sheet can ask about. */
export function allQuestions(sheet, categoryIds, axisIndices) {
  const allowedCategories = categoryIds ? new Set(categoryIds) : null;
  const allowedAxisIndices = axisIndices ? new Set(axisIndices) : null;
  const out = [];
  sheet.items.forEach((item, itemIndex) => {
    if (allowedCategories && !allowedCategories.has(item.category)) return;
    item.forms.forEach((answer, axisIndex) => {
      if (allowedAxisIndices && !allowedAxisIndices.has(axisIndex)) return;
      out.push({
        key: `${itemIndex}:${axisIndex}`,
        item,
        axisIndex,
        axisLabel: sheet.axis.values[axisIndex],
        axisShortLabel: sheet.axis.shortValues[axisIndex],
        answer,
      });
    });
  });
  return out;
}

/**
 * Draw `count` distinct questions. Distinct means a unique (item, form) pair —
 * so a worksheet never asks the same blank twice. If the pool is smaller than
 * `count`, the whole pool is returned.
 *
 * With `spread`, questions are dealt round-robin across items: every item gets
 * asked once before any item is asked twice. Without it, a 24-blank worksheet
 * can easily land on the same verb four times while never touching others.
 */
export function sampleQuestions(
  sheet,
  { categoryIds, axisIndices, count, random = Math.random, spread = false } = {}
) {
  const pool = allQuestions(sheet, categoryIds, axisIndices);
  const take = (arr) => arr.slice(0, Math.min(count ?? arr.length, arr.length));
  if (!spread) return take(shuffle(pool, random));

  const byItem = new Map();
  for (const q of pool) {
    if (!byItem.has(q.item)) byItem.set(q.item, []);
    byItem.get(q.item).push(q);
  }
  const groups = shuffle([...byItem.values()], random).map((g) => shuffle(g, random));
  const rounds = Math.max(...groups.map((g) => g.length));
  const out = [];
  for (let r = 0; r < rounds; r++) {
    // Shuffle within the round so the item order isn't a visible repeating cycle.
    out.push(...shuffle(groups.filter((g) => g[r]).map((g) => g[r]), random));
  }
  return take(out);
}

/** Draw `count` distinct items (for whole-table worksheet exercises). */
export function sampleItems(sheet, { categoryIds, count, random = Math.random } = {}) {
  const allowed = categoryIds ? new Set(categoryIds) : null;
  const pool = shuffle(sheet.items.filter((i) => !allowed || allowed.has(i.category)), random);
  return pool.slice(0, Math.min(count ?? pool.length, pool.length));
}

export function shuffle(arr, random = Math.random) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Deterministic PRNG (mulberry32) so a worksheet URL always regenerates the
 * exact same questions — reprint it, or hand out the answer key later.
 */
export function seededRandom(seed) {
  let a = typeof seed === 'number' ? seed : hashString(String(seed));
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Short, human-typable seed — shows up in the URL and on the printed page. */
export function randomSeed() {
  return Math.random().toString(36).slice(2, 8);
}
