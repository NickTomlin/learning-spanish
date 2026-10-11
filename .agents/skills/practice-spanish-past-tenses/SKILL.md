---
name: practice-spanish-past-tenses
description: Create and conduct conversational Spanish story quizzes that contrast the preterite and imperfect. Use when a learner asks to practice, review, or be quizzed on Spanish past-tense choice through a story, fill-in-the-blank exercise, or verb-choice activity, especially with background versus completed actions, interruptions, habitual actions, time and age, mental or emotional states, changes of state, and shifts in meaning.
---

# Practice Spanish Past Tenses

Default to an interactive, encouraging quiz rather than giving a worksheet and answer key all at once. If the learner asks for a printable quiz, follow the printable version below.

## Build the quiz

1. Infer the learner's level and preferred language from the conversation. If unclear, use accessible intermediate Spanish and explain in English.
2. Write one coherent short story of 6–10 numbered items. Keep the plot natural, vivid, and easy to follow.
3. Put one or two blanks in each item. Give the infinitive after every blank and include the subject when it is not obvious.
4. Ask the learner to supply the conjugated form, or offer two conjugated choices when they request multiple choice.
5. Mix regular and common irregular verbs. Do not make vocabulary difficulty the main obstacle.

Include a balanced selection of contrasts:

- an action in progress interrupted by a completed event;
- background description versus a foreground event;
- habitual or repeated action versus a bounded occurrence;
- telling time, age, weather, or an ongoing condition;
- a mental, emotional, or physical state;
- a change of state or the onset of a reaction;
- at least one nuanced case where either tense could be grammatical but changes the viewpoint or meaning.

Avoid treating signal words such as *mientras*, *siempre*, *de repente*, or *por fin* as mechanical rules. Make the event structure supply the answer.

## Conduct the interaction

Present only the story and brief answer instructions first. Invite compact answers such as `1. miraba / sonó`.

After the learner responds:

1. Mark each response individually.
2. When an answer is wrong or malformed, show the learner's exact answer struck through, an arrow, and the corrected form: `~~esperia~~ → **esperaba**`. Do not silently replace the learner's response or show only the corrected answer.
3. Give a short reason tied to the story's viewpoint: background, ongoing, habitual, bounded, completed, interrupting, or change of state.
4. Distinguish tense choice from conjugation errors. If the learner chose the right tense but formed it incorrectly, say so.
5. For a context-dependent item, explain how the alternate tense would change the meaning instead of calling it simply wrong.
6. Notice one pattern in the learner's mistakes and give one memorable rule of thumb.
7. Offer a short follow-up round targeted to that pattern.

Keep the tone conversational. Prefer questions such as “What was already happening, and what moved the story forward?” over grammar jargon. Use jargon only when it helps, and define it plainly.

## Adapt difficulty

- Beginner: use familiar verbs, one blank per item, and two choices.
- Intermediate: mix blank completion and close contrasts; use a few irregular forms.
- Advanced: include viewpoint-dependent alternatives, state verbs with meaning shifts, and sentences where discourse context determines the tense.

If the learner asks for a “short” quiz without specifying length, use 8 blanks total. If they ask only for a quiz, do not reveal answers until they attempt it.

## Printable version

If the learner asks for a PDF of a story quiz, write the story and answer key as JSON in the repository's gitignored `printing/` directory. Follow `examples/past-tenses.json`: a `title`, `instructions`, and a `questions` list whose entries have `text` with `___` for each blank and an `answers` array in blank order. Include a `note` on an item when an alternate tense changes the viewpoint. Do not put item numbers in `text`; the template supplies them. Check that every blank has an answer, and keep the story short enough to fit on one page if a double-sided answer key is wanted.

Run `./print-story.py printing/<name>.json` from the repository root. This produces matching HTML (for preview) and PDF in `printing/`, using the site's print styles; the answer key follows on a separate page. Use `--no-key` if requested. Only add `--print` if the learner explicitly wants the PDF sent to the default physical printer. Show the learner the PDF path; never print automatically just because they asked for a PDF.
