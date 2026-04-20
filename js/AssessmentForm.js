/**
 * AssessmentForm — the central controller / facade for the entire application.
 *
 * Responsibilities:
 *   • Initialise all collaborators (renderer, score manager, storage, service)
 *   • Wire up DOM event listeners
 *   • Orchestrate data flow between the UI, storage, and the remote API
 *
 * Public methods are intentionally minimal — the HTML templates call only
 * `app.onScoreChange()` and `app.onFieldChange()` so the global surface is small.
 */
class AssessmentForm {
  constructor() {
    this._data    = AssessmentData;
    this._score   = new ScoreManager(this._data);
    this._renderer = new UIRenderer(this._data, this._score);
    this._storage = new StorageManager(Config.DRAFT_STORAGE_KEY);
    this._db      = new SupabaseService(
      Config.SUPABASE_URL,
      Config.SUPABASE_ANON_KEY,
      Config.SUPABASE_TABLE
    );
    this._toast   = new Toast("toast");
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  init() {
    // Set static totals
    const totalEl = document.getElementById("totalItems");
    if (totalEl) totalEl.textContent = this._data.totalItems;

    // Render dynamic sections
    this._renderer.renderSections();
    this._renderer.renderChecklist();
    this._renderer.renderRecommendations();

    // Attach recommendation radio change handlers
    document.querySelectorAll('input[name="recommendation"]').forEach((radio, i) => {
      radio.addEventListener("change", () => this._renderer.selectRecommendation(i));
    });

    // Attach info-field change handlers
    ["candidateName", "employeeNo", "department", "supervisorName", "assessmentDate", "remarks"]
      .forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => this.onFieldChange());
      });

    this._refreshSummary();
  }

  // ── Event handlers (called from HTML and internal) ────────────────────────

  /** Called when any score radio changes. */
  onScoreChange(itemKey, score) {
    this._score.selectScore(itemKey, score);
    this._refreshSummary();
  }

  /** Called when any text/date field changes. */
  onFieldChange() {
    this._refreshSummary();
  }

  // ── Actions (called from button onclick attributes) ───────────────────────

  saveDraft() {
    const ok = this._storage.save(this._collectData());
    if (ok) {
      this._toast.show("✅ Draft berjaya disimpan dalam browser ini.", "success");
    } else {
      this._toast.show("❌ Gagal menyimpan draft.", "error");
    }
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

  /** Gather all form values into a plain serialisable object (used for draft save/load). */
  _collectData() {
    const scores   = {};
    const comments = {};

    this._data.sections.forEach((section) => {
      section.items.forEach((_, i) => {
        const k = ScoreManager.itemKey(section.id, i);
        scores[k]   = this._score.getScore(k);
        const el    = document.getElementById(`comment-${k}`);
        comments[k] = el ? el.value : "";
      });
    });

    const evidenceChecklist = {};
    this._data.evidenceChecklist.forEach(([, colKey], i) => {
      const el = document.getElementById(`check-${i}`);
      evidenceChecklist[colKey] = el ? el.checked : false;
    });

    const selectedRec = document.querySelector('input[name="recommendation"]:checked');

    return {
      candidateName:    document.getElementById("candidateName")?.value ?? "",
      employeeNo:       document.getElementById("employeeNo")?.value ?? "",
      department:       document.getElementById("department")?.value ?? "",
      supervisorName:   document.getElementById("supervisorName")?.value ?? "",
      assessmentDate:   document.getElementById("assessmentDate")?.value ?? "",
      scores,
      comments,
      evidenceChecklist,
      recommendation:   selectedRec ? selectedRec.value : "",
      remarks:          document.getElementById("remarks")?.value ?? "",
    };
  }

  /**
   * Build a flat database payload — one proper column per score, comment,
   * and evidence checkbox instead of JSON blobs.
   * Column names match the Supabase table definition exactly.
   */
  _buildFlatPayload(data, weightedScore) {
    const payload = {
      // ── Candidate info ──────────────────────────────────────
      candidate_name:   data.candidateName,
      employee_no:      data.employeeNo,
      department:       data.department,
      supervisor_name:  data.supervisorName,
      assessment_date:  data.assessmentDate,

      // ── Result ──────────────────────────────────────────────
      weighted_score: weightedScore,
      recommendation: data.recommendation,
      remarks:        data.remarks,
    };

    // ── Score + comment columns (one pair per criteria) ───────
    this._data.sections.forEach((section) => {
      section.items.forEach((item, i) => {
        const domKey   = ScoreManager.itemKey(section.id, i);
        const colKey   = item[3]; // e.g. "f01_adaptasi_tugasan"
        payload[`${colKey}_score`]   = data.scores[domKey]   || null;
        payload[`${colKey}_comment`] = data.comments[domKey] || null;
      });
    });

    // ── Evidence checklist columns ────────────────────────────
    this._data.evidenceChecklist.forEach(([, colKey]) => {
      payload[colKey] = data.evidenceChecklist[colKey] ?? false;
    });

    return payload;
  }

  /** Populate the form from a previously saved data object. */
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

    if (data.evidenceChecklist) {
      this._data.evidenceChecklist.forEach(([, colKey], i) => {
        const el = document.getElementById(`check-${i}`);
        if (el) el.checked = Boolean(data.evidenceChecklist[colKey]);
      });
    }

    if (data.recommendation) {
      const radios = document.querySelectorAll('input[name="recommendation"]');
      radios.forEach((radio, i) => {
        if (radio.value === data.recommendation) {
          radio.checked = true;
          this._renderer.selectRecommendation(i);
        }
      });
    }

    this._refreshSummary();
  }

  /** Returns false and shows a toast when validation fails, true when all passes. */
  _validateBeforeSubmit() {
    const fields = ["candidateName", "employeeNo", "department", "supervisorName", "assessmentDate"];
    const missing = fields.some((id) => !document.getElementById(id)?.value.trim());
    if (missing) {
      this._toast.show("⚠️ Sila lengkapkan semua maklumat calon sebelum menghantar.", "error", 5000);
      return false;
    }

    const weighted = this._score.calculateWeightedScore();
    if (!weighted.ready) {
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
