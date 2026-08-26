/**
 * The site's one printable page. It prints two kinds of document — a worksheet
 * of exercises, or a reference sheet of every form — and which sheet feeds it
 * is just another option, so every configuration lives at the same page,
 * driven entirely by the URL:
 *
 *   worksheet.html?sheet=preterite&blanks=24&tables=4&cats=u-stem,j-stem&seed=k3d9x&key=1
 *   worksheet.html?sheet=preterite&doc=reference&cats=u-stem,i-stem,j-stem
 *
 * Every option lives in the query string and question selection is seeded, so
 * a given URL always prints the identical worksheet — reprint it, hand out the
 * matching answer key a week later, or deep-link straight to a configuration
 * from a study page's quiz.
 */
import {
  esc,
  capitalize,
  itemsInCategory,
  normalizeSheet,
  sampleQuestions,
  sampleItems,
  seededRandom,
  randomSeed,
} from './sheet.js';

const DEFAULTS = {
  doc: 'worksheet',
  blanks: 24,
  tables: 0,
  key: true,
};

export function mountWorksheetPage(rawSheet, root, { catalog = [] } = {}) {
  const sheet = normalizeSheet(rawSheet);

  let opts = readOptions(sheet);
  root.innerHTML = `
    <div class="ws-shell">
      <div class="ws-controls no-print" data-ref="controls"></div>
      <div data-ref="paper"></div>
    </div>`;

  const controlsEl = root.querySelector('[data-ref="controls"]');
  const paperEl = root.querySelector('[data-ref="paper"]');

  function render() {
    document.title = `${sheet.title} ${docNoun(opts)} · Español`;
    paperEl.innerHTML = renderDoc(sheet, opts);
  }

  function update(patch, { rerenderControls = false } = {}) {
    opts = { ...opts, ...patch };
    writeOptions(sheet, opts);
    render();
    if (rerenderControls) renderControls();
  }

  function renderControls() {
    // Re-rendering resets <details>; keep it as the user left it.
    const catsOpen = controlsEl.querySelector('.ws-cats')?.open;
    controlsEl.innerHTML = controlsMarkup(sheet, opts, catalog);
    if (catsOpen !== undefined) controlsEl.querySelector('.ws-cats').open = catsOpen;
    wireControls(sheet, controlsEl, update);
  }

  renderControls();
  render();
}

const docNoun = (opts) => (opts.doc === 'reference' ? 'reference' : 'worksheet');

/* ===== Options <-> URL ===== */

