# GALACTUS — Astronomy Field Guide

A compact astronomy learning site made with plain HTML, CSS, JavaScript modules, and local image assets. It uses no framework or build step.

## Run locally

From this folder, run `python -m http.server 8000`, then open `http://localhost:8000`.

## Project structure

- `index.html` — overview, four-scale cosmic atlas, selectable worlds and missions, timeline, and field notes.
- `course.html` — six astronomy modules (28 lessons) with a live course index, saved progress, per-lesson deep dives, glossary terms, 30-second checks, per-module checks, and a final understanding check.
- `games.html` — the arcade: six playable missions with XP, field ranks, and saved best scores.
- `css/` — shared design system, page styles, transitions, and arcade styles. Course and arcade styles are split into ordered parts to keep each file under 150 lines.
- `js/course-data.js` — curated lesson notes: 28 lessons in six modules, each with a key idea, deep dive, glossary terms, a hands-on activity and a 30-second quick check, plus three-question module checks.
- `js/universe-data.js` — map objects and missions at four scales.
- `js/course*.js` — modular course state, navigation, lessons, quizzes, controls, and field checks. `js/data.js`, `js/home.js`, and `js/universe.js` provide field facts, home interactions, and map drawing.
- `js/arcade.js` and `js/arcade-ui.js` — arcade state, ranks, signals, mission cards, and stage switching.
- `js/games/` — one module per mission: `galaxy.js`, `blackhole.js`, `telescope.js`, `messier.js`, `distance.js`, `timeline.js`, plus shared `game-data.js`.
- `assets/` — Galactus marks and astronomy visuals from the static build.

Course XP economy: +10 XP per lesson marked as read, +2 XP per first-correct 30-second check, +5 XP per module-check answer (first pass only) — 426 XP on offer, banked in the same store as the arcade (`galactus-arcade-v1`). Progress lives in `galactus-course-v1`.
