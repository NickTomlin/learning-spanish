---
name: explain-spanish-story
description: Explain a question from a saved Spanish preterite/imperfect story quiz when the learner provides its lookup key.
---

# Explain a Saved Story Question

Load the quiz using its local lookup key before explaining anything:

```sh
python3 story_archive.py show KEY
```

Run the command from the repository root. Keys are case-insensitive. Read the
whole story for context, then use the requested question, its answer array (in
blank order), and any note. If the key or question number is missing, ask for
it; for an unknown key, show the results of `python3 story_archive.py list` and
ask whether one of those keys is intended.

Independently check the stored form against the sentence. State the form the
quiz stored, then explain the tense choice in context (background, ongoing
action, habit, bounded event, interruption, or change of state). Distinguish a
tense-choice issue from a conjugation error. If the stored form is wrong,
plainly say so and give the correction. If another tense is grammatical,
explain its change in viewpoint or meaning and label it as an alternative.
Explain only the requested item unless the learner asks for more.

Never reconstruct a quiz or invent an answer for an unknown key.
