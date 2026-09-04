/**
 * Renders the interactive study page for a sheet: reference tables with
 * search/filter, a typing or multiple-choice quiz, and the patterns notes.
 *
 * Usage:
 *   import sheet from './sheets/preterite.js';
 *   import { mountStudyPage } from './lib/study-page.js';
 *   mountStudyPage(sheet, document.getElementById('app'));
 */
import {
  esc,
  capitalize,
  stripAccents,
  normalizeAnswer,
  normalizeSheet,
  itemsInCategory,
  allQuestions,
  multipleChoiceAnswers,
} from './sheet.js';
import {
  attachSpanishInputShortcuts,
  insertSpanishCharacter,
  SPANISH_CHARACTER_KEYS,
} from './spanish-input.js';
import { mountTitleAccents } from './title-accent.js';

export function mountStudyPage(rawSheet, root) {
  const sheet = normalizeSheet(rawSheet);
  document.title = `${sheet.title} · Español`;
  root.innerHTML = pageShell(sheet);

  mountTitleAccents(root);
  mountTabs(root);
  mountReference(sheet, root);
  mountPatterns(sheet, root);
  mountQuiz(sheet, root);

  // ?q=dar deep-links into the reference with a search pre-filled.
  const initialQ = new URL(window.location.href).searchParams.get('q');
  if (initialQ) {
    root.querySelector('.tab[data-tab="reference"]').click();
    root.dispatchEvent(new CustomEvent('set-search', { detail: initialQ }));
  } else if (sheet.quizType === 'multiple-choice') {
    root.querySelector('.tab[data-tab="quiz"]').click();
  }
}

/* ===== Shell ===== */

