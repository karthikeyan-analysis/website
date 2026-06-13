const STORAGE_KEY = "ka_pending_payment";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function savePendingPayment(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch (_) {}
}

export function getPendingPayment() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (Date.now() - (parsed.savedAt || 0) > MAX_AGE_MS) {
      clearPendingPayment();
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

export function clearPendingPayment() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
}
