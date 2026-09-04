const HIGHLIGHT_NAME = 'title-accent';

export function mountTitleAccents(root = document) {
  if (!globalThis.CSS?.highlights || typeof globalThis.Highlight === 'undefined') return;

  const ranges = [];
  root.querySelectorAll('[data-accent-letter]').forEach((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const index = node.data.indexOf(element.dataset.accentLetter);
      if (index === -1) continue;

      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + element.dataset.accentLetter.length);
      ranges.push(range);
      break;
    }
  });

  if (ranges.length) CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));
}
