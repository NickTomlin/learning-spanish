import {
  attachSpanishInputShortcuts,
  insertSpanishCharacter,
  SPANISH_CHARACTER_KEYS,
  SPANISH_UPPERCASE_CHARACTER_KEYS,
} from './spanish-input.js';

const DRAFT_STORAGE_KEY = 'spanish-keyboard-draft';
const HISTORY_STORAGE_KEY = 'spanish-keyboard-history';
const HISTORY_LIMIT = 15;
const SPANISH_CHARACTER_ROWS = [SPANISH_CHARACTER_KEYS, SPANISH_UPPERCASE_CHARACTER_KEYS];

const textEl = document.querySelector('[data-ref="text"]');
const keysEl = document.querySelector('[data-ref="character-keys"]');
const statusEl = document.querySelector('[data-ref="status"]');
const draftStateEl = document.querySelector('[data-ref="draft-state"]');
const clearTextEl = document.querySelector('[data-ref="clear-text"]');
const copyTextEl = document.querySelector('[data-ref="copy-text"]');
const saveTextEl = document.querySelector('[data-ref="save-text"]');
const historyListEl = document.querySelector('[data-ref="history-list"]');
const historyEmptyEl = document.querySelector('[data-ref="history-empty"]');
const clearHistoryEl = document.querySelector('[data-ref="clear-history"]');

let history = readHistory();
let statusTimer;

textEl.value = readDraft();
renderCharacterKeys();
renderHistory();
updateActions();

textEl.addEventListener('input', () => {
  saveDraft();
  updateActions();
});

attachSpanishInputShortcuts(textEl, { indicator: keysEl, onMessage: showStatus });
document.addEventListener('keydown', (event) => {
  const commandKey = event.ctrlKey || event.metaKey;
  if (commandKey && !event.altKey && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveToHistory();
  }
});

clearTextEl.addEventListener('click', () => {
  textEl.value = '';
  saveDraft();
  updateActions();
  textEl.focus();
  showStatus('Draft cleared.');
});

copyTextEl.addEventListener('click', () => copyText(textEl.value.trim()));
saveTextEl.addEventListener('click', saveToHistory);

clearHistoryEl.addEventListener('click', () => {
  if (!history.length || !window.confirm('Clear all saved entries?')) return;
  if (!writeHistory([])) return;
  history = [];
  renderHistory();
  showStatus('History cleared.');
});

function renderCharacterKeys() {
  SPANISH_CHARACTER_ROWS.forEach((characters) => {
    const row = document.createElement('div');
    row.className = 'character-key-row';

    characters.forEach(({ character, shortcut }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'character-key';
      button.setAttribute('aria-label', `Insert ${character}`);
      button.title = `${character} — Ctrl/Cmd+Enter, then ${shortcut}`;

      const characterLabel = document.createElement('span');
      characterLabel.textContent = character;
      const shortcutLabel = document.createElement('span');
      shortcutLabel.className = 'key-shortcut';
      shortcutLabel.textContent = shortcut;

      button.append(characterLabel, shortcutLabel);
      button.addEventListener('click', () => insertSpanishCharacter(textEl, character));
      row.append(button);
    });

    keysEl.append(row);
  });
}

function saveToHistory() {
  const entry = textEl.value.trim();
  if (!entry) return;

  const nextHistory = [entry, ...history.filter((saved) => saved !== entry)].slice(0, HISTORY_LIMIT);
  if (!writeHistory(nextHistory)) return;

  history = nextHistory;
  renderHistory();
  showStatus('Saved to history.');
}

function renderHistory() {
  historyListEl.replaceChildren();

  history.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'history-entry';

    const entryText = document.createElement('p');
    entryText.className = 'history-text';
    entryText.lang = 'es';
    entryText.textContent = entry;

    const actions = document.createElement('div');
    actions.className = 'history-actions';
    actions.append(
      historyButton('Edit', () => editEntry(entry)),
      historyButton('Copy', () => copyText(entry)),
    );

    item.append(entryText, actions);
    historyListEl.append(item);
  });

  historyEmptyEl.classList.toggle('hidden', history.length > 0);
  clearHistoryEl.disabled = history.length === 0;
}

function historyButton(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'history-action';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function editEntry(entry) {
  textEl.value = entry;
  textEl.setSelectionRange(entry.length, entry.length);
  saveDraft();
  updateActions();
  textEl.focus();
  showStatus('Entry opened in the editor.');
}

async function copyText(text) {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    showStatus('Copied to clipboard.');
  } catch {
    showStatus('Could not copy. Select the text and copy it manually.');
  }
}

function updateActions() {
  const empty = !textEl.value.trim();
  clearTextEl.disabled = empty;
  copyTextEl.disabled = empty;
  saveTextEl.disabled = empty;
}

function readDraft() {
  try {
    return localStorage.getItem(DRAFT_STORAGE_KEY) || '';
  } catch {
    draftStateEl.textContent = 'Storage unavailable';
    return '';
  }
}

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, textEl.value);
    draftStateEl.textContent = 'Draft saved';
  } catch {
    draftStateEl.textContent = 'Storage unavailable';
  }
}

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter((entry) => typeof entry === 'string').slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    showStatus('Could not save history in this browser.');
    return false;
  }
}

function showStatus(message) {
  clearTimeout(statusTimer);
  statusEl.textContent = message;
  statusTimer = setTimeout(() => { statusEl.textContent = ''; }, 3000);
}
