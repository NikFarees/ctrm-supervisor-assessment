/**
 * StorageManager — thin wrapper around localStorage.
 *
 * Centralises all persistence logic so switching storage backends
 * (e.g. IndexedDB, sessionStorage) only requires changes here.
 */
class StorageManager {
  /** @param {string} key  default localStorage key */
  constructor(key) {
    this._key = key;
  }

  /**
   * Serialise `data` and write it to localStorage.
   * @param {object} data
   * @returns {boolean} true on success
   */
  save(data) {
    try {
      localStorage.setItem(this._key, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error("StorageManager.save:", err);
      return false;
    }
  }

  /**
   * Read and deserialise the stored draft.
   * @returns {object|null}  null if nothing is stored or JSON is invalid
   */
  load() {
    try {
      const raw = localStorage.getItem(this._key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error("StorageManager.load:", err);
      return null;
    }
  }

  /** Remove the draft from storage. */
  clear() {
    localStorage.removeItem(this._key);
  }

  /** Return true when a draft exists. */
  hasDraft() {
    return localStorage.getItem(this._key) !== null;
  }
}
