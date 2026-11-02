"""Integration checks for agent-written story worksheets; requires Chromium."""

import json
import os
from pathlib import Path
import importlib.util
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "print-story.py"

spec = importlib.util.spec_from_file_location("print_story", SCRIPT)
print_story = importlib.util.module_from_spec(spec)
spec.loader.exec_module(print_story)


class PrintStoryTests(unittest.TestCase):
    def test_explanations_are_paired_escaped_and_only_on_the_key(self):
        quiz = {"title": "Test", "questions": [{"text": "___ / ___", "answers": ["era", "llegó"],
                "explanations": ["Imperfect: background <state>.", "Preterite: an arrival & change."]}]}
        html = print_story.render(quiz, "12345678", True)
        front, key = html.split('<section class="paper answer-key">')
        self.assertNotIn("Imperfect:", front)
        self.assertIn('era<span class="story-note" lang="en">Imperfect: background &lt;state&gt;.', key)
        self.assertIn('llegó<span class="story-note" lang="en">Preterite: an arrival &amp; change.', key)
        self.assertNotIn("Imperfect:", print_story.render(quiz, "12345678", False))

    def test_legacy_quiz_and_invalid_explanations(self):
        quiz = {"title": "Test", "questions": [{"text": "___", "answers": ["era"]}]}
        from story_archive import validate_quiz
        validate_quiz(quiz)
        self.assertIn("era", print_story.render(quiz, "12345678", True))
        for explanations in [[], [""], ["one", "extra"], [None], "reason"]:
            quiz["questions"][0]["explanations"] = explanations
            with self.assertRaisesRegex(ValueError, "one nonempty explanation per answer"):
                validate_quiz(quiz)

    def test_example_generates_pdf_and_html_preview(self):
        result = subprocess.run(
            [str(SCRIPT), str(ROOT / "examples/past-tenses.json")],
            capture_output=True, text=True, check=True,
        )
        pdf = Path(result.stdout.split("PDF: ", 1)[1].strip())
        html = pdf.with_suffix(".html").read_text(encoding="utf-8")
        self.assertTrue(pdf.read_bytes().startswith(b"%PDF"))
        self.assertIn("Una noche en la biblioteca", html)
        self.assertIn('class="story-blank"', html)
        self.assertIn("Answer key", html)

    def test_no_key_is_separate_file(self):
        result = subprocess.run(
            [str(SCRIPT), str(ROOT / "examples/past-tenses.json"), "--no-key"],
            capture_output=True, text=True, check=True,
        )
        pdf = Path(result.stdout.split("PDF: ", 1)[1].strip())
        self.assertEqual(pdf.name, "past-tenses-no-key.pdf")
        self.assertTrue(pdf.read_bytes().startswith(b"%PDF"))
        self.assertNotIn("Answer key", pdf.with_suffix(".html").read_text(encoding="utf-8"))

    def test_mismatched_answers_never_print(self):
        with tempfile.TemporaryDirectory() as directory:
            quiz = Path(directory) / "invalid-story.json"
            quiz.write_text(json.dumps({
                "title": "Test", "questions": [{"text": "___ and ___", "answers": ["one"]}]
            }))
            marker = Path(directory) / "printer-called"
            printer = Path(directory) / "lp"
            printer.write_text(f"#!/bin/sh\ntouch '{marker}'\n")
            printer.chmod(0o755)
            environment = {**os.environ, "PATH": directory + os.pathsep + os.environ["PATH"]}
            result = subprocess.run(
                [str(SCRIPT), str(quiz), "--print"], env=environment,
                capture_output=True, text=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("one answer per ___ blank", result.stderr)
            self.assertFalse(marker.exists())


if __name__ == "__main__":
    unittest.main()
