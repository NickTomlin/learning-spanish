#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
rm -rf -- dist
mkdir dist
cp -- ./*.html quiz-config.js dist/
mkdir dist/css
cp -- css/theme.css css/study.css css/keyboard.css css/worksheet.css dist/css/
cp -R -- lib sheets dist/
