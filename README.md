# GALACTUS-Beyond-imagination

React based Astronomy Learning website

no backend was needed for this project, we just added for marks and ofc, covering all the requirements

Languages we'll use

```
Mathematics
C
React
```

Theory we'll use is powered by:

```
Computer Architecture
Software Engineering
```

## Project structure

The interactive behavior is split into small browser modules:

- `script.js` is the module entry point.
- `js/shared.js` contains shared DOM, canvas, animation, and visual constants.
- `js/navigation.js` handles scroll reveals and active navigation.
- `js/hero.js` renders the interactive starfield.
- `js/solar-system.js` powers the orbital map and planet dossiers.
- `js/stellar-lifecycle.js` powers the stellar mass and lifecycle lab.
- `js/cosmic-scale.js` powers the logarithmic distance ruler.
- `js/quiz.js` contains the quiz state and interactions.

The page loads `script.js` as an ES module, so the feature modules can import
only the shared functionality they need.
