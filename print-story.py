#!/usr/bin/env python3
"""Render an agent-written story quiz JSON as a printable HTML and PDF pair."""

import argparse
from html import escape
from pathlib import Path
import shutil
from string import Template
import subprocess
import tempfile
from story_archive import load_quiz, save_quiz


ROOT = Path(__file__).resolve().parent
BLANK = '<span class="story-blank">&nbsp;</span>'


def render(quiz, story_key, include_key):
    title = escape(quiz["title"])
    instructions = escape(quiz.get("instructions", "Fill in each blank with the correct form."))
    questions = []
    answers = []
    for number, question in enumerate(quiz["questions"], 1):
        prompt = BLANK.join(escape(part) for part in question["text"].split("___"))
        questions.append(f'<li class="story-item"><span class="story-num">{number}.</span><span>{prompt}</span></li>')
        forms = " / ".join(escape(answer) for answer in question["answers"])
        note = f'<span class="story-note">{escape(question["note"])}</span>' if question.get("note") else ""
        answers.append(f'<li class="story-item"><span class="story-num">{number}.</span><span>{forms}{note}</span></li>')

    key = ""
    if include_key:
        key = f'''<section class="paper answer-key">
    <div class="paper-head"><div><p class="paper-kicker">Answer key</p><h1 class="paper-title">{title}</h1></div></div>
    <div class="paper-meta"><div class="paper-instructions">Answers in blank order.<br>Story key: {escape(story_key)}</div></div>
    <ol class="story-answers">{"".join(answers)}</ol>
    <div class="paper-foot"><span>{len(questions)} questions</span><span>{title} — answer key</span></div>
  </section>'''
    template = Template((ROOT / "templates/story-worksheet.html").read_text(encoding="utf-8"))
    return template.substitute(title=title, instructions=instructions,
                               questions="".join(questions), answer_key=key,
                               story_key=escape(story_key), count=len(questions))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("quiz", type=Path, help="JSON file containing title, questions, blanks, and answers")
    parser.add_argument("--no-key", action="store_true", help="omit the answer key")
    parser.add_argument("--print", action="store_true", help="send the PDF to the default printer with lp")
    args = parser.parse_args()

    try:
        quiz = load_quiz(args.quiz)
        key = save_quiz(quiz)
    except (OSError, ValueError) as error:
        parser.error(str(error))
    print(f"Story key: {key}", flush=True)

    chromium = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")
    if not chromium:
        parser.error("Chromium or Google Chrome is required to generate a PDF")
    if args.print and not shutil.which("lp"):
        parser.error("lp is required for --print")
    html = render(quiz, key, not args.no_key)

    output = ROOT / "printing"
    output.mkdir(exist_ok=True)
    name = args.quiz.stem + ("-no-key" if args.no_key else "")
    page = output / f"{name}.html"
    pdf = page.with_suffix(".pdf")
    page.write_text(html, encoding="utf-8")
    with tempfile.TemporaryDirectory() as profile:
        result = subprocess.run(
            [chromium, "--headless", "--disable-gpu", "--no-pdf-header-footer",
             f"--user-data-dir={profile}", f"--print-to-pdf={pdf}", page.as_uri()],
            capture_output=True, text=True, timeout=45,
        )
    if result.returncode or not pdf.is_file() or not pdf.stat().st_size:
        pdf.unlink(missing_ok=True)
        parser.exit(1, f"PDF generation failed: {result.stderr}\n")
    print(f"HTML: {page}")
    print(f"PDF: {pdf}")
    if args.print:
        subprocess.run(["lp", str(pdf)], check=True)


if __name__ == "__main__":
    main()
