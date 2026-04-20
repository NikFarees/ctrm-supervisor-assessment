/**
 * ScoreManager — handles score selection state and weighted-score calculation.
 *
 * All score data lives purely in the DOM (radio inputs), so this class
 * reads/writes only DOM state — no separate in-memory store needed.
 */
class ScoreManager {
  /** @param {object} data  AssessmentData reference */
  constructor(data) {
    this._data = data;
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  /** Build the canonical key used to name radio inputs. */
  static itemKey(sectionId, index) {
    return `${sectionId}-${index}`;
  }

  /** Read the currently selected score (0 if unscored). */
  getScore(itemKey) {
    const radio = document.querySelector(`input[name="${itemKey}"]:checked`);
    return radio ? Number(radio.value) : 0;
  }

  // ── UI mutations ──────────────────────────────────────────────────────────

  /**
   * Highlight the chosen score button and update the caption label.
   * Called both on user click and when restoring saved data.
   */
  selectScore(itemKey, score) {
    [1, 2, 3, 4].forEach((v) => {
      const label = document.getElementById(`label-${itemKey}-${v}`);
      if (!label) return;

      label.classList.toggle("score-option--selected", v === score);
      [1, 2, 3, 4].forEach((c) => label.classList.remove(`score-option--${c}`));
      if (v === score) label.classList.add(`score-option--${v}`);
    });

    const scoreLabel = this._data.scoreLabels[score] ?? "Belum dinilai";

    const caption = document.getElementById(`caption-${itemKey}`);
    if (caption) {
      caption.textContent = scoreLabel;
      caption.className = `score-caption ${score ? `score-caption--${score}` : ""}`;
    }

    // Update the print-only score badge
    const printScore = document.getElementById(`print-score-${itemKey}`);
    if (printScore) printScore.textContent = score ? `${score} — ${scoreLabel}` : "";
  }

  // ── computation ───────────────────────────────────────────────────────────

  /**
   * Calculate the overall weighted score across all sections.
   * A section only contributes if every one of its items has been scored.
   *
   * @returns {{ score: number, completedSections: number, ready: boolean }}
   */
  calculateWeightedScore() {
    const sections = this._data.sections;
    let totalWeighted = 0;
    let completedSections = 0;

    sections.forEach((section) => {
      const sectionScores = section.items
        .map((_, i) => this.getScore(ScoreManager.itemKey(section.id, i)))
        .filter(Boolean);

      if (sectionScores.length === section.items.length) {
        const avg = sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length;
        totalWeighted += (avg / 4) * section.weight;
        completedSections += 1;
      }
    });

    return {
      score: Math.round(totalWeighted * 100) / 100,
      completedSections,
      ready: completedSections === sections.length,
    };
  }

  /**
   * Count how many individual criteria have been scored across all sections.
   */
  countCompletedItems() {
    return this._data.sections.reduce((total, section) => {
      return (
        total +
        section.items.filter((_, i) =>
          this.getScore(ScoreManager.itemKey(section.id, i))
        ).length
      );
    }, 0);
  }
}
