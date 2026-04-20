/**
 * app.js — entry point.
 *
 * Creates the single AssessmentForm instance (`app`) that the HTML
 * templates reference for event callbacks (e.g. `onclick="app.saveDraft()"`).
 */
let app;

document.addEventListener("DOMContentLoaded", () => {
  app = new AssessmentForm();
  app.init();
});
