import assert from 'node:assert/strict';

import { allQuestions, multipleChoiceAnswers, normalizeAnswer, normalizeSheet, seededRandom } from '../lib/sheet.js';
import preteriteRaw from '../sheets/preterite.js';
import imperfectRaw from '../sheets/imperfect.js';
import vocabularyRaw from '../sheets/vocabulary.js';

const preterite = normalizeSheet(preteriteRaw);
const imperfect = normalizeSheet(imperfectRaw);
const vocabulary = normalizeSheet(vocabularyRaw);

assert.equal(preterite.quizType, 'typing');
assert.equal(imperfect.quizType, 'typing');
assert.equal(vocabulary.quizType, 'multiple-choice');
assert.ok(preterite.items.length >= 63, 'preterite should include at least 20 additions');
assert.ok(imperfect.items.length >= 58, 'imperfect should include at least 20 additions');
assert.ok(vocabulary.items.length >= 70, 'vocabulary should include at least 70 prompts');

for (const sheet of [preterite, imperfect, vocabulary]) {
  const terms = sheet.items.map((item) => normalizeAnswer(item.term));
  assert.equal(new Set(terms).size, terms.length, `${sheet.id} contains duplicate terms`);
  assert.ok(sheet.items.every((item) => item.forms.length === sheet.axis.values.length));
}

const requiredPreteriteAdditions = [
  'trabajar', 'estudiar', 'mirar', 'llamar', 'ayudar', 'preguntar', 'encontrar',
  'pensar', 'jugar', 'ganar', 'esperar', 'entrar', 'terminar', 'quedar', 'abrir',
  'aprender', 'correr', 'entender', 'perder', 'responder', 'decidir', 'servir',
  'seguir', 'conseguir', 'repetir',
];
const requiredImperfectAdditions = [
  'mirar', 'llamar', 'ayudar', 'preguntar', 'encontrar', 'pensar', 'jugar',
  'ganar', 'esperar', 'entrar', 'terminar', 'quedar', 'cocinar', 'entender',
  'perder', 'responder', 'servir', 'seguir', 'conseguir', 'repetir',
];
for (const term of requiredPreteriteAdditions) {
  assert.ok(preterite.items.some((item) => item.term === term), `missing preterite verb ${term}`);
}
for (const term of requiredImperfectAdditions) {
  assert.ok(imperfect.items.some((item) => item.term === term), `missing imperfect verb ${term}`);
}

assert.ok(vocabulary.categories.some((category) => category.id === 'phrases'));
assert.ok(vocabulary.categories.some((category) => category.id === 'connectors'));

const vocabularyMeanings = new Map(vocabulary.items.map((item) => [item.term, item.forms[0]]));
const verbMeaningContrasts = [
  [['saber', 'to know a fact or know how'], ['conocer', 'to know a person or place']],
  [['beber', 'to drink'], ['tomar', 'to take']],
  [['dejar', 'to leave something behind or let'], ['salir', 'to go out or depart']],
];
for (const contrast of verbMeaningContrasts) {
  const [[firstTerm, firstMeaning], [secondTerm, secondMeaning]] = contrast;
  assert.equal(vocabularyMeanings.get(firstTerm), firstMeaning);
  assert.equal(vocabularyMeanings.get(secondTerm), secondMeaning);
  assert.notEqual(normalizeAnswer(firstMeaning), normalizeAnswer(secondMeaning));
}
assert.equal(vocabularyMeanings.get('mientras'), 'while (simultaneous actions)');
assert.equal(vocabularyMeanings.get('mientras que'), 'whereas (contrast)');

const overlappingMeanings = [
  ['saber', 'conocer'],
  ['beber', 'tomar'],
  ['dejar', 'salir'],
  ['mientras', 'mientras que'],
];
for (const [firstTerm, secondTerm] of overlappingMeanings) {
  const first = vocabulary.items.find((item) => item.term === firstTerm);
  const second = vocabulary.items.find((item) => item.term === secondTerm);
  assert.ok(first.distractorGroup, `${firstTerm} should have a distractor group`);
  assert.equal(first.distractorGroup, second.distractorGroup);
}

const vocabularyVerbOverrides = new Map(verbMeaningContrasts.flat());
const vocabularyVerbs = new Map(
  vocabulary.items.filter((item) => item.category === 'verbs').map((item) => [item.term, item.forms[0]])
);
for (const verb of preterite.items) {
  const expectedMeaning = vocabularyVerbOverrides.get(verb.term) || verb.gloss;
  assert.equal(vocabularyVerbs.get(verb.term), expectedMeaning, `vocabulary should derive ${verb.term}`);
}

const questions = allQuestions(vocabulary);
for (const question of questions) {
  const categoryQuestions = questions.filter((candidate) => candidate.item.category === question.item.category);
  const choices = multipleChoiceAnswers(question, {
    questions: categoryQuestions,
    fallbackQuestions: questions,
    random: seededRandom(question.key),
  });
  const normalized = choices.map(normalizeAnswer);
  assert.equal(choices.length, 4, `${question.item.term} should have four choices`);
  assert.equal(new Set(normalized).size, choices.length, `${question.item.term} has duplicate visible choices`);
  assert.ok(normalized.includes(normalizeAnswer(question.answer)), `${question.item.term} is missing its correct choice`);
}

for (const [firstTerm, secondTerm] of overlappingMeanings) {
  for (const term of [firstTerm, secondTerm]) {
    const question = questions.find((candidate) => candidate.item.term === term);
    const categoryQuestions = questions.filter(
      (candidate) => candidate.item.category === question.item.category
    );
    const otherMeaning = vocabularyMeanings.get(term === firstTerm ? secondTerm : firstTerm);
    for (let seed = 0; seed < 1000; seed++) {
      const choices = multipleChoiceAnswers(question, {
        questions: categoryQuestions,
        fallbackQuestions: questions,
        random: seededRandom(`${term}:${seed}`),
      });
      assert.ok(!choices.includes(otherMeaning), `${term} included overlapping meaning ${otherMeaning}`);
    }
  }
}

assert.throws(
  () => normalizeSheet({ ...vocabularyRaw, id: 'invalid', quizType: 'guessing' }),
  /unknown quizType/
);

console.log(`Validated ${preterite.items.length} preterite verbs, ${imperfect.items.length} imperfect verbs, and ${vocabulary.items.length} vocabulary prompts.`);
console.log(`Generated four unique choices for all ${questions.length} vocabulary questions.`);
