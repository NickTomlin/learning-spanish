#!/usr/bin/env python3
"""Validate story quizzes and keep a small local archive for later lookup."""

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import tempfile


ROOT = Path(__file__).resolve().parent
ARCHIVE = ROOT / "printing" / "story-history"
MAX_STORIES = 15
KEY_PATTERN = re.compile(r"^[0-9A-Fa-f]{8}$")
ARCHIVE_METADATA = {"quizKey", "savedAt"}


def validate_quiz(quiz):
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


def _reject_constant(value):
    raise ValueError(f"invalid JSON constant {value}")


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"), parse_constant=_reject_constant)
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid JSON in {path}: {error}") from error


def load_quiz(path):
    return validate_quiz(load_json(Path(path)))


def content_json(quiz):
    content = {name: value for name, value in quiz.items() if name not in ARCHIVE_METADATA}
    return json.dumps(content, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def story_key(quiz):
    digest = hashlib.sha256(content_json(quiz).encode("utf-8")).hexdigest()
    return digest[:8].upper()


def _timestamp(value, path):
    if not isinstance(value, str):
        raise ValueError(f"{path} has no savedAt timestamp")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError(f"{path} has an invalid savedAt timestamp") from error
    if parsed.tzinfo is None:
        raise ValueError(f"{path} has a timezone-free savedAt timestamp")
    return parsed.astimezone(timezone.utc)


def _read_snapshot(path):
    snapshot = validate_quiz(load_json(path))
    key = path.stem.upper()
    if path.stem != key or not KEY_PATTERN.fullmatch(path.stem) or snapshot.get("quizKey") != key:
        raise ValueError(f"invalid story key metadata in {path}")
    if story_key(snapshot) != key:
        raise ValueError(f"story content does not match its key in {path}")
    return snapshot, _timestamp(snapshot.get("savedAt"), path)


def _entries():
    if not ARCHIVE.exists():
        return []
    entries = []
    for path in ARCHIVE.glob("*.json"):
        if not KEY_PATTERN.fullmatch(path.stem):
            continue
        snapshot, saved_at = _read_snapshot(path)
        entries.append((path, snapshot, saved_at))
    return entries


def _write_snapshot(path, snapshot):
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    content = json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n"
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=ARCHIVE, delete=False) as temporary:
        temporary.write(content)
        temporary_path = Path(temporary.name)
    temporary_path.replace(path)


def save_quiz(quiz):
    validate_quiz(quiz)
    key = story_key(quiz)
    # Validate existing entries before changing the archive, so malformed local
    # files cannot cause a partial save or unsafe retention cleanup.
    entries = _entries()
    path = ARCHIVE / f"{key}.json"
    existing = next((entry for entry in entries if entry[0] == path), None)
    if existing:
        if content_json(existing[1]) != content_json(quiz):
            raise ValueError(f"story key collision for {key}; existing content differs")
    else:
        snapshot = {name: value for name, value in quiz.items() if name not in ARCHIVE_METADATA}
        snapshot["quizKey"] = key
        snapshot["savedAt"] = datetime.now(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")
        _write_snapshot(path, snapshot)
        entries.append((path, snapshot, _timestamp(snapshot["savedAt"], path)))

    if len(entries) > MAX_STORIES:
        entries.sort(key=lambda entry: (entry[2], entry[0].stem == key, entry[0].stem))
        for old_path, _, _ in entries[:-MAX_STORIES]:
            old_path.unlink()
    return key


def list_stories():
    entries = _entries()
    return sorted(entries, key=lambda entry: (entry[2], entry[0].stem), reverse=True)


def get_story(key):
    if not isinstance(key, str) or not KEY_PATTERN.fullmatch(key):
        raise ValueError("story key must be exactly eight hexadecimal characters")
    normalized = key.upper()
    path = ARCHIVE / f"{normalized}.json"
    if not path.is_file():
        available = [snapshot["quizKey"] for _, snapshot, _ in list_stories()]
        suffix = "; available keys: " + ", ".join(available) if available else "; no saved story keys"
        raise ValueError(f"unknown story key {normalized}{suffix}")
    return _read_snapshot(path)[0]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    save_parser = commands.add_parser("save", help="validate and archive a quiz JSON file")
    save_parser.add_argument("file", type=Path)
    show_parser = commands.add_parser("show", help="show an archived quiz by key")
    show_parser.add_argument("key")
    commands.add_parser("list", help="list locally archived story quizzes")
    args = parser.parse_args()
    try:
        if args.command == "save":
            print(f"Story key: {save_quiz(load_quiz(args.file))}")
        elif args.command == "show":
            print(json.dumps(get_story(args.key), ensure_ascii=False, indent=2))
        else:
            entries = list_stories()
            if not entries:
                print("No saved story quizzes.")
            for _, snapshot, saved_at in entries:
                print(f"{snapshot['quizKey']}  {saved_at.date().isoformat()}  {snapshot['title']}")
    except (OSError, ValueError) as error:
        parser.exit(1, f"story archive: {error}\n")


if __name__ == "__main__":
    main()
