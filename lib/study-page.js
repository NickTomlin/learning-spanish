/**
 * Renders the interactive study page for a sheet: reference tables with
 * search/filter, a typing quiz, and the patterns notes.
 *
 * Usage:
 *   import sheet from './sheets/preterite.js';
 *   import { mountStudyPage } from './lib/study-page.js';
 *   mountStudyPage(sheet, document.getElementById('app'));
 */
import {
  esc,
  stripAccents,
  normalizeAnswer,
  normalizeSheet,
  itemsInCategory,
  allQuestions,
} from './sheet.js';

const ACCENT_CHARS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'];

export function mountStudyPage(rawSheet, root) {
  const sheet = normalizeSheet(rawSheet);
  document.title = `${sheet.title} · Español`;
  root.innerHTML = pageShell(sheet);

  mountTabs(root);
  mountReference(sheet, root);
  mountPatterns(sheet, root);
  mountQuiz(sheet, root);

  // ?q=dar deep-links into the reference with a search pre-filled.
  const initialQ = new URL(window.location.href).searchParams.get('q');
  if (initialQ) {
    root.querySelector('.tab[data-tab="reference"]').click();
    root.dispatchEvent(new CustomEvent('set-search', { detail: initialQ }));
  }
}

/* ===== Shell ===== */

function pageShell(sheet) {
  return `
  <div class="wrap">
    <header class="study-header">
      <div class="header-top">
        <div>
          <p class="sub" style="margin: 0 0 8px;"><a href="index.html" class="backlink">&larr; Español</a></p>
          <h1>${sheet.titleHTML}</h1>
          ${sheet.subtitle ? `<p class="sub">${sheet.subtitle}</p>` : ''}
        </div>
        <a class="print-link" data-ref="worksheet-link" href="worksheet.html?sheet=${encodeURIComponent(sheet.id)}">🖨 <span data-ref="worksheet-link-label">Printable worksheet</span></a>
      </div>
      <nav class="tabs">
        <button class="tab active" data-tab="reference">Reference</button>
        <button class="tab" data-tab="quiz">Quiz</button>
        ${sheet.patterns.length ? '<button class="tab" data-tab="patterns">Patterns</button>' : ''}
      </nav>
    </header>

    <section data-panel="reference" class="panel active">
      <div class="search-wrap">
        <input type="text" class="search-input" data-ref="search" autocomplete="off" autocapitalize="off"
               autocorrect="off" spellcheck="false" placeholder="${esc(sheet.searchPlaceholder)}">
        <button class="search-clear" data-ref="search-clear" aria-label="Clear search">×</button>
      </div>
      <div class="filters" data-ref="filters"></div>
      <div data-ref="tables"></div>
      <div class="no-results" data-ref="no-results">Nothing matches <code data-ref="no-results-q"></code>.</div>
    </section>

    <section data-panel="quiz" class="panel">
      <div class="quiz-panel">
        <div class="quiz-controls">
          <div class="score">Score: <strong data-ref="correct">0</strong> / <strong data-ref="total">0</strong></div>
          <button class="quiz-settings" data-ref="open-settings">Categories ↓</button>
        </div>
        <div class="quiz-card">
          <div class="q-prompt">
            <div class="q-term" data-ref="q-term"></div>
            <div class="q-gloss" data-ref="q-gloss"></div>
          </div>
          <div class="q-axis" data-ref="q-axis"></div>
          <div class="q-input-row">
            <input type="text" class="q-input" data-ref="q-input" autocomplete="off" autocapitalize="off"
                   autocorrect="off" spellcheck="false" placeholder="${esc(sheet.inputPlaceholder)}">
            <button class="btn-primary" data-ref="q-check">Check</button>
          </div>
          <div class="accent-bar" data-ref="accent-bar">
            ${ACCENT_CHARS.map((c) => `<button data-c="${c}">${c}</button>`).join('')}
          </div>
          <div class="feedback" data-ref="q-feedback"></div>
          <div class="next-row">
            <button class="q-next" data-ref="q-next" style="visibility:hidden">Next →</button>
          </div>
        </div>
      </div>
    </section>

    ${sheet.patterns.length ? '<section data-panel="patterns" class="panel"><div class="patterns-panel" data-ref="patterns"></div></section>' : ''}

    ${sheet.footer ? `<footer class="page-footer">${sheet.footer}</footer>` : ''}
  </div>

  <div class="modal" data-ref="settings-modal">
    <div class="modal-card">
      <h3 class="modal-title">Quiz categories</h3>
      <p class="modal-sub">Pick which to include in the quiz pool.</p>
      <div class="modal-options" data-ref="cat-options"></div>
      <div class="modal-foot">
        <button data-ref="cat-all">All</button>
        <button data-ref="cat-none">None</button>
        <button class="primary" data-ref="cat-close">Done</button>
      </div>
    </div>
  </div>`;
}

