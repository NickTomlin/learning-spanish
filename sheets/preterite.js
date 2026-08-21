/**
 * Sheet definition: Spanish preterite.
 *
 * See lib/sheet.js for the full schema. In short: an `axis` of forms every
 * item inflects across, `categories` that group items, and `items` themselves.
 */
export default {
  id: 'preterite',
  title: 'Pretérito',
  titleHTML: 'Pret<span class="accent">é</span>rito',
  subtitle: 'Spanish preterite — a study companion',
  footer: 'Ortografía cuenta. Tildes also.',

  itemNoun: 'verb',
  itemNounPlural: 'verbs',
  inputPlaceholder: 'conjugate…',
  searchPlaceholder: 'Search verbs, meanings, or conjugated forms…',
  worksheetInstructions: 'Write the preterite form of each verb for the pronoun given.',
  referenceInstructions: 'Every preterite form, grouped by pattern.',

  axis: {
    label: 'Pronoun',
    values: ['yo', 'tú', 'él/ella/Ud.', 'nosotros', 'ellos/Uds.'],
    // Compact labels used on the printed worksheet, where space is tight.
    shortValues: ['yo', 'tú', 'él', 'nos.', 'ellos'],
  },

  categories: [
    { id: 'regular-ar', name: 'Regular -ar', desc: 'Standard pattern, no surprises.' },
    { id: 'regular-er', name: 'Regular -er', desc: 'Same endings as regular -ir.' },
    { id: 'regular-ir', name: 'Regular -ir', desc: 'Endings identical to regular -er.' },
    { id: 'unique', name: 'Highly irregular', desc: 'Their own stems, no accents on yo/él forms.', highlight: [0, 1, 2, 3, 4] },
    { id: 'u-stem', name: 'U-stem irregulars', desc: 'Stem shifts to contain u; uses irregular endings -e -iste -o -imos -ieron.', highlight: [0, 1, 2, 3, 4] },
    { id: 'i-stem', name: 'I-stem irregulars', desc: 'Stem shifts to contain i; uses irregular endings.', highlight: [0, 1, 2, 3, 4] },
    { id: 'j-stem', name: 'J-stem irregulars', desc: 'Stem ends in j; ellos form drops the i → -eron, not -ieron.', highlight: [0, 1, 2, 3, 4] },
    { id: 'stem-change', name: 'Stem-changing -ir', desc: 'Only 3rd person singular and plural shift (e→i, o→u).', highlight: [2, 4] },
    { id: 'spelling', name: 'Spelling-change yo', desc: 'Only the yo form changes spelling to preserve the sound.', highlight: [0] },
    { id: 'vowel-stem', name: 'Vowel-stem (i→y)', desc: 'When the stem ends in a vowel, 3rd person i becomes y.', highlight: [2, 4] },
  ],

  items: [
    { term: 'hablar', gloss: 'to speak', category: 'regular-ar', forms: ['hablé', 'hablaste', 'habló', 'hablamos', 'hablaron'] },
    { term: 'comprar', gloss: 'to buy', category: 'regular-ar', forms: ['compré', 'compraste', 'compró', 'compramos', 'compraron'] },
    { term: 'comer', gloss: 'to eat', category: 'regular-er', forms: ['comí', 'comiste', 'comió', 'comimos', 'comieron'] },
    { term: 'beber', gloss: 'to drink', category: 'regular-er', forms: ['bebí', 'bebiste', 'bebió', 'bebimos', 'bebieron'] },
    { term: 'vivir', gloss: 'to live', category: 'regular-ir', forms: ['viví', 'viviste', 'vivió', 'vivimos', 'vivieron'] },
    { term: 'escribir', gloss: 'to write', category: 'regular-ir', forms: ['escribí', 'escribiste', 'escribió', 'escribimos', 'escribieron'] },
    { term: 'ser', gloss: 'to be', category: 'unique', forms: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], note: 'Identical to ir.' },
    { term: 'ir', gloss: 'to go', category: 'unique', forms: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], note: 'Identical to ser.' },
    { term: 'dar', gloss: 'to give', category: 'unique', forms: ['di', 'diste', 'dio', 'dimos', 'dieron'] },
    { term: 'ver', gloss: 'to see', category: 'unique', forms: ['vi', 'viste', 'vio', 'vimos', 'vieron'] },
    { term: 'estar', gloss: 'to be', category: 'u-stem', forms: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvieron'] },
    { term: 'tener', gloss: 'to have', category: 'u-stem', forms: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron'] },
    { term: 'poder', gloss: 'to be able', category: 'u-stem', forms: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudieron'] },
    { term: 'poner', gloss: 'to put', category: 'u-stem', forms: ['puse', 'pusiste', 'puso', 'pusimos', 'pusieron'] },
    { term: 'saber', gloss: 'to know', category: 'u-stem', forms: ['supe', 'supiste', 'supo', 'supimos', 'supieron'] },
    { term: 'andar', gloss: 'to walk', category: 'u-stem', forms: ['anduve', 'anduviste', 'anduvo', 'anduvimos', 'anduvieron'] },
    { term: 'haber', gloss: 'to have (aux.)', category: 'u-stem', forms: ['hube', 'hubiste', 'hubo', 'hubimos', 'hubieron'] },
    { term: 'hacer', gloss: 'to do/make', category: 'i-stem', forms: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'], note: 'él form is hizo — z preserves the soft sound before o.' },
    { term: 'querer', gloss: 'to want', category: 'i-stem', forms: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisieron'] },
    { term: 'venir', gloss: 'to come', category: 'i-stem', forms: ['vine', 'viniste', 'vino', 'vinimos', 'vinieron'] },
    { term: 'decir', gloss: 'to say', category: 'j-stem', forms: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijeron'] },
    { term: 'traer', gloss: 'to bring', category: 'j-stem', forms: ['traje', 'trajiste', 'trajo', 'trajimos', 'trajeron'] },
    { term: 'conducir', gloss: 'to drive', category: 'j-stem', forms: ['conduje', 'condujiste', 'condujo', 'condujimos', 'condujeron'] },
    { term: 'pedir', gloss: 'to ask for', category: 'stem-change', forms: ['pedí', 'pediste', 'pidió', 'pedimos', 'pidieron'], note: 'e → i in 3rd person.' },
    { term: 'dormir', gloss: 'to sleep', category: 'stem-change', forms: ['dormí', 'dormiste', 'durmió', 'dormimos', 'durmieron'], note: 'o → u in 3rd person.' },
    { term: 'sentir', gloss: 'to feel', category: 'stem-change', forms: ['sentí', 'sentiste', 'sintió', 'sentimos', 'sintieron'], note: 'e → i in 3rd person.' },
    { term: 'morir', gloss: 'to die', category: 'stem-change', forms: ['morí', 'moriste', 'murió', 'morimos', 'murieron'], note: 'o → u in 3rd person.' },
    { term: 'buscar', gloss: 'to look for', category: 'spelling', forms: ['busqué', 'buscaste', 'buscó', 'buscamos', 'buscaron'], note: 'c → qu in yo form.' },
    { term: 'llegar', gloss: 'to arrive', category: 'spelling', forms: ['llegué', 'llegaste', 'llegó', 'llegamos', 'llegaron'], note: 'g → gu in yo form.' },
    { term: 'empezar', gloss: 'to begin', category: 'spelling', forms: ['empecé', 'empezaste', 'empezó', 'empezamos', 'empezaron'], note: 'z → c in yo form.' },
    { term: 'leer', gloss: 'to read', category: 'vowel-stem', forms: ['leí', 'leíste', 'leyó', 'leímos', 'leyeron'], note: 'i → y in 3rd person.' },
    { term: 'oír', gloss: 'to hear', category: 'vowel-stem', forms: ['oí', 'oíste', 'oyó', 'oímos', 'oyeron'], note: 'i → y in 3rd person.' },
    { term: 'creer', gloss: 'to believe', category: 'vowel-stem', forms: ['creí', 'creíste', 'creyó', 'creímos', 'creyeron'], note: 'i → y in 3rd person.' },
  ],

  patterns: [
    {
      title: 'When to use it',
      list: [
        'A completed action with a clear beginning and/or end: <em>Ayer hablé con mi hermana.</em> ("I spoke with my sister yesterday.")',
        'A sequence of events, one after another — the backbone of a story: <em>Llegué, comí, y salí.</em>',
        'An action that <strong>interrupts</strong> another. The interruption is preterite; the ongoing action it cuts into is imperfect: <em>Dormía cuando <strong>sonó</strong> el teléfono.</em>',
        'An action that happened a specific, known number of times: <em>Fui a México tres veces.</em>',
        'A sudden change in emotional, physical, or mental state at a specific moment: <em>Cuando oí la noticia, me alegré.</em>',
        'Compare it side by side with the <a href="imperfect.html">imperfecto</a> — most confusion between the two clears up once you see them next to each other.',
      ],
    },
    {
      title: 'The endings',
      table: {
        head: ['Pronoun', '-ar', '-er / -ir', 'Irregular'],
        accentColumn: 3,
        rows: [
          ['yo', '-é', '-í', '-e'],
          ['tú', '-aste', '-iste', '-iste'],
          ['él/ella/Ud.', '-ó', '-ió', '-o'],
          ['nosotros', '-amos', '-imos', '-imos'],
          ['ellos/Uds.', '-aron', '-ieron', '-ieron / -eron'],
        ],
      },
    },
    {
      title: 'Things to internalize',
      list: [
        'Regular preterite stress sits on the <em>ending</em> — that’s why <code>hablé</code> and <code>comió</code> carry written accents.',
        'Irregular preterites shift stress to the <em>stem</em>, so they lose their accents — <code>tuve</code>, <code>dijo</code>, <code>fui</code>.',
        'U-stems, I-stems, and J-stems all share one set of endings (<code>-e, -iste, -o, -imos, -isteis, -ieron</code>). Learn the stem, the endings come free.',
        'J-stems drop the <em>i</em>: <code>dijeron</code>, not <code>dijieron</code>.',
        '<em>Ser</em> and <em>ir</em> share the same preterite forms entirely. Context disambiguates.',
        'The <em>yo</em> and <em>él</em> forms are where most surprises hide — drill those.',
      ],
    },
    {
      title: 'Further reading',
      html: `
        <ul class="reading-list">
          <li>
            <a href="https://www.spanishdict.com/guide/preterite-vs-imperfect-in-spanish" target="_blank" rel="noopener">SpanishDict — Preterite vs. Imperfect in Spanish</a>
            <span class="reading-desc">A clear side-by-side comparison guide, with trigger words for each tense.</span>
          </li>
          <li>
            <a href="https://studyspanish.com/grammar/lessons/pret1" target="_blank" rel="noopener">StudySpanish.com — Preterite: Part I</a>
            <span class="reading-desc">Formation and core uses of the preterite, first in a short lesson series.</span>
          </li>
          <li>
            <a href="https://studyspanish.com/grammar/lessons/pretimp1" target="_blank" rel="noopener">StudySpanish.com — Preterite vs Imperfect: Part I</a>
            <span class="reading-desc">A dedicated multi-part lesson on choosing between the two past tenses.</span>
          </li>
        </ul>`,
    },
  ],
};