function readOptions(sheet) {
  const p = new URL(window.location.href).searchParams;
  const allCats = sheet.categories.map((c) => c.id);
  const requested = (p.get('cats') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const cats = requested.filter((c) => allCats.includes(c));

  return {
    doc: p.get('doc') === 'reference' ? 'reference' : DEFAULTS.doc,
    blanks: clampInt(p.get('blanks'), DEFAULTS.blanks, 0, 200),
    tables: clampInt(p.get('tables'), DEFAULTS.tables, 0, 40),
    cats: cats.length ? cats : allCats,
    seed: p.get('seed') || randomSeed(),
    key: p.get('key') === null ? DEFAULTS.key : p.get('key') !== '0',
  };
}

function writeOptions(sheet, opts) {
  const url = new URL(window.location.href);
  const q = url.searchParams;
  q.set('sheet', sheet.id);
  // The exercise options mean nothing to a reference sheet, so a reference URL
  // doesn't carry them — it stays short enough to be worth bookmarking.
  if (opts.doc === 'reference') {
    q.set('doc', 'reference');
    ['blanks', 'tables', 'seed', 'key'].forEach((k) => q.delete(k));
  } else {
    q.delete('doc');
    q.set('blanks', String(opts.blanks));
    q.set('tables', String(opts.tables));
    q.set('seed', opts.seed);
    q.set('key', opts.key ? '1' : '0');
  }
  const allSelected = opts.cats.length === sheet.categories.length;
  if (allSelected) q.delete('cats');
  else q.set('cats', opts.cats.join(','));
  window.history.replaceState({}, '', url);
}

function clampInt(raw, fallback, min, max) {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/* ===== Question selection ===== */

/**
 * Build the exercise list. Table exercises are drawn first, and the items they
 * cover are excluded from the blanks pool so the worksheet never hands you an
 * answer in one exercise that it asks for in another.
 */
export function buildExercises(sheet, opts) {
  const random = seededRandom(`${sheet.id}:${opts.seed}`);

  const tableItems = opts.tables
    ? sampleItems(sheet, { categoryIds: opts.cats, count: opts.tables, random })
    : [];
  const usedTerms = new Set(tableItems.map((i) => i.term));

  let blanks = [];
  if (opts.blanks) {
    const pool = sampleQuestions(sheet, { categoryIds: opts.cats, random, spread: true });
    const preferred = pool.filter((q) => !usedTerms.has(q.item.term));
    // Fall back to the full pool only if excluding table items starves us.
    blanks = (preferred.length >= opts.blanks ? preferred : pool).slice(0, opts.blanks);
  }

  return { blanks, tableItems, empty: !blanks.length && !tableItems.length };
}

/* ===== Rendering ===== */

function renderDoc(sheet, opts) {
  return opts.doc === 'reference' ? renderReference(sheet, opts) : renderWorksheet(sheet, opts);
}

function renderWorksheet(sheet, opts) {
  const { blanks, tableItems, empty } = buildExercises(sheet, opts);
  if (empty) {
    return `<div class="ws-error no-print">Nothing to print — set a number of blanks or tables above.</div>`;
  }

  const stamp = `${sheet.id} · ${opts.seed}`;
  const tableStart = blanks.length + 1;

  return `
    <section class="paper">
      ${paperHead(sheet, 'Worksheet', { nameDate: true })}
      <div class="paper-meta">
        <div class="paper-instructions">${esc(sheet.worksheetInstructions)}</div>
        <div class="paper-stamp">${esc(stamp)}</div>
      </div>
      ${blanks.length ? renderBlanks(blanks) : ''}
      ${tableItems.length ? renderGrids(sheet, tableItems, tableStart) : ''}
      <div class="paper-foot">
        <span>${countLabel(blanks.length, tableItems.length)}</span>
        <span>${esc(sheet.title)}</span>
      </div>
    </section>
    ${opts.key ? renderAnswerKey(sheet, blanks, tableItems, tableStart, stamp) : ''}`;
}

function paperHead(sheet, kicker, { nameDate = false } = {}) {
  return `
    <div class="paper-head">
      <div>
        <p class="paper-kicker">${esc(kicker)}</p>
        <h1 class="paper-title">${esc(sheet.title)}</h1>
      </div>
      ${nameDate ? `
      <div class="name-date">
        <div>Nombre <span></span></div>
        <div>Fecha <span class="short"></span></div>
      </div>` : ''}
    </div>`;
}

function renderBlanks(questions) {
  const singleCol = questions.length <= 6 ? ' single-col' : '';
  return `
    <ol class="blanks${singleCol}">
      ${questions.map((q, i) => `
        <li class="blank-item">
          <span class="blank-num">${i + 1}.</span>
          <span class="blank-prompt">
            <span class="blank-term">${esc(q.item.term)}</span>
            <span class="blank-axis">(${esc(q.axisShortLabel)})</span>
            ${q.item.gloss ? `<span class="blank-gloss">${esc(q.item.gloss)}</span>` : ''}
          </span>
          <span class="blank-line"></span>
        </li>`).join('')}
    </ol>`;
}

function renderGrids(sheet, items, start) {
  const singleCol = items.length <= 1 ? ' single-col' : '';
  return `
    <div class="grids${singleCol}" style="margin-top: ${start > 1 ? '0.3in' : '0'};">
      ${items.map((item, i) => `
        <div class="grid-item">
          <div class="grid-head">
            <span class="grid-num">${start + i}.</span>
            <span class="grid-term">${esc(item.term)}</span>
            ${item.gloss ? `<span class="grid-gloss">${esc(item.gloss)}</span>` : ''}
          </div>
          <table class="grid-table">
            <thead><tr>${sheet.axis.shortValues.map((v) => `<th>${esc(v)}</th>`).join('')}</tr></thead>
            <tbody><tr>${sheet.axis.values.map(() => '<td></td>').join('')}</tr></tbody>
          </table>
        </div>`).join('')}
    </div>`;
}

function renderAnswerKey(sheet, blanks, tableItems, tableStart, stamp) {
  return `
    <section class="paper answer-key">
      ${paperHead(sheet, 'Answer key')}
      <div class="paper-meta">
        <div class="paper-instructions">Print double-sided so this lands on the back.</div>
        <div class="paper-stamp">${esc(stamp)}</div>
      </div>
      ${blanks.length ? `
        <ol class="key-list">
          ${blanks.map((q, i) => `
            <li class="key-item">
              <span class="key-num">${i + 1}.</span>
              <span>
                <span class="key-answer">${esc(q.answer)}</span>
                <span class="key-term">${esc(q.item.term)} · ${esc(q.axisShortLabel)}</span>
              </span>
            </li>`).join('')}
        </ol>` : ''}
      ${tableItems.length ? `
        <div style="margin-top: ${blanks.length ? '0.25in' : '0'};">
          ${tableItems.map((item, i) => `
            <div class="key-group">
              <p class="key-group-title"><span class="key-num">${tableStart + i}.</span> ${esc(item.term)}</p>
              <div class="key-group-forms">${item.forms.map((f, fi) =>
                `${esc(sheet.axis.shortValues[fi])} ${esc(f)}`).join('  ·  ')}</div>
            </div>`).join('')}
        </div>` : ''}
      <div class="paper-foot">
        <span>${countLabel(blanks.length, tableItems.length)}</span>
        <span>${esc(sheet.title)} — answer key</span>
      </div>
    </section>`;
}

function countLabel(blanks, tables) {
  const parts = [];
  if (blanks) parts.push(`${blanks} blank${blanks === 1 ? '' : 's'}`);
  if (tables) parts.push(`${tables} table${tables === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

/* ===== Reference sheet ===== */

/**
 * The other printable document: no blanks, no seed — every form, printed. This
 * is the sheet you keep beside you while you work, so it leads with the ending
 * patterns and then gives each category's full conjugations.
 *
 * The pattern tables always print: they're the point of the page, and they
 * describe the whole tense rather than any one category.
 */
function renderReference(sheet, opts) {
  const cats = sheet.categories.filter(
    (c) => opts.cats.includes(c.id) && itemsInCategory(sheet, c.id).length
  );
  const patternTables = sheet.patterns.filter((p) => p.table);
  if (!cats.length && !patternTables.length) {
    return `<div class="ws-error no-print">Nothing to print — this sheet has no tables.</div>`;
  }

  const shown = cats.reduce((n, c) => n + itemsInCategory(sheet, c.id).length, 0);
  return `
    <section class="paper">
      ${paperHead(sheet, 'Reference')}
      <div class="paper-meta">
        <div class="paper-instructions">${esc(sheet.referenceInstructions)}</div>
      </div>
      <div class="ref-flow">
        ${patternTables.map(patternBlock).join('')}
        ${cats.map((cat) => categoryBlock(sheet, cat)).join('')}
      </div>
      <div class="paper-foot">
        <span>${shown} ${esc(shown === 1 ? sheet.itemNoun : sheet.itemNounPlural)} · ${cats.length} ${cats.length === 1 ? 'category' : 'categories'}</span>
        <span>${esc(sheet.title)} — reference</span>
      </div>
    </section>`;
}

function patternBlock(section) {
  const { head, rows } = section.table;
  return refBlock(section.title, '', `
    <table class="ref-table-print">
      <thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map((r) => `<tr>${r.map((c, i) =>
          `<td${i === 0 ? ' class="ref-label"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>`);
}

function categoryBlock(sheet, cat) {
  const items = itemsInCategory(sheet, cat.id);
  const noted = items.filter((i) => i.note);
  const body = `
    <table class="ref-table-print">
      <thead><tr>
        <th>${esc(capitalize(sheet.itemNoun))}</th>
        ${sheet.axis.shortValues.map((v) => `<th>${esc(v)}</th>`).join('')}
      </tr></thead>
      <tbody>
        ${items.map((item) => `
          <tr>
            <td class="ref-label">${esc(item.term)}${item.gloss ? `<span class="ref-gloss">${esc(item.gloss)}</span>` : ''}</td>
            ${item.forms.map((f, i) =>
              `<td${cat.highlight.includes(i) ? ' class="ref-mark"' : ''}>${esc(f)}</td>`).join('')}
          </tr>`).join('')}
      </tbody>
    </table>
    ${noted.length ? `<div class="ref-notes">${noted.map((i) =>
      `<div><strong>${esc(i.term)}</strong> — ${i.note}</div>`).join('')}</div>` : ''}`;
  return refBlock(cat.name, cat.desc, body);
}

function refBlock(title, desc, body) {
  return `
    <div class="ref-block">
      <h2 class="ref-block-title">${esc(title)}</h2>
      ${desc ? `<p class="ref-block-desc">${desc}</p>` : ''}
      ${body}
    </div>`;
}

/* ===== Controls ===== */

function controlsMarkup(sheet, opts, catalog) {
  const studyPage = sheet.studyPage || `${sheet.id}.html`;
  const allSelected = opts.cats.length === sheet.categories.length;
  const isReference = opts.doc === 'reference';
  return `
    <div class="ws-controls-head">
      <div>
        <p class="sub" style="margin: 0 0 6px;"><a href="index.html" class="backlink">&larr; Español</a></p>
        <h1>Printable ${docNoun(opts)}</h1>
        <p class="sub">${esc(sheet.subtitle || sheet.title)} ·
          <a href="${esc(studyPage)}">study ${esc(sheet.title)} &rarr;</a></p>
      </div>
      <button class="btn primary" data-ref="print">🖨 Print</button>
    </div>

    ${catalog.length > 1 ? `
    <nav class="ws-sheet-tabs" aria-label="Sheet">
      ${catalog.map((s) => `
        <a class="ws-sheet-tab${s.id === sheet.id ? ' active' : ''}"
           href="${esc(sheetHref(s.id, opts))}"
           ${s.id === sheet.id ? 'aria-current="page"' : ''}>${esc(s.title)}</a>`).join('')}
    </nav>` : ''}

    <div class="ws-docs" role="group" aria-label="Document">
      <button class="ws-doc${isReference ? '' : ' active'}" data-doc="worksheet">Worksheet</button>
      <button class="ws-doc${isReference ? ' active' : ''}" data-doc="reference">Reference</button>
    </div>

    ${isReference ? '' : `
    <div class="ws-fields">
      <div class="ws-field">
        <label for="ws-blanks">Fill-in blanks</label>
        <input type="number" id="ws-blanks" data-ref="blanks" min="0" max="200" value="${opts.blanks}">
      </div>
      <div class="ws-field">
        <label for="ws-tables">Full tables</label>
        <input type="number" id="ws-tables" data-ref="tables" min="0" max="40" value="${opts.tables}">
      </div>
      <div class="ws-field">
        <label for="ws-seed">Seed</label>
        <div class="seed-row">
          <input type="text" id="ws-seed" data-ref="seed" value="${esc(opts.seed)}">
          <button class="btn" data-ref="reroll" title="New random questions">↻</button>
        </div>
      </div>
      <label class="ws-check">
        <input type="checkbox" data-ref="key" ${opts.key ? 'checked' : ''}>
        Include answer key
      </label>
    </div>`}

    <details class="ws-cats" ${allSelected ? '' : 'open'}>
      <summary>Categories — ${allSelected ? 'all' : `${opts.cats.length} of ${sheet.categories.length}`} selected</summary>
      <div class="ws-cat-list">
        ${sheet.categories.map((c) => `
          <label>
            <input type="checkbox" data-cat="${esc(c.id)}" ${opts.cats.includes(c.id) ? 'checked' : ''}>
            ${esc(c.name)}
          </label>`).join('')}
      </div>
      <div class="ws-cat-actions">
        <button class="btn" data-ref="cats-all">All</button>
        <button class="btn" data-ref="cats-none">None</button>
      </div>
    </details>

    <p class="ws-hint">${isReference
      ? 'The pattern tables always print; the categories above choose which conjugations follow them.'
      : 'This URL regenerates the exact same worksheet — bookmark it, or change the seed for a fresh set.'}</p>`;
}

/**
 * Link to the same worksheet page set to a different sheet. The layout you set
 * up (blanks, tables, key) carries over; categories and seed do not, because
 * both are meaningful only for the sheet you're leaving.
 */
function sheetHref(id, opts) {
  if (opts.doc === 'reference') return `?${new URLSearchParams({ sheet: id, doc: 'reference' })}`;
  const q = new URLSearchParams({
    sheet: id,
    blanks: String(opts.blanks),
    tables: String(opts.tables),
    key: opts.key ? '1' : '0',
  });
  return `?${q}`;
}

function wireControls(sheet, el, update) {
  const on = (name, event, handler) => {
    const node = el.querySelector(`[data-ref="${name}"]`);
    if (node) node.addEventListener(event, handler);
  };

  on('print', 'click', () => window.print());
  el.querySelectorAll('[data-doc]').forEach((btn) => {
    btn.addEventListener('click', () => update({ doc: btn.dataset.doc }, { rerenderControls: true }));
  });
  on('blanks', 'change', (e) => update({ blanks: clampInt(e.target.value, DEFAULTS.blanks, 0, 200) }));
  on('tables', 'change', (e) => update({ tables: clampInt(e.target.value, DEFAULTS.tables, 0, 40) }));
  on('seed', 'change', (e) => update({ seed: e.target.value.trim() || randomSeed() }, { rerenderControls: true }));
  on('reroll', 'click', () => update({ seed: randomSeed() }, { rerenderControls: true }));
  on('key', 'change', (e) => update({ key: e.target.checked }));

  const catInputs = () => [...el.querySelectorAll('[data-cat]')];
  const applyCats = () => {
    const checked = catInputs().filter((i) => i.checked).map((i) => i.dataset.cat);
    // An empty selection would print a blank page; treat it as "everything".
    update({ cats: checked.length ? checked : sheet.categories.map((c) => c.id) }, { rerenderControls: true });
  };
  catInputs().forEach((i) => i.addEventListener('change', applyCats));
  on('cats-all', 'click', () => { catInputs().forEach((i) => { i.checked = true; }); applyCats(); });
  on('cats-none', 'click', () => { catInputs().forEach((i) => { i.checked = false; }); applyCats(); });
}
