# GALACTUS — Astronomy Field Guide

A compact astronomy learning site made with plain HTML, CSS, JavaScript modules, and local image assets. It uses no framework or build step.

## Run locally

From this folder, run `python -m http.server 8000`, then open `http://localhost:8000`.

## Project structure

- `index.html` — overview, four-scale cosmic atlas, selectable worlds and missions, timeline, and field notes.
- `course.html` — six astronomy modules (28 lessons) with a live course index, saved progress, per-lesson deep dives, glossary terms, 30-second checks, per-module checks, and a final understanding check.
- `games.html` — the arcade: six playable missions with XP, field ranks, and saved best scores.
- `css/base.css`, `css/home.css`, `css/course.css`, `css/motion.css`, `css/games.css` — shared design system, viewport layouts, transitions, and arcade styles.
- `js/course-data.js` — curated lesson notes: 28 lessons in six modules, each with a key idea, deep dive, glossary terms, a hands-on activity and a 30-second quick check, plus three-question module checks.
- `js/universe-data.js` — map objects and missions at four scales.
- `js/data.js`, `js/home.js`, `js/universe.js`, `js/course.js` — field facts, timeline, map drawing, and the lesson engine: hero stats, live course index, lesson stepper with arrow-key navigation, saved progress (localStorage), quick checks (+2 XP), module checks with bonus XP, and learning activities.
- `js/arcade.js` — arcade hub: XP store (localStorage), ranks, signals, mission cards, and stage switching.
- `js/games/` — one module per mission: `galaxy.js`, `blackhole.js`, `telescope.js`, `messier.js`, `distance.js`, `timeline.js`, plus shared `game-data.js`.
- `assets/` — Galactus marks and astronomy visuals from the static build.

Course XP economy: +10 XP per lesson marked as read, +2 XP per first-correct 30-second check, +5 XP per module-check answer (first pass only) — 426 XP on offer, banked in the same store as the arcade (`galactus-arcade-v1`). Progress lives in `galactus-course-v1`.
