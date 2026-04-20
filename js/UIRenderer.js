/**
 * UIRenderer — builds and inserts all dynamic HTML fragments.
 */
class UIRenderer {
  constructor(data, scoreManager) {
    this._data  = data;
    this._score = scoreManager;
  }

  // ── Public render methods ─────────────────────────────────────────────────

  renderSections() {
    const container = document.getElementById("sectionsContainer");
    if (!container) return;
    container.innerHTML = this._data.sections.map((s) => this._sectionHTML(s)).join("");
  }

  /** Render evidence checklist checkboxes into #evidenceChecklist. */
  renderChecklist() {
    const container = document.getElementById("evidenceChecklist");
    if (!container) return;
    container.innerHTML = this._data.evidenceChecklist
      .map(
        (label, i) => `
        <label class="checklist__item">
          <input type="checkbox" id="check-${i}" class="checklist__checkbox" />
          <span>${label}</span>
        </label>`
      )
      .join("");
  }

  renderRecommendations() {
    const container = document.getElementById("recommendationList");
    if (!container) return;
    container.innerHTML = this._data.recommendations
      .map(
        (item, i) => `
        <label class="radio-list__item" id="recommendation-label-${i}">
          <input type="radio" name="recommendation" value="${item}" />
          <span class="radio-list__dot"></span>
          <span>${item}</span>
        </label>`
      )
      .join("");
  }

  updateSummary({ completed, total, weighted, candidateName, department }) {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    this._setText("completedScores", completed);
    this._setText("summaryCompleted", completed);
    this._setText("summaryCandidate", candidateName || "-");
    this._setText("summaryDepartment", department || "-");

    const scoreText = weighted.ready ? `${weighted.score}%` : "Pending";
    this._setText("weightedScoreHero", scoreText);
    this._setText("summaryWeighted", scoreText);

    const summaryWeightedEl = document.getElementById("summaryWeighted");
    if (summaryWeightedEl) {
      summaryWeightedEl.className =
        "kpi__value" +
        (weighted.ready
          ? weighted.score >= 75 ? " kpi__value--high"
          : weighted.score >= 50 ? " kpi__value--mid"
          : " kpi__value--low"
          : "");
    }

    const bar = document.getElementById("progressBar");
    if (bar) bar.style.width = `${pct}%`;

    const pctLabel = document.getElementById("progressPct");
    if (pctLabel) pctLabel.textContent = `${pct}%`;

    const note = document.getElementById("completionNote");
    if (note) note.style.display = weighted.ready ? "none" : "block";
  }

  selectRecommendation(index) {
    this._data.recommendations.forEach((_, i) => {
      const el = document.getElementById(`recommendation-label-${i}`);
      if (el) el.classList.toggle("radio-list__item--selected", i === index);
    });
  }

  // ── Private template helpers ──────────────────────────────────────────────

  _sectionHTML(section) {
    return `
      <section class="card section-card" aria-label="${section.title}">
        <div class="section-header">
          <div class="section-header__left">
            <span class="section-icon">${section.icon}</span>
            <div>
              <h2 class="section-header__title">${section.title}</h2>
              <p class="muted">Focus: ${section.focus}</p>
            </div>
          </div>
          <div class="badge badge--weight">Pemberat: ${section.weight}%</div>
        </div>
        <div class="table-wrapper">
          <table class="criteria-table">
            <thead>
              <tr>
                <th class="col-no">#</th>
                <th>Kriteria Penilaian</th>
                <th class="col-score">Skor</th>
                <th class="col-comment">Komen &amp; Catatan Penyelia</th>
              </tr>
            </thead>
            <tbody>
              ${section.items.map((item, index) => this._rowHTML(section.id, item, index)).join("")}
            </tbody>
          </table>
        </div>
      </section>`;
  }

  _rowHTML(sectionId, item, index) {
    const itemKey = ScoreManager.itemKey(sectionId, index);
    return `
      <tr class="criteria-table__row">
        <td class="col-no"><span class="row-no">${item[0]}</span></td>
        <td><strong>${item[1]}</strong></td>
        <td class="col-score">
          <div class="score-options" role="radiogroup">
            ${[1, 2, 3, 4].map((score) => `
              <label class="score-option score-option--${score}" id="label-${itemKey}-${score}" title="${this._data.scoreLabels[score]}">
                <input type="radio" name="${itemKey}" value="${score}"
                  onchange="app.onScoreChange('${itemKey}', ${score})" />
                <span class="score-option__num">${score}</span>
              </label>`).join("")}
          </div>
          <div class="score-caption" id="caption-${itemKey}">Belum dinilai</div>
          <div class="score-print" id="print-score-${itemKey}"></div>
        </td>
        <td class="col-comment">
          <textarea class="criteria-comment" id="comment-${itemKey}"
            placeholder="Komen ringkas penyelia (tidak wajib)"
            oninput="app.onFieldChange()"></textarea>
        </td>
      </tr>`;
  }

  _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}