const ref = (root, name) => root.querySelector(`[data-ref="${name}"]`);

function mountTabs(root) {
  root.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      root.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      root.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('active');
    });
  });
}

/* ===== Reference ===== */

function mountReference(sheet, root) {
  const filtersEl = ref(root, 'filters');
  const tablesEl = ref(root, 'tables');
  const searchEl = ref(root, 'search');
  const clearEl = ref(root, 'search-clear');
  const noResultsEl = ref(root, 'no-results');
  const noResultsQEl = ref(root, 'no-results-q');

  let activeFilter = 'all';
  let searchQuery = '';

  filtersEl.innerHTML = [{ id: 'all', name: 'All' }, ...sheet.categories]
    .map((c, i) => `<button class="chip${i === 0 ? ' active' : ''}" data-cat="${esc(c.id)}">${esc(c.name)}</button>`)
    .join('');

  tablesEl.innerHTML = sheet.categories.map((cat) => categoryTable(sheet, cat)).join('');

  filtersEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    filtersEl.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.cat;
    applyFilters();
  });

  function applyFilters() {
    const needle = stripAccents(searchQuery.trim().toLowerCase());
    let anyVisible = false;
    tablesEl.querySelectorAll('.category').forEach((cat) => {
      if (activeFilter !== 'all' && cat.dataset.cat !== activeFilter) {
        cat.classList.add('hidden');
        return;
      }
      if (!needle) {
        cat.classList.remove('hidden');
        cat.querySelectorAll('tbody tr').forEach((tr) => tr.classList.remove('hidden'));
        anyVisible = true;
        return;
      }
      let rowsVisible = 0;
      cat.querySelectorAll('tbody tr').forEach((tr) => {
        const match = tr.dataset.haystack.includes(needle);
        tr.classList.toggle('hidden', !match);
        if (match) rowsVisible++;
      });
      cat.classList.toggle('hidden', rowsVisible === 0);
      if (rowsVisible) anyVisible = true;
    });
    noResultsEl.classList.toggle('visible', !anyVisible && !!needle);
    if (!anyVisible && needle) noResultsQEl.textContent = searchQuery.trim();
  }

  let urlTimer = null;
  function scheduleUrlUpdate(value) {
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      const url = new URL(window.location.href);
      if (value) url.searchParams.set('q', value);
      else url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
    }, 250);
  }

  function setSearch(value, { updateInput = true } = {}) {
    searchQuery = value;
    if (updateInput) searchEl.value = value;
    clearEl.classList.toggle('visible', !!value);
    applyFilters();                 // instant — runs every keystroke
    scheduleUrlUpdate(value);       // debounced — fires after you pause
  }

  searchEl.addEventListener('input', (e) => setSearch(e.target.value, { updateInput: false }));
  searchEl.addEventListener('keydown', (e) => { if (e.key === 'Escape') setSearch(''); });
  clearEl.addEventListener('click', () => { setSearch(''); searchEl.focus(); });
  root.addEventListener('set-search', (e) => setSearch(e.detail));
}

function categoryTable(sheet, cat) {
  const items = itemsInCategory(sheet, cat.id);
  if (!items.length) return '';
  const noted = items.filter((i) => i.note);

  const rows = items.map((item) => {
    const haystack = stripAccents([item.term, item.gloss, ...item.forms].join(' ').toLowerCase());
    const cells = item.forms
      .map((form, i) => `<td${cat.highlight.includes(i) ? ' class="irregular"' : ''}>${esc(form)}</td>`)
      .join('');
    return `
      <tr data-haystack="${esc(haystack)}">
        <td class="term-cell">${esc(item.term)}${item.gloss ? `<span class="term-gloss">${esc(item.gloss)}</span>` : ''}</td>
        ${cells}
      </tr>`;
  }).join('');

  return `
  <div class="category" data-cat="${esc(cat.id)}">
    <div class="cat-head">
      <h2 class="cat-title">${esc(cat.name)}</h2>
      ${cat.desc ? `<p class="cat-desc">${cat.desc}</p>` : ''}
    </div>
    <div class="table-wrap">
      <table class="ref-table">
        <thead><tr>
          <th>${esc(capitalize(sheet.itemNoun))}</th>
          ${sheet.axis.values.map((v) => `<th>${esc(v)}</th>`).join('')}
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${noted.length ? `<div class="cat-note">${noted.map((i) => `<div><strong>${esc(i.term)}</strong> — ${i.note}</div>`).join('')}</div>` : ''}
  </div>`;
}

