/**
 * Toast — lightweight notification manager.
 *
 * Usage:
 *   const toast = new Toast("toast");
 *   toast.show("Saved!", "success");
 *   toast.show("Error", "error", 6000);
 *   toast.show("Loading…", "loading", 30000);
 */
class Toast {
  /** @param {string} elementId  id of the toast <div> in the DOM */
  constructor(elementId) {
    this._el = document.getElementById(elementId);
    if (!this._el) throw new Error(`Toast: element #${elementId} not found`);
    this._timer = null;
  }

  /**
   * @param {string} message
   * @param {"success"|"error"|"loading"|"warning"} type
   * @param {number} duration  ms before auto-hide (0 = stay)
   */
  show(message, type = "success", duration = 4000) {
    clearTimeout(this._timer);
    this._el.textContent = message;
    this._el.className = `toast toast--${type} toast--visible`;

    if (duration > 0) {
      this._timer = setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    clearTimeout(this._timer);
    this._el.classList.remove("toast--visible");
  }
}
