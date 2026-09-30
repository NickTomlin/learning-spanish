# Working in this repo

See `README.md` for the sheet model, local practice workflows, and how the
pages fit together.

## Local practice

The deployed site remains static. Project-local Pi skills live in `.agents/skills/`.
The site's sheet-based PDFs use `print-worksheet.py`; agent-written story quizzes
use `print-story.py` with JSON like `examples/past-tenses.json`. Keep generated
JSON, HTML, and PDFs in gitignored `printing/`. Only send a PDF to a physical
printer when explicitly asked; both scripts require `--print` for that. The
GitHub repository is public. Netlify publishes only the allowlisted `dist/`
output of `build-site.sh`; never publish the repo root or commit private material.

## Don't over-optimize

This is a static study site with a handful of small data files, served to one
reader. Optimize for how obvious the code is, not for how fast it loads.

If performance ever genuinely matters, add a build step then. Until something
is actually slow, prefer the plain version.

## Work in a feature branch

Stack your work in a branch with a clean name.
