export const SPANISH_CHARACTER_KEYS = [
  { character: 'á', shortcut: 'A', key: 'a' },
  { character: 'é', shortcut: 'E', key: 'e' },
  { character: 'í', shortcut: 'I', key: 'i' },
  { character: 'ó', shortcut: 'O', key: 'o' },
  { character: 'ú', shortcut: 'U', key: 'u' },
  { character: 'ü', shortcut: '2', key: '2' },
  { character: 'ñ', shortcut: 'N', key: 'n' },
  { character: '¿', shortcut: '?', key: '?' },
  { character: '¡', shortcut: '!', key: '!' },
];

export const SPANISH_UPPERCASE_CHARACTER_KEYS = SPANISH_CHARACTER_KEYS
  .filter(({ key }) => !['?', '!'].includes(key))
  .map(({ character, shortcut, key }) => ({
    character: character.toUpperCase(),
    shortcut: `⇧${shortcut}`,
    key,
  }));

export function attachSpanishInputShortcuts(input, { indicator, onMessage = () => {} } = {}) {
  let active = false;
  let timer;

  function end() {
    clearTimeout(timer);
    active = false;
    indicator?.classList.remove('shortcut-active');
  }

  function begin() {
    clearTimeout(timer);
    active = true;
    indicator?.classList.add('shortcut-active');
    onMessage('Character shortcut ready: press A, E, I, O, U, N, 2, ? or !.');
    timer = setTimeout(end, 3000);
  }

  function handleKeydown(event) {
    if (active) {
      const shortcut = shortcutForEvent(event);
      if (shortcut) {
        const character = event.shiftKey
          ? shortcut.character.toUpperCase()
          : shortcut.character;
        event.preventDefault();
        end();
        insertSpanishCharacter(input, character);
        onMessage(`Inserted ${character}.`);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        end();
        onMessage('Character shortcut cancelled.');
        return;
      }

      if (['Control', 'Meta', 'Shift'].includes(event.key)) return;
      end();
    }

    const commandKey = event.ctrlKey || event.metaKey;
    if (commandKey && !event.altKey && event.key === 'Enter') {
      event.preventDefault();
      begin();
    }
  }

  input.addEventListener('keydown', handleKeydown);
  input.addEventListener('blur', end);

  return { end };
}

export function insertSpanishCharacter(input, character) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.setRangeText(character, start, end, 'end');
  input.focus();
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function shortcutForEvent(event) {
  return SPANISH_CHARACTER_KEYS.find(({ key }) => {
    if (key === '2') return ['Digit2', 'Numpad2'].includes(event.code);
    return event.key.toLowerCase() === key;
  });
}