function pageShell(sheet) {
  const answerControls = sheet.quizType === 'multiple-choice'
    ? '<div class="q-choices" data-ref="q-choices" aria-label="Answer choices"></div>'
    : `<div class="q-input-row">
        <input type="text" class="q-input" data-ref="q-input" autocomplete="off" autocapitalize="off"
               autocorrect="off" spellcheck="false" placeholder="${esc(sheet.inputPlaceholder)}">
        <button class="btn-primary" data-ref="q-check">Check</button>
      </div>
      <div class="accent-bar" data-ref="accent-bar">
        ${SPANISH_CHARACTER_KEYS.map(({ character, shortcut }) => `
          <button data-c="${character}" aria-label="Insert ${character}"
                  title="${character} — Ctrl/Cmd+Enter, then ${shortcut}">
            <span>${character}</span><span class="accent-key-shortcut">${shortcut}</span>
          </button>`).join('')}
      </div>
      <p class="accent-shortcut-hint"><kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Enter</kbd>, then <kbd>A</kbd> <kbd>E</kbd> <kbd>I</kbd> <kbd>O</kbd> <kbd>U</kbd> <kbd>N</kbd> · <kbd>2</kbd> = ü · <kbd>?</kbd> / <kbd>!</kbd> · <kbd>Shift</kbd> = uppercase</p>`;

  return `
  <div class="wrap">
    <header class="study-header">
      <div class="header-top">
        <div>
          <p class="sub" style="margin: 0 0 8px;"><a href="index.html" class="backlink">&larr; Español</a></p>
          <h1${sheet.titleAccent ? ` data-accent-letter="${esc(sheet.titleAccent)}"` : ''}>${sheet.titleHTML}</h1>
          ${sheet.subtitle ? `<p class="sub">${sheet.subtitle}</p>` : ''}
        </div>
        <div class="print-links">
          <a class="print-link" data-ref="worksheet-link" href="worksheet.html?sheet=${encodeURIComponent(sheet.id)}">🖨 <span data-ref="worksheet-link-label">Printable worksheet</span></a>
          <a class="print-link" data-ref="reference-link" href="worksheet.html?sheet=${encodeURIComponent(sheet.id)}&amp;doc=reference">🖨 Reference sheet</a>
        </div>
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
          <button class="quiz-settings" data-ref="open-settings" aria-haspopup="dialog" aria-controls="quiz-settings-dialog">Quiz options ↓</button>
        </div>
        <div class="quiz-card">
          <div class="q-prompt">
            <div class="q-term" data-ref="q-term"></div>
            <div class="q-gloss" data-ref="q-gloss"></div>
          </div>
          <div class="q-axis" data-ref="q-axis"></div>
          ${answerControls}
          <div class="feedback" data-ref="q-feedback" role="status" aria-live="polite"></div>
          <div class="next-row">
            <button class="q-next" data-ref="q-next" style="visibility:hidden">Next →</button>
          </div>
        </div>
      </div>
    </section>

    ${sheet.patterns.length ? '<section data-panel="patterns" class="panel"><div class="patterns-panel" data-ref="patterns"></div></section>' : ''}

    ${sheet.footer ? `<footer class="page-footer">${sheet.footer}</footer>` : ''}
  </div>

  <div class="modal" id="quiz-settings-dialog" data-ref="settings-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-settings-title">
    <div class="modal-card">
      <h3 class="modal-title" id="quiz-settings-title">Quiz options</h3>
      <p class="modal-sub">Pick which categories and ${esc(sheet.axis.label.toLowerCase())}s to include.</p>
      <div class="modal-groups">
        <div class="modal-group">
          <div class="modal-group-head">
            <h4>Categories</h4>
            <div class="modal-group-actions">
              <button data-ref="cat-all">All</button>
              <button data-ref="cat-none">None</button>
            </div>
          </div>
          <div class="modal-options" data-ref="cat-options"></div>
        </div>
        <div class="modal-group">
          <div class="modal-group-head">
            <h4>${esc(capitalize(sheet.axis.label))}s</h4>
            <div class="modal-group-actions">
              <button data-ref="axis-all">All</button>
              <button data-ref="axis-none">None</button>
            </div>
          </div>
          <div class="modal-options" data-ref="axis-options"></div>
        </div>
      </div>
      <div class="modal-foot">
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
    choices: ref(root, 'q-choices'),
    next: ref(root, 'q-next'),
    feedback: ref(root, 'q-feedback'),
    correct: ref(root, 'correct'),
    total: ref(root, 'total'),
    modal: ref(root, 'settings-modal'),
    settingsButton: ref(root, 'open-settings'),
    catOptions: ref(root, 'cat-options'),
    axisOptions: ref(root, 'axis-options'),
    worksheetLink: ref(root, 'worksheet-link'),
    worksheetLabel: ref(root, 'worksheet-link-label'),
    referenceLink: ref(root, 'reference-link'),
  };

  const categoryStorageKey = `sheet:${sheet.id}:categories`;
  const axisStorageKey = `sheet:${sheet.id}:axis-indices`;
  const categoryIds = sheet.categories.map((category) => category.id);
  const axisIndices = sheet.axis.values.map((_, index) => index);
  const multipleChoice = sheet.quizType === 'multiple-choice';
  const everyQuestion = allQuestions(sheet);
  let activeCategories = readUrlSelection('cats', categoryIds)
    || loadSelection(categoryStorageKey, categoryIds);
  let activeAxisIndices = readAxisSelection(sheet.axis.ids, axisIndices)
    || loadSelection(axisStorageKey, axisIndices);

  /**
   * Point the header's print links at whatever the quiz is currently drilling —
   * narrow the quiz to J-stems and both the worksheet and the reference sheet
   * come out J-stems only.
   */
  function updatePrintLinks() {
    const narrowed = activeCategories.size !== sheet.categories.length;
    const href = (extra) => {
      const params = new URLSearchParams({ sheet: sheet.id, ...extra });
      if (narrowed) params.set('cats', [...activeCategories].join(','));
      return `worksheet.html?${params}`;
    };
    const from = narrowed
      ? `drawn from: ${sheet.categories.filter((c) => activeCategories.has(c.id)).map((c) => c.name).join(', ')}`
      : 'drawn from every category';

    els.worksheetLink.href = href({});
    els.worksheetLink.title = `Worksheet ${from}`;
    els.worksheetLabel.textContent = narrowed
      ? `Worksheet · ${activeCategories.size} of ${sheet.categories.length}`
      : 'Printable worksheet';
    els.referenceLink.href = href({ doc: 'reference' });
    els.referenceLink.title = `Reference sheet ${from}`;
  }
  let currentQ = null;
  let previousQuestionKey = null;
  let currentPool = [];
  let phase = 'answering'; // typing: 'answering' → 'retype' → 'done'; choices: 'answering' → 'done'
  const stats = { correct: 0, total: 0 };

  function pickQuestion() {
    currentPool = allQuestions(sheet, [...activeCategories], [...activeAxisIndices]);
    if (!currentPool.length) return null;
    const choices = currentPool.length > 1
      ? currentPool.filter((q) => q.key !== previousQuestionKey)
      : currentPool;
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function showQuestion({ focusAnswer = true } = {}) {
    currentQ = pickQuestion();
    if (!currentQ) {
      els.term.textContent = '—';
      els.gloss.textContent = 'Select at least one category';
      els.axis.textContent = '';
      if (els.input) els.input.disabled = true;
      if (els.check) els.check.disabled = true;
      if (els.choices) els.choices.innerHTML = '';
      return;
    }

    previousQuestionKey = currentQ.key;
    phase = 'answering';
    els.term.textContent = currentQ.item.term;
    els.gloss.textContent = currentQ.item.gloss;
    els.axis.textContent = multipleChoice ? 'Choose the English meaning' : currentQ.axisLabel;
    els.feedback.innerHTML = '';
    els.next.style.visibility = 'hidden';

    if (multipleChoice) {
      const answers = multipleChoiceAnswers(currentQ, {
        questions: currentPool.filter((q) => q.item.category === currentQ.item.category),
        fallbackQuestions: everyQuestion,
      });
      els.choices.innerHTML = answers.map((answer) =>
        `<button type="button" class="q-choice" data-answer="${esc(answer)}">${esc(answer)}</button>`
      ).join('');
      if (focusAnswer) setTimeout(() => els.choices.querySelector('.q-choice')?.focus(), 30);
      return;
    }

    els.input.disabled = false;
    els.check.disabled = false;
    els.input.value = '';
    els.input.classList.remove('correct', 'incorrect');
    els.check.textContent = 'Check';
    if (focusAnswer) setTimeout(() => els.input.focus(), 30);
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

  function selectChoice(button) {
    if (phase !== 'answering') return;

    const selected = normalizeAnswer(button.dataset.answer);
    const correct = normalizeAnswer(currentQ.answer);
    const wasCorrect = selected === correct;
    stats.total++;
    els.total.textContent = stats.total;
    if (wasCorrect) {
      stats.correct++;
      els.correct.textContent = stats.correct;
    }

    els.choices.querySelectorAll('.q-choice').forEach((choice) => {
      choice.disabled = true;
      if (normalizeAnswer(choice.dataset.answer) === correct) choice.classList.add('correct');
    });
    if (!wasCorrect) button.classList.add('incorrect');
    els.feedback.innerHTML = wasCorrect
      ? '<div class="feedback-correct">✓ ¡Correcto!</div>'
      : `<div class="feedback-wrong">Not quite — correct is</div><div class="reveal">${esc(currentQ.answer)}</div>`;
    phase = 'done';
    els.next.style.visibility = 'visible';
    setTimeout(() => els.next.focus(), 30);
  }

  els.next.addEventListener('click', () => showQuestion());
  if (multipleChoice) {
    els.choices.addEventListener('click', (e) => {
      const button = e.target.closest('.q-choice');
      if (button) selectChoice(button);
    });
  } else {
    const accentBar = ref(root, 'accent-bar');
    attachSpanishInputShortcuts(els.input, { indicator: accentBar });

    els.check.addEventListener('click', checkAnswer);
    els.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); checkAnswer(); }
    });
    els.input.addEventListener('input', () => {
      if (phase === 'retype') els.input.classList.remove('incorrect');
    });
    accentBar.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-c]');
      if (!button) return;
      insertSpanishCharacter(els.input, button.dataset.c);
    });
  }

  /* Settings modal */
  function renderOptions() {
    els.catOptions.innerHTML = sheet.categories.map((c) => `
      <label>
        <input type="checkbox" value="${esc(c.id)}" ${activeCategories.has(c.id) ? 'checked' : ''}>
        <span>${esc(c.name)}</span>
      </label>`).join('');
    els.axisOptions.innerHTML = sheet.axis.values.map((label, index) => `
      <label>
        <input type="checkbox" value="${index}" ${activeAxisIndices.has(index) ? 'checked' : ''}>
        <span>${esc(label)}</span>
      </label>`).join('');
  }
  let settingsOpener = null;
  function closeSettings() {
    els.modal.classList.remove('open');
    settingsOpener?.focus();
    settingsOpener = null;
  }

  els.settingsButton.addEventListener('click', (e) => {
    settingsOpener = e.currentTarget;
    renderOptions();
    els.modal.classList.add('open');
    els.catOptions.querySelector('input:checked, input')?.focus();
  });
  ref(root, 'cat-close').addEventListener('click', () => {
    const checkedCategories = [...els.catOptions.querySelectorAll('input:checked')]
      .map((input) => input.value);
    const checkedAxisIndices = [...els.axisOptions.querySelectorAll('input:checked')]
      .map((input) => Number(input.value));
    activeCategories = new Set(checkedCategories.length ? checkedCategories : categoryIds);
    activeAxisIndices = new Set(checkedAxisIndices.length ? checkedAxisIndices : axisIndices);
    saveSelection(categoryStorageKey, activeCategories);
    saveSelection(axisStorageKey, activeAxisIndices);
    writeQuizOptionsToUrl(activeCategories, categoryIds, activeAxisIndices, sheet.axis.ids);
    updatePrintLinks();
    showQuestion({ focusAnswer: false });
    closeSettings();
  });
  ref(root, 'cat-all').addEventListener('click', () => {
    els.catOptions.querySelectorAll('input').forEach((i) => { i.checked = true; });
  });
  ref(root, 'cat-none').addEventListener('click', () => {
    els.catOptions.querySelectorAll('input').forEach((i) => { i.checked = false; });
  });
  ref(root, 'axis-all').addEventListener('click', () => {
    els.axisOptions.querySelectorAll('input').forEach((i) => { i.checked = true; });
  });
  ref(root, 'axis-none').addEventListener('click', () => {
    els.axisOptions.querySelectorAll('input').forEach((i) => { i.checked = false; });
  });
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) closeSettings();
  });
  els.modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSettings();
      return;
    }
    if (e.key !== 'Tab') return;

    const controls = [...els.modal.querySelectorAll('button, input:not(:disabled)')];
    const first = controls[0];
    const last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  writeQuizOptionsToUrl(activeCategories, categoryIds, activeAxisIndices, sheet.axis.ids);
  updatePrintLinks();
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

function readUrlSelection(name, allowed, parse = (value) => value) {
  const value = new URL(window.location.href).searchParams.get(name);
  if (value === null) return null;
  const valid = value.split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map(parse)
    .filter((item) => allowed.includes(item));
  return valid.length ? new Set(valid) : null;
}

function readAxisSelection(axisIds, axisIndices) {
  const named = readUrlSelection('axis', axisIds);
  if (named) return new Set([...named].map((id) => axisIds.indexOf(id)));
  return readUrlSelection('axis', axisIndices, Number);
}

function loadSelection(key, allowed) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    const valid = Array.isArray(saved) ? saved.filter((item) => allowed.includes(item)) : [];
    if (valid.length) return new Set(valid);
  } catch { /* fall through to "everything selected" */ }
  return new Set(allowed);
}

function saveSelection(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch { /* private mode — selection just won't persist */ }
}

function writeQuizOptionsToUrl(categories, allCategories, axisIndices, axisIds) {
  const url = new URL(window.location.href);
  const selectedAxisIds = new Set(axisIds.filter((_, index) => axisIndices.has(index)));
  writeUrlSelection(url.searchParams, 'cats', categories, allCategories);
  writeUrlSelection(url.searchParams, 'axis', selectedAxisIds, axisIds);
  window.history.replaceState({}, '', url);
}

function writeUrlSelection(params, name, selected, all) {
  if (selected.size === all.length) params.delete(name);
  else params.set(name, all.filter((item) => selected.has(item)).join(','));
}
