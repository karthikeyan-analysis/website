import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Megaphone, Save, AlertCircle, CheckCircle } from "lucide-react";
import { offerTickerService } from "../../services/firebaseService";
import Button from "../../components/ui/Button";

export default function AdminOfferBannerPage() {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await offerTickerService.getOfferTicker();
        setEnabled(data.enabled);
        setText(data.messages.join("\n"));
      } catch (e) {
        console.error(e);
        setError("Could not load settings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (enabled && lines.length === 0) {
        setError("Add at least one line of offer text, or turn off “Show banner”.");
        return;
      }
      await offerTickerService.saveOfferTicker({
        enabled,
        messages: lines,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Save failed. Check Firebase rules for siteSettings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-brand-navy" />
            Offer ticker
          </h1>
          <p className="mt-2 text-gray-600">
            Text appears below the site header as a scrolling strip. Put each
            phrase on its own line; they are joined with bullet separators on
            the site.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                <span className="font-semibold text-gray-900">
                  Show offer banner on the website
                </span>
              </label>

              <div>
                <label
                  htmlFor="offer-lines"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Offer messages (one per line)
                </label>
                <textarea
                  id="offer-lines"
                  rows={8}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none ring-brand-navy/20 focus:border-brand-navy focus:ring-2"
                  placeholder={"New batches starting soon — Enroll today!\nFree demo class — Limited seats"}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Empty lines are ignored. Saving with “Show” on and no text will
                  show an error.
                </p>
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <CheckCircle className="h-4 w-4" />
                  Saved. The ticker updates on the live site shortly.
                </div>
              ) : null}

              <Button
                type="button"
                variant="gradient"
                className="px-6"
                disabled={saving}
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
