#!/usr/bin/env python3
"""Save a printable worksheet URL as a PDF in printing/."""

import argparse
from hashlib import sha256
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import tempfile
from threading import Thread
from urllib.parse import parse_qs, urlencode, urlsplit


ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "url",
        nargs="?",
        default="worksheet.html",
        help="worksheet.html URL or query string copied from the site",
    )
    parser.add_argument("--print", action="store_true", help="send the PDF to the default printer with lp")
    args = parser.parse_args()

    chromium = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")
    if not chromium:
        parser.error("Chromium or Google Chrome is required to generate a PDF")
    if args.print and not shutil.which("lp"):
        parser.error("lp is required for --print")

    parsed = urlsplit(args.url)
    if parsed.path in ("", "worksheet.html", "/worksheet.html"):
        query = parsed.query if parsed.path else args.url.lstrip("?")
    elif "=" in args.url and "?" not in args.url and "://" not in args.url:
        query = args.url
    else:
        parser.error("provide a worksheet.html URL (or its query string)")
    options = parse_qs(query)
    sheet = options.get("sheet", ["preterite"])[-1]
    doc = options.get("doc", ["worksheet"])[-1]
    if doc not in ("worksheet", "reference"):
        parser.error("doc must be worksheet or reference")
    if doc == "worksheet" and not options.get("seed", [""])[-1]:
        options["seed"] = [secrets.token_hex(3)]
    if not re.fullmatch(r"[a-z0-9-]+", sheet):
        parser.error("sheet must be a valid sheet id")

    query = urlencode(options, doseq=True)
    name = f"{sheet}-{doc}"
    if doc == "worksheet":
        seed_label = re.sub(r"[^a-zA-Z0-9_-]+", "-", options["seed"][-1]).strip("-")[:40]
        name += f"-{seed_label or 'seed'}"
    name += f"-{sha256(query.encode()).hexdigest()[:8]}"
    output = ROOT / "printing" / f"{name}.pdf"

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *handler_args, **kwargs):
            super().__init__(*handler_args, directory=str(ROOT), **kwargs)

        def log_message(self, format, *message):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        url = f"http://127.0.0.1:{server.server_port}/worksheet.html?{query}"
        with tempfile.TemporaryDirectory() as profile:
            browser = [chromium, "--headless", "--disable-gpu", "--virtual-time-budget=5000",
                       f"--user-data-dir={profile}"]
            preview = subprocess.run(browser + ["--dump-dom", url], capture_output=True, text=True, timeout=45)
            if preview.returncode or '<section class="paper">' not in preview.stdout:
                parser.exit(1, "No printable document rendered. Check the sheet id and exercise options.\n")

            output.parent.mkdir(exist_ok=True)
            result = subprocess.run(
                browser + ["--no-pdf-header-footer", f"--print-to-pdf={output}", url],
                capture_output=True, text=True, timeout=45,
            )
        if result.returncode or not output.is_file() or output.stat().st_size == 0:
            output.unlink(missing_ok=True)
            parser.exit(1, f"PDF generation failed: {result.stderr}\n")
    finally:
        server.shutdown()
        server.server_close()
        thread.join()

    print(f"Worksheet URL: worksheet.html?{query}")
    print(f"PDF: {output}")
    if args.print:
        subprocess.run(["lp", str(output)], check=True)


if __name__ == "__main__":
    main()
