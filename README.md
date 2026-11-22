# GALACTUS — Astronomy Field Guide

A compact astronomy learning site made with plain HTML, CSS, JavaScript modules, and local image assets. It uses no framework or build step.

## Run locally

From this folder, run `python -m http.server 8000`, then open `http://localhost:8000`.

## Project structure

- `index.html` — overview, four-scale cosmic atlas, selectable worlds and missions, timeline, and field notes.
- `course.html` — six astronomy modules and an interactive understanding check.
- `css/base.css`, `css/home.css`, `css/course.css`, `css/motion.css` — shared design system, viewport layouts, and transitions.
- `js/course-data.js` — curated lesson notes adapted from the Downloads workspace.
- `js/universe-data.js` — map objects and missions at four scales.
- `js/data.js`, `js/home.js`, `js/universe.js`, `js/course.js` — field facts, timeline, map drawing, and learning activities.
- `assets/` — Galactus marks and astronomy visuals from the static build.

Every HTML, CSS, and JavaScript source file stays below 150 lines. The content is adapted from `Downloads/workspace-38ffb681-74d8-4709-b6ed-7a3bac4575c4/download/galactus-static` and trimmed to the college-project scope.
