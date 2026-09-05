export function mountTitleAccents(root = document) {
  const titles = [...root.querySelectorAll('[data-accent-letter]')];
  if (!titles.length) return;

  function positionAccents() {
    titles.forEach((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const index = node.data.indexOf(element.dataset.accentLetter);
        if (index === -1) continue;

        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + element.dataset.accentLetter.length);
        const letterRect = range.getBoundingClientRect();
        const titleRect = element.getBoundingClientRect();

        element.dataset.accentText = element.textContent;
        element.style.setProperty('--title-accent-left', `${letterRect.left - titleRect.left}px`);
        element.style.setProperty('--title-accent-right', `${titleRect.right - letterRect.right}px`);
        element.dataset.accentReady = '';
        break;
      }
    });
  }

  positionAccents();
  document.fonts?.ready.then(positionAccents);
  window.addEventListener('resize', positionAccents);
}
