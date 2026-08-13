Spanish learning bits and bobs
===

Utilities for helping me practice spanish.

Deployed at: https://espanol-ntomlin.netlify.app/


## Quiz sheets

Everything drillable is defined as a **sheet**: one data file that feeds both an
interactive study page and a printable worksheet, so the two can never drift.

```
sheets/preterite.js     the data
sheets/index.js         registry of every sheet
lib/sheet.js            schema, validation, question sampling, seeded RNG
lib/study-page.js       interactive page (reference · quiz · patterns)
lib/worksheet-page.js   printable worksheet + answer key
css/theme.css           shared tokens
css/study.css           interactive styles
css/worksheet.css       paper + print styles
preterite.html          shell: imports a sheet, mounts the study page
worksheet.html          the one worksheet page — every sheet, every config
```

There is a study page per sheet, but only **one** worksheet page. Which sheet
it prints is a URL option like any other, so the nav carries a single
`Worksheets` entry and quiz sections deep-link into a configuration of it.

### Adding a sheet

1. **Write the data** — `sheets/<id>.js`, default-exporting:

   ```js
   export default {
     id: 'gender',
     title: 'Género',
     subtitle: 'Noun gender and articles',
     itemNoun: 'noun',
     inputPlaceholder: 'article…',
     searchPlaceholder: 'Search nouns…',
     worksheetInstructions: 'Write the definite and indefinite article.',

     // The forms every item inflects across. `shortValues` is used where
     // space is tight (the printed worksheet); it defaults to `values`.
     axis: { label: 'Article', values: ['definite', 'indefinite'], shortValues: ['def.', 'indef.'] },

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

   `normalizeSheet` throws on a mismatched `forms` length or an unknown
   `category`, so typos surface immediately instead of half-rendering.

2. **Register it** in `sheets/index.js` — one import and one entry. That alone
   makes `worksheet.html?sheet=<id>` work and adds the sheet to the worksheet
   page's tabs; no new worksheet page needed.

3. **Add the study page** — copy `preterite.html` and change the import. That
   shell is the whole page; everything else comes from the sheet.

4. **Link the study page** from `index.html`.

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
| `blanks` | Numbered fill-in-the-blank prompts                  | `24`    |
| `tables` | Blank full-conjugation tables                       | `0`     |
| `cats`   | Comma-separated category ids to draw from           | all     |
| `seed`   | Any string; same seed ⇒ same questions              | random  |
| `key`    | `0` to omit the answer key                          | `1`     |

Blanks are dealt round-robin across items, so every item is asked once before
any repeats, and items used by a table exercise are kept out of the blanks —
the sheet never gives away an answer it also asks for.

# Local Development

```
./serve.sh          # http://localhost:8000
```
