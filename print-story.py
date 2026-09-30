#!/usr/bin/env python3
"""Render an agent-written story quiz JSON as a printable HTML and PDF pair."""

import argparse
from html import escape
import json
from pathlib import Path
import shutil
from string import Template
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parent
BLANK = '<span class="story-blank">&nbsp;</span>'


def load_quiz(path):
    quiz = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(quiz, dict) or not isinstance(quiz.get("title"), str) or not quiz["title"].strip():
        raise ValueError("title must be nonempty text")
    questions = quiz.get("questions")
    if not isinstance(questions, list) or not questions:
        raise ValueError("questions must be a nonempty list")
    for number, question in enumerate(questions, 1):
        if not isinstance(question, dict) or not isinstance(question.get("text"), str):
            raise ValueError(f"question {number} needs text")
        answers = question.get("answers")
        if not isinstance(answers, list) or len(answers) != question["text"].count("___") or not answers:
            raise ValueError(f"question {number} needs one answer per ___ blank")
        if any(not isinstance(answer, str) or not answer.strip() for answer in answers):
            raise ValueError(f"question {number} has an empty answer")
        if "note" in question and not isinstance(question["note"], str):
            raise ValueError(f"question {number} note must be text")
    if "instructions" in quiz and not isinstance(quiz["instructions"], str):
        raise ValueError("instructions must be text")
    return quiz


def render(quiz, include_key):
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
    <div class="paper-meta"><div class="paper-instructions">Answers in blank order.</div></div>
    <ol class="story-answers">{"".join(answers)}</ol>
    <div class="paper-foot"><span>{len(questions)} questions</span><span>{title} — answer key</span></div>
  </section>'''
    template = Template((ROOT / "templates/story-worksheet.html").read_text(encoding="utf-8"))
    return template.substitute(title=title, instructions=instructions,
                               questions="".join(questions), answer_key=key, count=len(questions))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("quiz", type=Path, help="JSON file containing title, questions, blanks, and answers")
    parser.add_argument("--no-key", action="store_true", help="omit the answer key")
    parser.add_argument("--print", action="store_true", help="send the PDF to the default printer with lp")
    args = parser.parse_args()

    chromium = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")
    if not chromium:
        parser.error("Chromium or Google Chrome is required to generate a PDF")
    if args.print and not shutil.which("lp"):
        parser.error("lp is required for --print")
    try:
        html = render(load_quiz(args.quiz), not args.no_key)
    except (OSError, ValueError) as error:
        parser.error(str(error))

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