/* ===== Patterns ===== */

function mountPatterns(sheet, root) {
  const el = ref(root, 'patterns');
  if (!el) return;
  el.innerHTML = sheet.patterns.map((section) => {
    let body = '';
    if (section.table) {
      const { head, rows, accentColumn } = section.table;
      body += `
        <div class="pattern-card">
          <table class="pattern-table">
            <thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>
              ${rows.map((r) => `<tr>${r.map((c, i) =>
                `<td${i === accentColumn ? ' class="accent-col"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
    if (section.list) {
      body += `<ol class="pattern-list">${section.list.map((li) => `<li>${li}</li>`).join('')}</ol>`;
    }
    if (section.html) body += section.html;
    return `<h2 class="pattern-title">${esc(section.title)}</h2>${body}`;
  }).join('');
}

/* ===== Quiz ===== */

function mountQuiz(sheet, root) {
  const els = {
    term: ref(root, 'q-term'),
    gloss: ref(root, 'q-gloss'),
    axis: ref(root, 'q-axis'),
    input: ref(root, 'q-input'),
    check: ref(root, 'q-check'),
    next: ref(root, 'q-next'),
    feedback: ref(root, 'q-feedback'),
    correct: ref(root, 'correct'),
    total: ref(root, 'total'),
    modal: ref(root, 'settings-modal'),
    catOptions: ref(root, 'cat-options'),
    worksheetLink: ref(root, 'worksheet-link'),
    worksheetLabel: ref(root, 'worksheet-link-label'),
  };

  const storageKey = `sheet:${sheet.id}:categories`;
  let activeCategories = loadCategories(storageKey, sheet);

  /**
   * Point the header's worksheet link at whatever the quiz is currently
   * drilling — narrow the quiz to J-stems and you print a J-stem worksheet.
   */
  function updateWorksheetLink() {
    const params = new URLSearchParams({ sheet: sheet.id });
    const narrowed = activeCategories.size !== sheet.categories.length;
    if (narrowed) params.set('cats', [...activeCategories].join(','));
    els.worksheetLink.href = `worksheet.html?${params}`;
    els.worksheetLabel.textContent = narrowed
      ? `Worksheet · ${activeCategories.size} of ${sheet.categories.length}`
      : 'Printable worksheet';
    els.worksheetLink.title = narrowed
      ? `Worksheet drawn from: ${sheet.categories.filter((c) => activeCategories.has(c.id)).map((c) => c.name).join(', ')}`
      : 'Worksheet drawn from every category';
  }
  let currentQ = null;
  let phase = 'answering'; // 'answering' → 'retype' (after a miss) → 'done'
  const stats = { correct: 0, total: 0 };

  function pickQuestion() {
    const pool = allQuestions(sheet, [...activeCategories]);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function showQuestion() {
    currentQ = pickQuestion();
    if (!currentQ) {
      els.term.textContent = '—';
      els.gloss.textContent = 'Select at least one category';
      els.axis.textContent = '';
      els.input.disabled = true;
      els.check.disabled = true;
      return;
    }
    phase = 'answering';
    els.input.disabled = false;
    els.check.disabled = false;
    els.input.value = '';
    els.input.classList.remove('correct', 'incorrect');
    els.term.textContent = currentQ.item.term;
    els.gloss.textContent = currentQ.item.gloss;
    els.axis.textContent = currentQ.axisLabel;
    els.feedback.innerHTML = '';
    els.next.style.visibility = 'hidden';
    els.check.textContent = 'Check';
    setTimeout(() => els.input.focus(), 30);
  }

  function advanceToDone(message) {
    els.input.classList.remove('incorrect');
    els.input.classList.add('correct');
    els.feedback.innerHTML = `<div class="feedback-correct">${message}</div>`;
    phase = 'done';
    els.check.textContent = 'Next →';
    els.next.style.visibility = 'visible';
  }

  function checkAnswer() {
    // Already correct (first try or after retype) — advance to next question
    if (phase === 'done') { showQuestion(); return; }

    const user = normalizeAnswer(els.input.value);
    const correct = normalizeAnswer(currentQ.answer);

    // Corrective retype after a miss — does NOT affect the score
    if (phase === 'retype') {
      if (user === correct) {
        advanceToDone('✓ Eso es — that’s the one.');
        setTimeout(() => els.next.focus(), 30);
      } else {
        els.input.classList.remove('correct');
        els.input.classList.add('incorrect');
        // keep the revealed answer + hint visible so they can match it
      }
      return;
    }

    // First attempt — this is the one that counts
    stats.total++;
    els.total.textContent = stats.total;
    if (user === correct) {
      advanceToDone('✓ ¡Correcto!');
      stats.correct++;
      els.correct.textContent = stats.correct;
    } else {
      els.input.classList.add('incorrect');
      els.feedback.innerHTML = `
        <div class="feedback-wrong">Not quite — correct is</div>
        <div class="reveal">${highlightDiff(user, currentQ.answer)}</div>
        <div class="retype-hint">Type it correctly to continue.</div>`;
      phase = 'retype';
      // Clear the box so they retype the form from scratch
      els.input.value = '';
      els.input.classList.remove('incorrect');
      setTimeout(() => els.input.focus(), 30);
    }
  }

  els.check.addEventListener('click', checkAnswer);
  els.next.addEventListener('click', showQuestion);
  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); }
  });
  // Clear the red flash as soon as they start fixing a missed retype
  els.input.addEventListener('input', () => {
    if (phase === 'retype') els.input.classList.remove('incorrect');
  });

  // Accent buttons insert at the cursor
  ref(root, 'accent-bar').addEventListener('click', (e) => {
    const ch = e.target.dataset.c;
    if (!ch) return;
    const start = els.input.selectionStart;
    const end = els.input.selectionEnd;
    els.input.value = els.input.value.slice(0, start) + ch + els.input.value.slice(end);
    els.input.focus();
    els.input.setSelectionRange(start + 1, start + 1);
  });

  /* Settings modal */
  function renderCatOptions() {
    els.catOptions.innerHTML = sheet.categories.map((c) => `
      <label>
        <input type="checkbox" value="${esc(c.id)}" ${activeCategories.has(c.id) ? 'checked' : ''}>
        <span>${esc(c.name)}</span>
      </label>`).join('');
  }
  ref(root, 'open-settings').addEventListener('click', () => {
    renderCatOptions();
    els.modal.classList.add('open');
  });
  ref(root, 'cat-close').addEventListener('click', () => {
    const checked = [...els.catOptions.querySelectorAll('input:checked')].map((i) => i.value);
    activeCategories = new Set(checked.length ? checked : sheet.categories.map((c) => c.id));
    saveCategories(storageKey, activeCategories);
    els.modal.classList.remove('open');
    updateWorksheetLink();
    showQuestion();
  });
  ref(root, 'cat-all').addEventListener('click', () => {
    els.catOptions.querySelectorAll('input').forEach((i) => { i.checked = true; });
  });
  ref(root, 'cat-none').addEventListener('click', () => {
    els.catOptions.querySelectorAll('input').forEach((i) => { i.checked = false; });
  });
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) els.modal.classList.remove('open');
  });

  updateWorksheetLink();
  showQuestion();
}

/* ===== Helpers ===== */

function highlightDiff(user, correct) {
  // Show the correct answer with differing characters highlighted
  let html = '';
  const max = Math.max(user.length, correct.length);
  for (let i = 0; i < max; i++) {
    const c = correct[i] ?? '';
    const u = user[i] ?? '';
    html += c !== u ? `<span class="diff">${esc(c)}</span>` : esc(c);
  }
  return html;
}

function loadCategories(key, sheet) {
  const all = sheet.categories.map((c) => c.id);
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    const valid = Array.isArray(saved) ? saved.filter((id) => all.includes(id)) : [];
    if (valid.length) return new Set(valid);
  } catch { /* fall through to "everything selected" */ }
  return new Set(all);
}

function saveCategories(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch { /* private mode — selection just won't persist */ }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
