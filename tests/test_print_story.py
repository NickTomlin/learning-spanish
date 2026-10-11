"""Integration checks for agent-written story worksheets; requires Chromium."""

import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "print-story.py"


class PrintStoryTests(unittest.TestCase):
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
