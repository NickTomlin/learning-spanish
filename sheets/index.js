/**
 * Registry of every sheet in the site.
 *
 * `load` is a lazy importer so a page only downloads the sheet it needs. The
 * title is repeated here (rather than read from the sheet) so the worksheet
 * page can render its sheet picker without pulling in every sheet's data.
 *
 * Add a sheet here and it becomes available to worksheet.html?sheet=<id>.
 */
export const SHEETS = {
  preterite: { title: 'Pretérito', load: () => import('./preterite.js') },
  imperfect: { title: 'Imperfecto', load: () => import('./imperfect.js') },
};

/** [{ id, title }] for every sheet — enough to build a nav or picker. */
export function sheetCatalog() {
  return Object.entries(SHEETS).map(([id, { title }]) => ({ id, title }));
}

export async function loadSheet(id) {
  const entry = SHEETS[id];
  if (!entry) throw new Error(`Unknown sheet: ${id}`);
  const mod = await entry.load();
  return mod.default;
}
