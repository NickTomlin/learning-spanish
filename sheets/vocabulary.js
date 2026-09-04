import preterite from './preterite.js';

const vocabularyVerbMeanings = {
  saber: 'to know a fact or know how',
  conocer: 'to know a person or place',
  beber: 'to drink',
  tomar: 'to take',
  dejar: 'to leave something behind or let',
  salir: 'to go out or depart',
};

const verbDistractorGroups = {
  saber: 'know',
  conocer: 'know',
  beber: 'drink',
  tomar: 'drink',
  dejar: 'leave',
  salir: 'leave',
};

const verbItems = preterite.items.map(({ term, gloss }) => ({
  term,
  category: 'verbs',
  forms: [vocabularyVerbMeanings[term] || gloss],
  distractorGroup: verbDistractorGroups[term],
}));

const phraseItems = [
  ['tener que', 'to have to'],
  ['acabar de', 'to have just'],
  ['darse cuenta de', 'to realize'],
  ['tener ganas de', 'to feel like'],
  ['tener razón', 'to be right'],
  ['tener hambre', 'to be hungry'],
  ['tener prisa', 'to be in a hurry'],
  ['echar de menos', 'to miss'],
  ['llevarse bien', 'to get along'],
  ['estar de acuerdo', 'to agree'],
  ['no importa', "it doesn't matter"],
  ['por supuesto', 'of course'],
  ['en vez de', 'instead of'],
  ['hacer falta', 'to be necessary'],
].map(([term, meaning]) => ({ term, category: 'phrases', forms: [meaning] }));

const connectorItems = [
  ['mientras', 'while (simultaneous actions)', 'while'],
  ['mientras que', 'whereas (contrast)', 'while'],
  ['cuando', 'when'],
  ['antes de', 'before'],
  ['después de', 'after'],
  ['en cuanto', 'as soon as'],
  ['hasta que', 'until'],
  ['desde entonces', 'since then'],
  ['de repente', 'suddenly'],
  ['al principio', 'at first'],
  ['al final', 'in the end'],
  ['primero', 'first'],
  ['luego', 'next'],
  ['mientras tanto', 'meanwhile'],
  ['todavía no', 'not yet'],
  ['ya no', 'no longer'],
  ['a menudo', 'often'],
  ['de vez en cuando', 'occasionally'],
  ['casi nunca', 'hardly ever'],
  ['todos los días', 'every day'],
  ['porque', 'because'],
  ['por eso', 'therefore'],
  ['así que', 'so'],
  ['sin embargo', 'however'],
  ['además', 'moreover'],
  ['aunque', 'although'],
].map(([term, meaning, distractorGroup]) => ({
  term,
  category: 'connectors',
  forms: [meaning],
  distractorGroup,
}));

export default {
  id: 'vocabulary',
  title: 'Vocabulario',
  titleHTML: 'Vocabulari<span class="accent">o</span>',
  subtitle: 'Practical Spanish words and expressions',
  footer: 'Unas pocas palabras cada día suman mucho.',
  quizType: 'multiple-choice',

  itemNoun: 'word or phrase',
  itemNounPlural: 'words and phrases',
  searchPlaceholder: 'Search Spanish or English meanings…',
  worksheetInstructions: 'Write the English meaning of each Spanish word or phrase.',
  referenceInstructions: 'Every Spanish word and phrase, grouped by use.',

  axis: {
    label: 'Meaning',
    values: ['English'],
  },

  categories: [
    { id: 'verbs', name: 'Useful verbs', desc: 'Common verbs drawn from the preterite study data.' },
    { id: 'phrases', name: 'Idiomatic phrases', desc: 'Everyday expressions to learn as complete units.' },
    { id: 'connectors', name: 'Connectors and time words', desc: 'Words that connect ideas and organize a story.' },
  ],

  items: [...verbItems, ...phraseItems, ...connectorItems],
};
