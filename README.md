# Orbit — field notes on space

A static astronomy learning site built with HTML, CSS, and browser JavaScript modules. It runs directly from Python's local HTTP server and needs no build step.

## Run locally

From this folder, run `python -m http.server 8000`, then open `http://localhost:8000`.

## Structure

- `index.html` — zoomable cosmic map, mission notes, timeline, and field facts.
- `course.html` — four lessons and the interactive understanding check.
- `css/base.css` — shared theme, navigation, and common components.
- `css/home.css`, `css/course.css` — page layouts and responsive styles.
- `js/data.js` — facts and lesson text.
- `js/universe-data.js` — objects and missions for each map scale.
- `js/home.js`, `js/universe.js`, `js/course.js` — page interactions.

Each page loads only the JavaScript modules it needs. All source files are kept below the 150-line project limit.
