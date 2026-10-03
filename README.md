Spanish learning bits and bobs
===

Utilities for helping me practice spanish.

Deployed at: https://espanol-ntomlin.netlify.app/


## Spanish keyboard

`keyboard.html` is a scratchpad for writing Spanish text, with quick keys for
accented characters and opening punctuation. Press `Ctrl`/`Cmd` + `Enter`, then
the corresponding letter, to insert an accent; `2` inserts `ü`, and `?` or `!`
inserts opening punctuation. The same shortcuts work in quiz answer fields.
`Ctrl`/`Cmd` + `S` saves a keyboard entry. The page automatically saves the
current draft and keeps the 15 most recent saved entries in local storage.


## Quiz sheets

Everything drillable is defined as a **sheet**: one data file that feeds an
interactive study page and both printable documents — a worksheet of exercises
and a reference sheet of every form — so none of them can drift apart.

```
sheets/preterite.js     tense data
sheets/vocabulary.js    vocabulary data (verbs derived from the preterite sheet)
sheets/index.js         registry of every sheet
lib/sheet.js            schema, validation, question sampling, seeded RNG
lib/study-page.js       interactive page (reference · typing/choice quiz · patterns)
lib/worksheet-page.js   printable worksheet + answer key, and reference sheet
css/theme.css           shared tokens
css/study.css           interactive styles
css/worksheet.css       paper + print styles
preterite.html          shell: imports a sheet, mounts the study page
vocabulary.html         the equivalent shell for vocabulary practice
worksheet.html          the one printable page — every sheet, every config
```

There is a study page per sheet, but only **one** printable page. Which sheet
it prints — and whether it prints a worksheet or a reference sheet — are URL
options like any other, so the nav carries a single `Printables` entry and
study pages deep-link into a configuration of it. Interactive quizzes can be
narrowed to specific categories and axis values, such as only `yo`, `él/ella`,
and `ellos` pronouns. The current choices are stored in human-readable `cats`
and `axis` URL options, such as `axis=yo,el-ella-usted,ellos-ustedes`, making a
configured quiz bookmarkable and shareable.

### Adding a sheet

1. **Write the data** — `sheets/<id>.js`, default-exporting:

   ```js
   export default {
     id: 'gender',
     title: 'Género',
     subtitle: 'Noun gender and articles',
     quizType: 'typing', // optional: `typing` (default) or `multiple-choice`
     itemNoun: 'noun',
     inputPlaceholder: 'article…',
     searchPlaceholder: 'Search nouns…',
     worksheetInstructions: 'Write the definite and indefinite article.',
     referenceInstructions: 'Every noun, grouped by gender.',

     // The forms every item inflects across. `ids` names them in quiz URLs;
     // `shortValues` is used where space is tight on the printed worksheet.
     axis: {
       label: 'Article',
       values: ['definite', 'indefinite'],
       ids: ['definite', 'indefinite'],
       shortValues: ['def.', 'indef.'],
     },

     // `highlight` marks columns worth flagging in red in the reference table.
     categories: [
       { id: 'masc', name: 'Masculine', desc: 'Usually -o.' },
       { id: 'exceptions', name: 'Exceptions', desc: 'Look masculine, are not.', highlight: [0, 1] },
     ],

     // forms[i] is the answer for axis.values[i] — the lengths must match.
     items: [
       { term: 'libro', gloss: 'book', category: 'masc', forms: ['el libro', 'un libro'] },
       { term: 'mano', gloss: 'hand', category: 'exceptions', forms: ['la mano', 'una mano'], note: 'Ends in -o, still feminine.' },
     ],

     // Optional free-form notes tab. Table and/or list per section.
     patterns: [
       { title: 'Rules of thumb', list: ['Nouns in <code>-ción</code> are feminine.'] },
     ],
   };
   ```

   `normalizeSheet` throws on a mismatched `forms` length, unknown `category`,
   or unknown `quizType`, so typos surface immediately instead of half-rendering.
   Multiple-choice sheets use unique answers from the same category as choices,
   falling back to the full sheet when necessary. Items can share a
   `distractorGroup` when their meanings overlap and should not appear together.

2. **Register it** in `sheets/index.js` — one import and one entry. That alone
   makes `worksheet.html?sheet=<id>` work, gives you a reference sheet at
   `&doc=reference`, and adds the sheet to the printable page's tabs; no new
   page needed.

3. **Add the study page** — copy `preterite.html` and change the import. That
   shell is the whole page; everything else comes from the sheet.

4. **Link the study page** from `index.html`.

### Vocabulary

`vocabulary.html` is a normal study page backed by `sheets/vocabulary.js`. Its
one-position axis stores each English meaning, and `quizType: 'multiple-choice'`
turns those meanings into answer buttons. Verb terms and meanings are derived
from `sheets/preterite.js`, with vocabulary-only labels for English senses that
would otherwise overlap in one set of choices. Phrases and connectors live in
the vocabulary sheet. This keeps shared verb knowledge in one place without a
build step.

### Worksheets

`worksheet.html` renders a print-ready exercise sheet with the answer key on a
second page (print double-sided and it lands on the back). Visited bare it
opens the first registered sheet; tabs at the top switch sheets, carrying your
blanks/tables/key settings over.

Every option lives in the URL, and question selection is seeded, so a given URL
always regenerates the identical worksheet — bookmark it, reprint it, or hand
out the matching key later. The study pages use this: narrow a quiz to J-stems
and its worksheet link points at `?sheet=preterite&cats=j-stem`.

