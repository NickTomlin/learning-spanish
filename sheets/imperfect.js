/**
 * Sheet definition: Spanish imperfect.
 *
 * See lib/sheet.js for the full schema. In short: an `axis` of forms every
 * item inflects across, `categories` that group items, and `items` themselves.
 */
export default {
  id: 'imperfect',
  title: 'Imperfecto',
  titleHTML: 'Imperfect<span class="accent">o</span>',
  subtitle: 'Spanish imperfect — a study companion',
  footer: 'Only three irregulars in the whole tense. Enjoy it while it lasts.',

  itemNoun: 'verb',
  itemNounPlural: 'verbs',
  inputPlaceholder: 'conjugate…',
  searchPlaceholder: 'Search verbs, meanings, or conjugated forms…',
  worksheetInstructions: 'Write the imperfect form of each verb for the pronoun given.',
  referenceInstructions: 'Every imperfect form, grouped by pattern.',

  axis: {
    label: 'Pronoun',
    values: ['yo', 'tú', 'él/ella/Ud.', 'nosotros', 'ellos/Uds.'],
    ids: ['yo', 'tu', 'el-ella-usted', 'nosotros', 'ellos-ustedes'],
    // Compact labels used on the printed worksheet, where space is tight.
    shortValues: ['yo', 'tú', 'él', 'nos.', 'ellos'],
  },

  categories: [
    { id: 'regular-ar', name: 'Regular -ar', desc: 'Endings -aba, -abas, -aba, -ábamos, -aban.' },
    { id: 'regular-er', name: 'Regular -er', desc: 'Same endings as regular -ir.' },
    { id: 'regular-ir', name: 'Regular -ir', desc: 'Endings identical to regular -er.' },
    { id: 'easy-now', name: 'Irregular elsewhere, regular here', desc: 'Wild in the preterite or present, perfectly regular in the imperfect.' },
    { id: 'irregular', name: 'The only three irregulars', desc: 'ser, ir, and ver — that is the entire irregular list for this tense.', highlight: [0, 1, 2, 3, 4] },
  ],

  items: [
    { term: 'hablar', gloss: 'to speak', category: 'regular-ar', forms: ['hablaba', 'hablabas', 'hablaba', 'hablábamos', 'hablaban'] },
    { term: 'comprar', gloss: 'to buy', category: 'regular-ar', forms: ['compraba', 'comprabas', 'compraba', 'comprábamos', 'compraban'] },
    { term: 'trabajar', gloss: 'to work', category: 'regular-ar', forms: ['trabajaba', 'trabajabas', 'trabajaba', 'trabajábamos', 'trabajaban'] },
    { term: 'estudiar', gloss: 'to study', category: 'regular-ar', forms: ['estudiaba', 'estudiabas', 'estudiaba', 'estudiábamos', 'estudiaban'] },
    { term: 'caminar', gloss: 'to walk', category: 'regular-ar', forms: ['caminaba', 'caminabas', 'caminaba', 'caminábamos', 'caminaban'] },
    { term: 'bailar', gloss: 'to dance', category: 'regular-ar', forms: ['bailaba', 'bailabas', 'bailaba', 'bailábamos', 'bailaban'] },
    { term: 'llegar', gloss: 'to arrive', category: 'regular-ar', forms: ['llegaba', 'llegabas', 'llegaba', 'llegábamos', 'llegaban'], note: 'No spelling change needed here, unlike the preterite yo form.' },
    { term: 'tomar', gloss: 'to take/drink', category: 'regular-ar', forms: ['tomaba', 'tomabas', 'tomaba', 'tomábamos', 'tomaban'] },
    { term: 'pasar', gloss: 'to pass/spend (time)', category: 'regular-ar', forms: ['pasaba', 'pasabas', 'pasaba', 'pasábamos', 'pasaban'] },
    { term: 'dejar', gloss: 'to leave/let', category: 'regular-ar', forms: ['dejaba', 'dejabas', 'dejaba', 'dejábamos', 'dejaban'] },
    { term: 'llevar', gloss: 'to carry/wear', category: 'regular-ar', forms: ['llevaba', 'llevabas', 'llevaba', 'llevábamos', 'llevaban'] },
    { term: 'necesitar', gloss: 'to need', category: 'regular-ar', forms: ['necesitaba', 'necesitabas', 'necesitaba', 'necesitábamos', 'necesitaban'] },
    { term: 'usar', gloss: 'to use', category: 'regular-ar', forms: ['usaba', 'usabas', 'usaba', 'usábamos', 'usaban'] },

    { term: 'comer', gloss: 'to eat', category: 'regular-er', forms: ['comía', 'comías', 'comía', 'comíamos', 'comían'] },
    { term: 'beber', gloss: 'to drink', category: 'regular-er', forms: ['bebía', 'bebías', 'bebía', 'bebíamos', 'bebían'] },
    { term: 'aprender', gloss: 'to learn', category: 'regular-er', forms: ['aprendía', 'aprendías', 'aprendía', 'aprendíamos', 'aprendían'] },
    { term: 'correr', gloss: 'to run', category: 'regular-er', forms: ['corría', 'corrías', 'corría', 'corríamos', 'corrían'] },
    { term: 'volver', gloss: 'to return', category: 'regular-er', forms: ['volvía', 'volvías', 'volvía', 'volvíamos', 'volvían'] },
    { term: 'conocer', gloss: 'to know/meet', category: 'regular-er', forms: ['conocía', 'conocías', 'conocía', 'conocíamos', 'conocían'] },

    { term: 'vivir', gloss: 'to live', category: 'regular-ir', forms: ['vivía', 'vivías', 'vivía', 'vivíamos', 'vivían'] },
    { term: 'escribir', gloss: 'to write', category: 'regular-ir', forms: ['escribía', 'escribías', 'escribía', 'escribíamos', 'escribían'] },
    { term: 'abrir', gloss: 'to open', category: 'regular-ir', forms: ['abría', 'abrías', 'abría', 'abríamos', 'abrían'] },
    { term: 'decidir', gloss: 'to decide', category: 'regular-ir', forms: ['decidía', 'decidías', 'decidía', 'decidíamos', 'decidían'] },
    { term: 'salir', gloss: 'to leave/go out', category: 'regular-ir', forms: ['salía', 'salías', 'salía', 'salíamos', 'salían'] },
    { term: 'recibir', gloss: 'to receive', category: 'regular-ir', forms: ['recibía', 'recibías', 'recibía', 'recibíamos', 'recibían'] },

    { term: 'tener', gloss: 'to have', category: 'easy-now', forms: ['tenía', 'tenías', 'tenía', 'teníamos', 'tenían'], note: 'Irregular in the preterite (tuve…); regular here.' },
    { term: 'poder', gloss: 'to be able', category: 'easy-now', forms: ['podía', 'podías', 'podía', 'podíamos', 'podían'], note: 'Irregular in the preterite (pude…); regular here.' },
    { term: 'poner', gloss: 'to put', category: 'easy-now', forms: ['ponía', 'ponías', 'ponía', 'poníamos', 'ponían'], note: 'Irregular in the preterite (puse…); regular here.' },
    { term: 'saber', gloss: 'to know', category: 'easy-now', forms: ['sabía', 'sabías', 'sabía', 'sabíamos', 'sabían'], note: 'Irregular in the preterite (supe…); regular here.' },
    { term: 'hacer', gloss: 'to do/make', category: 'easy-now', forms: ['hacía', 'hacías', 'hacía', 'hacíamos', 'hacían'], note: 'Irregular in the preterite (hice…); regular here.' },
    { term: 'querer', gloss: 'to want', category: 'easy-now', forms: ['quería', 'querías', 'quería', 'queríamos', 'querían'], note: 'Irregular in the preterite (quise…); regular here.' },
    { term: 'venir', gloss: 'to come', category: 'easy-now', forms: ['venía', 'venías', 'venía', 'veníamos', 'venían'], note: 'Irregular in the preterite (vine…); regular here.' },
    { term: 'decir', gloss: 'to say', category: 'easy-now', forms: ['decía', 'decías', 'decía', 'decíamos', 'decían'], note: 'Irregular in the preterite (dije…); regular here.' },
    { term: 'pedir', gloss: 'to ask for', category: 'easy-now', forms: ['pedía', 'pedías', 'pedía', 'pedíamos', 'pedían'], note: 'Stem-changes in the present (pido); regular here.' },
    { term: 'dormir', gloss: 'to sleep', category: 'easy-now', forms: ['dormía', 'dormías', 'dormía', 'dormíamos', 'dormían'], note: 'Stem-changes in the present (duermo); regular here.' },
    { term: 'estar', gloss: 'to be', category: 'easy-now', forms: ['estaba', 'estabas', 'estaba', 'estábamos', 'estaban'], note: 'Irregular in the preterite (estuve…); regular here.' },

    { term: 'ser', gloss: 'to be', category: 'irregular', forms: ['era', 'eras', 'era', 'éramos', 'eran'] },
    { term: 'ir', gloss: 'to go', category: 'irregular', forms: ['iba', 'ibas', 'iba', 'íbamos', 'iban'] },
    { term: 'ver', gloss: 'to see', category: 'irregular', forms: ['veía', 'veías', 'veía', 'veíamos', 'veían'] },
    { term: 'mirar', gloss: 'to look at', category: 'regular-ar', forms: ['miraba', 'mirabas', 'miraba', 'mirábamos', 'miraban'] },
    { term: 'llamar', gloss: 'to call', category: 'regular-ar', forms: ['llamaba', 'llamabas', 'llamaba', 'llamábamos', 'llamaban'] },
    { term: 'ayudar', gloss: 'to help', category: 'regular-ar', forms: ['ayudaba', 'ayudabas', 'ayudaba', 'ayudábamos', 'ayudaban'] },
    { term: 'preguntar', gloss: 'to ask (a question)', category: 'regular-ar', forms: ['preguntaba', 'preguntabas', 'preguntaba', 'preguntábamos', 'preguntaban'] },
    { term: 'encontrar', gloss: 'to find', category: 'regular-ar', forms: ['encontraba', 'encontrabas', 'encontraba', 'encontrábamos', 'encontraban'] },
    { term: 'pensar', gloss: 'to think', category: 'regular-ar', forms: ['pensaba', 'pensabas', 'pensaba', 'pensábamos', 'pensaban'] },
    { term: 'jugar', gloss: 'to play (a game/sport)', category: 'regular-ar', forms: ['jugaba', 'jugabas', 'jugaba', 'jugábamos', 'jugaban'] },
    { term: 'ganar', gloss: 'to win', category: 'regular-ar', forms: ['ganaba', 'ganabas', 'ganaba', 'ganábamos', 'ganaban'], note: 'Can also mean “to earn.”' },
    { term: 'esperar', gloss: 'to wait for', category: 'regular-ar', forms: ['esperaba', 'esperabas', 'esperaba', 'esperábamos', 'esperaban'], note: 'Can also mean “to hope” or “to expect.”' },
    { term: 'entrar', gloss: 'to enter', category: 'regular-ar', forms: ['entraba', 'entrabas', 'entraba', 'entrábamos', 'entraban'] },
    { term: 'terminar', gloss: 'to finish', category: 'regular-ar', forms: ['terminaba', 'terminabas', 'terminaba', 'terminábamos', 'terminaban'] },
    { term: 'quedar', gloss: 'to remain/stay', category: 'regular-ar', forms: ['quedaba', 'quedabas', 'quedaba', 'quedábamos', 'quedaban'], note: 'Can also mean “to arrange to meet” or “to fit.”' },
    { term: 'cocinar', gloss: 'to cook', category: 'regular-ar', forms: ['cocinaba', 'cocinabas', 'cocinaba', 'cocinábamos', 'cocinaban'] },
    { term: 'entender', gloss: 'to understand', category: 'regular-er', forms: ['entendía', 'entendías', 'entendía', 'entendíamos', 'entendían'] },
    { term: 'perder', gloss: 'to lose', category: 'regular-er', forms: ['perdía', 'perdías', 'perdía', 'perdíamos', 'perdían'] },
    { term: 'responder', gloss: 'to answer', category: 'regular-er', forms: ['respondía', 'respondías', 'respondía', 'respondíamos', 'respondían'] },
    { term: 'servir', gloss: 'to serve', category: 'regular-ir', forms: ['servía', 'servías', 'servía', 'servíamos', 'servían'] },
    { term: 'seguir', gloss: 'to continue/follow', category: 'regular-ir', forms: ['seguía', 'seguías', 'seguía', 'seguíamos', 'seguían'] },
    { term: 'conseguir', gloss: 'to obtain/get', category: 'regular-ir', forms: ['conseguía', 'conseguías', 'conseguía', 'conseguíamos', 'conseguían'] },
    { term: 'repetir', gloss: 'to repeat', category: 'regular-ir', forms: ['repetía', 'repetías', 'repetía', 'repetíamos', 'repetían'] },

    { term: 'cantar', gloss: 'to sing', category: 'regular-ar', forms: ['cantaba', 'cantabas', 'cantaba', 'cantábamos', 'cantaban'] },
    { term: 'viajar', gloss: 'to travel', category: 'regular-ar', forms: ['viajaba', 'viajabas', 'viajaba', 'viajábamos', 'viajaban'] },
    { term: 'escuchar', gloss: 'to listen to', category: 'regular-ar', forms: ['escuchaba', 'escuchabas', 'escuchaba', 'escuchábamos', 'escuchaban'] },
    { term: 'enseñar', gloss: 'to teach', category: 'regular-ar', forms: ['enseñaba', 'enseñabas', 'enseñaba', 'enseñábamos', 'enseñaban'], note: 'Can also mean “to show.”' },
    { term: 'cambiar', gloss: 'to change', category: 'regular-ar', forms: ['cambiaba', 'cambiabas', 'cambiaba', 'cambiábamos', 'cambiaban'] },
    { term: 'olvidar', gloss: 'to forget', category: 'regular-ar', forms: ['olvidaba', 'olvidabas', 'olvidaba', 'olvidábamos', 'olvidaban'] },
    { term: 'limpiar', gloss: 'to clean', category: 'regular-ar', forms: ['limpiaba', 'limpiabas', 'limpiaba', 'limpiábamos', 'limpiaban'] },
    { term: 'nadar', gloss: 'to swim', category: 'regular-ar', forms: ['nadaba', 'nadabas', 'nadaba', 'nadábamos', 'nadaban'] },
    { term: 'visitar', gloss: 'to visit', category: 'regular-ar', forms: ['visitaba', 'visitabas', 'visitaba', 'visitábamos', 'visitaban'] },
    { term: 'tocar', gloss: 'to touch/play (an instrument)', category: 'regular-ar', forms: ['tocaba', 'tocabas', 'tocaba', 'tocábamos', 'tocaban'], note: 'No c → qu change here, unlike the preterite yo form.' },
    { term: 'sacar', gloss: 'to take out', category: 'regular-ar', forms: ['sacaba', 'sacabas', 'sacaba', 'sacábamos', 'sacaban'], note: 'No c → qu change here, unlike the preterite yo form.' },
    { term: 'practicar', gloss: 'to practice', category: 'regular-ar', forms: ['practicaba', 'practicabas', 'practicaba', 'practicábamos', 'practicaban'] },
    { term: 'explicar', gloss: 'to explain', category: 'regular-ar', forms: ['explicaba', 'explicabas', 'explicaba', 'explicábamos', 'explicaban'] },
    { term: 'pagar', gloss: 'to pay', category: 'regular-ar', forms: ['pagaba', 'pagabas', 'pagaba', 'pagábamos', 'pagaban'], note: 'No g → gu change here, unlike the preterite yo form.' },
    { term: 'entregar', gloss: 'to hand in', category: 'regular-ar', forms: ['entregaba', 'entregabas', 'entregaba', 'entregábamos', 'entregaban'] },

    { term: 'vender', gloss: 'to sell', category: 'regular-er', forms: ['vendía', 'vendías', 'vendía', 'vendíamos', 'vendían'] },
    { term: 'deber', gloss: 'to owe', category: 'regular-er', forms: ['debía', 'debías', 'debía', 'debíamos', 'debían'], note: 'With an infinitive it means “should” or “must.”' },
    { term: 'prometer', gloss: 'to promise', category: 'regular-er', forms: ['prometía', 'prometías', 'prometía', 'prometíamos', 'prometían'] },
    { term: 'romper', gloss: 'to break', category: 'regular-er', forms: ['rompía', 'rompías', 'rompía', 'rompíamos', 'rompían'] },
    { term: 'nacer', gloss: 'to be born', category: 'regular-er', forms: ['nacía', 'nacías', 'nacía', 'nacíamos', 'nacían'] },
    { term: 'crecer', gloss: 'to grow', category: 'regular-er', forms: ['crecía', 'crecías', 'crecía', 'crecíamos', 'crecían'] },
    { term: 'ofrecer', gloss: 'to offer', category: 'regular-er', forms: ['ofrecía', 'ofrecías', 'ofrecía', 'ofrecíamos', 'ofrecían'] },

    { term: 'subir', gloss: 'to go up', category: 'regular-ir', forms: ['subía', 'subías', 'subía', 'subíamos', 'subían'] },
    { term: 'describir', gloss: 'to describe', category: 'regular-ir', forms: ['describía', 'describías', 'describía', 'describíamos', 'describían'] },
    { term: 'permitir', gloss: 'to allow', category: 'regular-ir', forms: ['permitía', 'permitías', 'permitía', 'permitíamos', 'permitían'] },
    { term: 'descubrir', gloss: 'to discover', category: 'regular-ir', forms: ['descubría', 'descubrías', 'descubría', 'descubríamos', 'descubrían'] },
    { term: 'sufrir', gloss: 'to suffer', category: 'regular-ir', forms: ['sufría', 'sufrías', 'sufría', 'sufríamos', 'sufrían'] },
    { term: 'asistir', gloss: 'to attend', category: 'regular-ir', forms: ['asistía', 'asistías', 'asistía', 'asistíamos', 'asistían'], note: 'False friend — it means “to attend,” not “to assist.”' },
    { term: 'discutir', gloss: 'to argue', category: 'regular-ir', forms: ['discutía', 'discutías', 'discutía', 'discutíamos', 'discutían'] },

    { term: 'dar', gloss: 'to give', category: 'easy-now', forms: ['daba', 'dabas', 'daba', 'dábamos', 'daban'], note: 'Irregular in the preterite (di…); regular here.' },
    { term: 'caber', gloss: 'to fit', category: 'easy-now', forms: ['cabía', 'cabías', 'cabía', 'cabíamos', 'cabían'], note: 'Irregular in the preterite (cupe…); regular here.' },
    { term: 'mantener', gloss: 'to maintain', category: 'easy-now', forms: ['mantenía', 'mantenías', 'mantenía', 'manteníamos', 'mantenían'], note: 'Irregular in the preterite (mantuve…); regular here.' },
    { term: 'detener', gloss: 'to stop', category: 'easy-now', forms: ['detenía', 'detenías', 'detenía', 'deteníamos', 'detenían'], note: 'Irregular in the preterite (detuve…); regular here.' },
    { term: 'traducir', gloss: 'to translate', category: 'easy-now', forms: ['traducía', 'traducías', 'traducía', 'traducíamos', 'traducían'], note: 'Irregular in the preterite (traduje…); regular here.' },
    { term: 'producir', gloss: 'to produce', category: 'easy-now', forms: ['producía', 'producías', 'producía', 'producíamos', 'producían'], note: 'Irregular in the preterite (produje…); regular here.' },
    { term: 'atraer', gloss: 'to attract', category: 'easy-now', forms: ['atraía', 'atraías', 'atraía', 'atraíamos', 'atraían'], note: 'Irregular in the preterite (atraje…); regular here.' },
    { term: 'leer', gloss: 'to read', category: 'easy-now', forms: ['leía', 'leías', 'leía', 'leíamos', 'leían'], note: 'Irregular in the preterite (leyó); regular here.' },
    { term: 'oír', gloss: 'to hear', category: 'easy-now', forms: ['oía', 'oías', 'oía', 'oíamos', 'oían'], note: 'Irregular in the preterite (oyó); regular here.' },
    { term: 'caer', gloss: 'to fall', category: 'easy-now', forms: ['caía', 'caías', 'caía', 'caíamos', 'caían'], note: 'Irregular in the preterite (cayó); regular here.' },
    { term: 'construir', gloss: 'to build', category: 'easy-now', forms: ['construía', 'construías', 'construía', 'construíamos', 'construían'], note: 'Irregular in the preterite (construyó); regular here.' },
    { term: 'incluir', gloss: 'to include', category: 'easy-now', forms: ['incluía', 'incluías', 'incluía', 'incluíamos', 'incluían'], note: 'Irregular in the preterite (incluyó); regular here.' },
    { term: 'destruir', gloss: 'to destroy', category: 'easy-now', forms: ['destruía', 'destruías', 'destruía', 'destruíamos', 'destruían'], note: 'Irregular in the preterite (destruyó); regular here.' },
    { term: 'preferir', gloss: 'to prefer', category: 'easy-now', forms: ['prefería', 'preferías', 'prefería', 'preferíamos', 'preferían'], note: 'Stem-changes in the preterite (prefirió); regular here.' },
    { term: 'mentir', gloss: 'to lie', category: 'easy-now', forms: ['mentía', 'mentías', 'mentía', 'mentíamos', 'mentían'], note: 'Stem-changes in the preterite (mintió); regular here.' },
    { term: 'sugerir', gloss: 'to suggest', category: 'easy-now', forms: ['sugería', 'sugerías', 'sugería', 'sugeríamos', 'sugerían'], note: 'Stem-changes in the preterite (sugirió); regular here.' },
    { term: 'vestir', gloss: 'to dress', category: 'easy-now', forms: ['vestía', 'vestías', 'vestía', 'vestíamos', 'vestían'], note: 'Stem-changes in the preterite (vistió); regular here.' },
    { term: 'elegir', gloss: 'to choose', category: 'easy-now', forms: ['elegía', 'elegías', 'elegía', 'elegíamos', 'elegían'], note: 'Stem-changes in the preterite (eligió); regular here.' },
    { term: 'recordar', gloss: 'to remember', category: 'easy-now', forms: ['recordaba', 'recordabas', 'recordaba', 'recordábamos', 'recordaban'], note: 'Stem-changes in the present (recuerdo); regular here.' },
    { term: 'cerrar', gloss: 'to close', category: 'easy-now', forms: ['cerraba', 'cerrabas', 'cerraba', 'cerrábamos', 'cerraban'], note: 'Stem-changes in the present (cierro); regular here.' },
    { term: 'almorzar', gloss: 'to eat lunch', category: 'easy-now', forms: ['almorzaba', 'almorzabas', 'almorzaba', 'almorzábamos', 'almorzaban'], note: 'Stem-changes in the present (almuerzo); regular here.' },
  ],

  patterns: [
    {
      title: 'When to use it',
      list: [
        'An ongoing or repeated past action with no defined endpoint: <em>Hablaba español todos los días.</em> ("I used to speak Spanish every day.")',
        'A habitual action — the Spanish equivalent of "used to" or "would": <em>Cuando era niño, jugaba fútbol.</em>',
        'Descriptions in the past — people, places, weather, time, age, physical or emotional state: <em>Era alta y tenía el pelo negro.</em> · <em>Eran las tres.</em> · <em>Tenía diez años.</em>',
        'The background or setting a story unfolds against, and an action already <strong>in progress</strong> when something else happened. The ongoing action is imperfect; the interruption is preterite: <em><strong>Dormía</strong> cuando sonó el teléfono.</em>',
        'Repeated actions cued by words like <code>siempre</code>, <code>a menudo</code>, <code>todos los días</code>, <code>cada semana</code>, and <code>mientras</code>.',
        'Compare it side by side with the <a href="preterite.html">pretérito</a> — most confusion between the two clears up once you see them next to each other.',
      ],
    },
    {
      title: 'The endings',
      table: {
        head: ['Pronoun', '-ar', '-er / -ir', 'ser', 'ir', 'ver'],
        rows: [
          ['yo', '-aba', '-ía', 'era', 'iba', 'veía'],
          ['tú', '-abas', '-ías', 'eras', 'ibas', 'veías'],
          ['él/ella/Ud.', '-aba', '-ía', 'era', 'iba', 'veía'],
          ['nosotros', '-ábamos', '-íamos', 'éramos', 'íbamos', 'veíamos'],
          ['ellos/Uds.', '-aban', '-ían', 'eran', 'iban', 'veían'],
        ],
      },
    },
    {
      title: 'Things to internalize',
      list: [
        'The imperfect has exactly three irregular verbs in the whole language: <code>ser</code>, <code>ir</code>, and <code>ver</code>. Everything else follows one of two patterns.',
        '<em>-er</em> and <em>-ir</em> verbs share identical imperfect endings — learn one set, get both conjugations free.',
        'Stress never moves to the stem, so there are no stem changes and no spelling changes (no <code>busqué</code>-style c → qu tricks like in the preterite).',
        'Verbs that are irregular in the preterite or present — <code>tener</code>, <code>hacer</code>, <code>querer</code>, <code>decir</code>, <code>pedir</code>, <code>dormir</code> — go back to being completely regular here.',
        '<code>-ar</code> imperfect only carries a written accent on the <em>nosotros</em> form (<code>-ábamos</code>); <code>-er/-ir</code> imperfect carries one on every form (<code>-ía</code>).',
        'The imperfect describes ongoing or repeated past action — "used to" or "was ___ing" — which is why it pairs so naturally with descriptions and background scenes.',
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
            <a href="https://studyspanish.com/grammar/lessons/imp1" target="_blank" rel="noopener">StudySpanish.com — Imperfect: Part I</a>
            <span class="reading-desc">Formation and core uses of the imperfect, first in a short lesson series.</span>
          </li>
          <li>
            <a href="https://studyspanish.com/grammar/lessons/pretimp1" target="_blank" rel="noopener">StudySpanish.com — Preterite vs Imperfect: Part I</a>
            <span class="reading-desc">A dedicated multi-part lesson on choosing between the two past tenses.</span>
          </li>
        </ul>`,
    },
  ],
};
