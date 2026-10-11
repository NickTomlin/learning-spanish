"""Integration checks for PDF export; requires Chromium."""

import os
from pathlib import Path
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "print-worksheet.py"


class PrintWorksheetTests(unittest.TestCase):
    def test_generates_printable_pdf(self):
        result = subprocess.run(
            [str(SCRIPT), "sheet=preterite&blanks=3&seed=export-test&key=0"],
            capture_output=True, text=True, check=True,
        )
        pdf = Path(result.stdout.split("PDF: ", 1)[1].strip())
        self.assertTrue(pdf.read_bytes().startswith(b"%PDF"))
        self.assertIn("seed=export-test", result.stdout)

    def test_never_prints_invalid_or_empty_page(self):
        with tempfile.TemporaryDirectory() as directory:
            marker = Path(directory) / "printer-called"
            printer = Path(directory) / "lp"
            printer.write_text(f"#!/bin/sh\ntouch '{marker}'\n")
            printer.chmod(0o755)
            environment = {**os.environ, "PATH": directory + os.pathsep + os.environ["PATH"]}
            for url in ("sheet=pretertie", "sheet=preterite&blanks=0&tables=0"):
                with self.subTest(url=url):
                    result = subprocess.run(
                        [str(SCRIPT), url, "--print"],
                        env=environment, capture_output=True, text=True,
                    )
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn("No printable document rendered", result.stderr)
                    self.assertFalse(marker.exists())


if __name__ == "__main__":
    unittest.main()
