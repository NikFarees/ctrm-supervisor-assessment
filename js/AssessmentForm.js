/**
 * AssessmentForm — central controller for the assessment application.
 */
class AssessmentForm {
  constructor() {
    this._data     = AssessmentData;
    this._score    = new ScoreManager(this._data);
    this._renderer = new UIRenderer(this._data, this._score);
    this._storage  = new StorageManager(Config.DRAFT_STORAGE_KEY);
    this._db       = new SupabaseService(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY, Config.SUPABASE_TABLE);
    this._toast    = new Toast("toast");
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  init() {
    const totalEl = document.getElementById("totalItems");
    if (totalEl) totalEl.textContent = this._data.totalItems;

    this._renderer.renderSections();
    this._renderer.renderRecommendations();

    document.querySelectorAll('input[name="recommendation"]').forEach((radio, i) => {
      radio.addEventListener("change", () => this._renderer.selectRecommendation(i));
    });

    ["candidateName", "employeeNo", "department", "supervisorName", "assessmentDate", "remarks"]
      .forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => this.onFieldChange());
      });

    this._refreshSummary();
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  onScoreChange(itemKey, score) {
    this._score.selectScore(itemKey, score);
    this._refreshSummary();
  }

  onFieldChange() {
    this._refreshSummary();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  saveDraft() {
    const ok = this._storage.save(this._collectData());
    this._toast.show(
      ok ? "✅ Draft berjaya disimpan dalam browser ini." : "❌ Gagal menyimpan draft.",
      ok ? "success" : "error"
    );
  }

  loadDraft() {
    const data = this._storage.load();
    if (!data) {
      this._toast.show("ℹ️ Tiada draft dijumpai dalam browser ini.", "warning", 4000);
      return;
    }
    this._applyData(data);
    this._toast.show("📂 Draft berjaya dimuatkan.", "success");
  }

  clearForm() {
    if (!confirm("Padam semua maklumat dalam borang ini?")) return;
    this._storage.clear();
    window.location.reload();
  }

  async submitToDatabase() {
    if (!this._validateBeforeSubmit()) return;

    this._toast.show("⏳ Menghantar data ke pangkalan data...", "loading", 30000);

    const data     = this._collectData();
    const weighted = this._score.calculateWeightedScore();
    const payload  = this._buildFlatPayload(data, weighted.score);

    const result = await this._db.submitAssessment(payload);

    if (result.ok) {
      this._toast.show("✅ Borang berjaya dihantar ke pangkalan data!", "success", 6000);
      this._storage.clear();
    } else {
      this._toast.show(`❌ Ralat: ${result.error}`, "error", 6000);
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  _refreshSummary() {
    const completed = this._score.countCompletedItems();
    const weighted  = this._score.calculateWeightedScore();
    this._renderer.updateSummary({
      completed,
      total:         this._data.totalItems,
      weighted,
      candidateName: document.getElementById("candidateName")?.value ?? "",
      department:    document.getElementById("department")?.value ?? "",
    });
  }

  /** Collect all form values into a plain object (for draft save/load). */
  _collectData() {
    const scores   = {};
    const comments = {};

    this._data.sections.forEach((section) => {
      section.items.forEach((_, i) => {
        const k      = ScoreManager.itemKey(section.id, i);
        scores[k]    = this._score.getScore(k);
        const el     = document.getElementById(`comment-${k}`);
        comments[k]  = el ? el.value : "";
      });
    });

    const selectedRec = document.querySelector('input[name="recommendation"]:checked');

    return {
      candidateName:  document.getElementById("candidateName")?.value  ?? "",
      employeeNo:     document.getElementById("employeeNo")?.value      ?? "",
      department:     document.getElementById("department")?.value      ?? "",
      supervisorName: document.getElementById("supervisorName")?.value  ?? "",
      assessmentDate: document.getElementById("assessmentDate")?.value  ?? "",
      scores,
      comments,
      recommendation: selectedRec ? selectedRec.value : "",
      remarks:        document.getElementById("remarks")?.value         ?? "",
    };
  }

  /**
   * Build the flat Supabase payload.
   * Every score and comment gets its own column — no JSON blobs.
   */
  _buildFlatPayload(data, weightedScore) {
    const payload = {
      candidate_name:  data.candidateName,
      employee_no:     data.employeeNo,
      department:      data.department,
      supervisor_name: data.supervisorName,
      assessment_date: data.assessmentDate,
      weighted_score:  weightedScore,
      recommendation:  data.recommendation,
      remarks:         data.remarks || null,
    };

    this._data.sections.forEach((section) => {
      section.items.forEach((item, i) => {
        const domKey = ScoreManager.itemKey(section.id, i);
        const colKey = item[3];
        payload[`${colKey}_score`]   = data.scores[domKey]   || null;
        payload[`${colKey}_comment`] = data.comments[domKey] || null;
      });
    });

    return payload;
  }

  /** Restore a previously saved draft into the form. */
  _applyData(data) {
    if (!data) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val ?? "";
    };

    setVal("candidateName",  data.candidateName);
    setVal("employeeNo",     data.employeeNo);
    setVal("department",     data.department);
    setVal("supervisorName", data.supervisorName);
    setVal("assessmentDate", data.assessmentDate);
    setVal("remarks",        data.remarks);

    if (data.scores) {
      Object.entries(data.scores).forEach(([itemKey, score]) => {
        if (!score) return;
        const radio = document.querySelector(`input[name="${itemKey}"][value="${score}"]`);
        if (radio) {
          radio.checked = true;
          this._score.selectScore(itemKey, Number(score));
        }
      });
    }

    if (data.comments) {
      Object.entries(data.comments).forEach(([itemKey, comment]) => {
        const el = document.getElementById(`comment-${itemKey}`);
        if (el) el.value = comment ?? "";
      });
    }

    if (data.recommendation) {
      document.querySelectorAll('input[name="recommendation"]').forEach((radio, i) => {
        if (radio.value === data.recommendation) {
          radio.checked = true;
          this._renderer.selectRecommendation(i);
        }
      });
    }

    this._refreshSummary();
  }

  _validateBeforeSubmit() {
    const fields = ["candidateName", "employeeNo", "department", "supervisorName", "assessmentDate"];
    if (fields.some((id) => !document.getElementById(id)?.value.trim())) {
      this._toast.show("⚠️ Sila lengkapkan semua maklumat calon sebelum menghantar.", "error", 5000);
      return false;
    }

    if (!this._score.calculateWeightedScore().ready) {
      this._toast.show("⚠️ Sila lengkapkan semua skor penilaian (Section 1, 2 & 3) sebelum menghantar.", "error", 5000);
      return false;
    }

    if (!document.querySelector('input[name="recommendation"]:checked')) {
      this._toast.show("⚠️ Sila pilih Rekomendasi sebelum menghantar.", "error", 5000);
      return false;
    }

    return true;
  }
}
