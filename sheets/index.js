/**
 * Registry of every sheet in the site. Add a sheet here and it becomes
 * available to worksheet.html?sheet=<id> and to the worksheet page's tabs.
 */
import preterite from './preterite.js';
import imperfect from './imperfect.js';

export const SHEETS = { preterite, imperfect };

/** [{ id, title }] for every sheet — enough to build a nav or picker. */
export function sheetCatalog() {
  return Object.values(SHEETS).map(({ id, title }) => ({ id, title }));
}

export function getSheet(id) {
  const sheet = SHEETS[id];
  if (!sheet) throw new Error(`Unknown sheet: ${id}`);
  return sheet;
}
