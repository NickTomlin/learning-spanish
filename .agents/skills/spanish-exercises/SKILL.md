---
name: spanish-exercises
description: Use this site's study pages or generate and optionally print a worksheet or reference PDF. Use for existing browser drills, printable sheets, or answer keys; for conversational past-tense stories or reading comprehension, use the dedicated practice skills.
---

# Spanish exercises

For conversational past-tense choice, use `practice-spanish-past-tenses`; for story comprehension, use `practice-spanish-story-comprehension`. For this site's drills, ask whether the learner prefers a printable sheet, a browser quiz, or a short conversation here in Pi. The study pages are `preterite.html`, `imperfect.html`, and `vocabulary.html`. For browser practice, ask the learner to run `./serve.sh` in another terminal and open the appropriate page at `http://localhost:8000/`. Do not start the server if they only want a PDF or a Pi conversation. For a Pi conversation, use the corresponding data in `sheets/` to ask one question at a time, wait for the answer, then give feedback before continuing. Do not reveal the answers up front.

For a printable exercise, choose a sheet and run from the repository root:

```sh
./print-worksheet.py 'worksheet.html?sheet=preterite&blanks=24&seed=practice-1'
```

The worksheet page's URL options are documented in the repository README. The script starts its own temporary local server and saves the PDF in `printing/`. Use `--print` only when the learner explicitly wants a physical copy; it sends the PDF to the default printer using `lp`. To omit the answer key, add `&key=0`; to print the reference instead, use `&doc=reference`. A URL without a seed gets a new seed, while reusing a seeded URL reproduces the same exercises. Show the learner the URL and PDF path printed by the command so they can revisit the same sheet.

Generated files belong in `printing/`, which is ignored by git. Do not commit generated exercises.