| Param    | Meaning                                            | Default |
| -------- | -------------------------------------------------- | ------- |
| `sheet`  | Sheet id from the registry                          | first   |
| `doc`    | `worksheet`, or `reference` for the reference sheet | `worksheet` |
| `blanks` | Numbered fill-in-the-blank prompts                  | `24`    |
| `tables` | Blank full-conjugation tables                       | `0`     |
| `cats`   | Comma-separated category ids to draw from           | all     |
| `seed`   | Any string; same seed ⇒ same questions              | random  |
| `key`    | `0` to omit the answer key                          | `1`     |

Blanks are dealt round-robin across items, so every item is asked once before
any repeats, and items used by a table exercise are kept out of the blanks —
the sheet never gives away an answer it also asks for.

`blanks`, `tables`, `seed`, and `key` describe exercises, so they're ignored —
and dropped from the URL — when `doc=reference`.

### Quiz weighting

Interactive quizzes use the axis weights in `quiz-config.js`. Unlisted axis ids
have weight `1`; a weight of `2` makes that form twice as likely as an unlisted
form without excluding anything. The current configuration gives `yo` and
`él/ella/Ud.` double weight in every sheet that uses those axis ids. Quiz option
filters still take precedence, so only currently selected forms can be asked.

### Reference sheets

`worksheet.html?sheet=<id>&doc=reference` prints the other side of the same
data: every form, filled in. It leads with the sheet's pattern tables (the
endings, the stems) and follows them with one table per category, two columns
to the page, plus each item's notes. Columns a category marks as `highlight`
are set in bold rather than colour, so the page still reads on a black-and-white
printer.

The pattern tables always print — they describe the whole tense, not one
category — while `cats` narrows the conjugation tables under them. Every study
page links to its reference sheet, carrying the quiz's current categories.

# Local Development

```
./serve.sh                    # http://localhost:8000 (loopback only)
node tests/validate-data.mjs  # sheet integrity and multiple-choice options
```

### Local exercise routine

The project skills in `.agents/skills/` offer three ways to practise with Pi:

- `/skill:spanish-exercises` opens a site quiz or makes a PDF from the existing sheets.
- `/skill:practice-spanish-past-tenses` runs a conversational preterite-versus-imperfect story quiz.
- `/skill:practice-spanish-story-comprehension` runs a reading, retelling, and correction exercise.

Start `pi` in this repository to discover them (or `/reload` after adding them
to an existing session). The past-tense story skill can also write a printable
quiz and answer key; the site's sheet-based worksheets remain separate.

For a batch of all three worksheets, install Chromium, sign in to Pi with
`/login` (Luna and Sol must be available), and run from this repo:

```
npm install --ignore-scripts          # once: install the Pi SDK
./practice.mjs make                   # fresh random story and worksheets; no print job
```

Review the three PDFs listed by `make`, especially `printing/current-story.html`
or `printing/current-story.pdf`. Each PDF has an answer key on page two. Then:

```
lpstat -d                             # check the default printer
./practice.mjs print                  # send all three, duplex requested
```

`./practice.mjs make --reuse` rebuilds the saved batch without model calls.
Use `./practice.mjs make --theme childhood` only when you want that focus.

A new story uses two fresh, tool-free Pi sessions: Luna plans an outline from
seed-selected scenarios, complications, and opening styles, then Sol writes the
quiz from that outline. The seed does not require a time or weather opening;
`--theme childhood` selects only childhood scenarios. Each plain `make` picks a
new random seed and makes a new story; a seed chooses the ingredients and
worksheet questions, not the exact wording of an LLM regeneration. The outline
and quiz are saved in `printing/`; `make --seed <previous-seed>` reuses the saved
outline and calls only Sol. `make --reuse` keeps the previous seed and quiz with
**no model call**. New generations report each stage's token usage and Pi's
catalog-based cost estimate in `printing/current-story-usage.json`. This is not
necessarily the amount billed under a subscription. The seed and PDF paths are
saved in `printing/current-run.json`. To try the deterministic
workflow without calling a model, run
`./practice.mjs make --story examples/past-tenses.json`. The `print` command
sends the reviewed PDFs to the default printer with duplex requested.

For one PDF without an agent, install Chromium and run:

```
./print-worksheet.py 'worksheet.html?sheet=preterite&blanks=24&seed=practice-1'
./print-worksheet.py 'worksheet.html?sheet=vocabulary&doc=reference'
./print-story.py examples/past-tenses.json
```

Pass any `worksheet.html` URL or query string from the site. Omit the URL for a
new default worksheet; omit `seed` for new questions each time. PDFs go into
gitignored `printing/` (the filename identifies the sheet, document type, seed,
and URL options). Add `--print` to send the PDF to the default printer via `lp`.
The script serves the page locally during export, so `./serve.sh` need not be
running. For interactive practice instead, run `./serve.sh` and open a study
page in your browser. For an agent-written story worksheet, ask Pi to make a
printable past-tense quiz, or supply your own JSON following
`examples/past-tenses.json`: each question has `text` with `___` blanks and an
`answers` array in the same order. `./print-story.py printing/my-quiz.json`
produces an HTML preview and PDF in `printing/`, with the key on a separate
page. Use `--no-key` to leave it out; `--print` is opt-in for a physical copy.
Netlify uses `build-site.sh` to copy only the site HTML, runtime CSS, JS, and
sheet data into ignored `dist/`, its configured publish directory. Run
`./build-site.sh` and inspect `dist/` before deployment. Never upload the whole
working directory: Git ignores `printing/`, but a manual upload might include
it. The GitHub repository itself is public, so don't commit private material,
including quiz responses or generated exercises. `./serve.sh` binds to
localhost for local practice.

Run `npm run test:practice` and
`python3 -m unittest discover -s tests -p 'test_print*.py'` to check PDF
export (requires Chromium; neither test sends a real print job).
