/**
 * SupabaseService — handles all communication with the Supabase REST API.
 *
 * Keeping network calls in a dedicated class makes it straightforward to
 * swap the backend, add retries, or mock this in tests.
 */
class SupabaseService {
  /**
   * @param {string} url      Supabase project URL
   * @param {string} anonKey  Supabase anon/public API key
   * @param {string} table    Target table name
   */
  constructor(url, anonKey, table) {
    this._url = url;
    this._anonKey = anonKey;
    this._table = table;
  }

  /**
   * Insert one assessment record.
   *
   * @param {object} payload  Row data matching the `assessments` table schema
   * @returns {Promise<{ ok: boolean, error?: string }>}
   */
  async submitAssessment(payload) {
    try {
      const response = await fetch(`${this._url}/rest/v1/${this._table}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": this._anonKey,
          "Authorization": `Bearer ${this._anonKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 201) {
        return { ok: true };
      }

      let errorMessage = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        errorMessage = err.message || errorMessage;
      } catch (_) {
        // response body was not JSON — keep the HTTP status message
      }

      return { ok: false, error: errorMessage };
    } catch (networkError) {
      console.error("SupabaseService.submitAssessment:", networkError);
      return { ok: false, error: "Ralat sambungan. Semak internet dan cuba semula." };
    }
  }
}
