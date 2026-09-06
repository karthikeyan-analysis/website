import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import {
  ongoingBatchesService,
  DEFAULT_ONGOING_BATCHES,
} from "../../services/firebaseService";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Edit / Add Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    commencementDate: "",
    courseName: "",
    brochureUrl: "",
    status: "Open",
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = ongoingBatchesService.subscribeOngoingBatches((data) => {
      setBatches(data);
      setLoading(false);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const persistBatches = async (
    updatedBatches,
    successMsg = "Ongoing Batches table updated and published to the website successfully!",
  ) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await ongoingBatchesService.saveOngoingBatches(updatedBatches);
      setBatches(updatedBatches);
      setSuccess(successMsg);
      setTimeout(() => setSuccess(false), 5000);
      return true;
    } catch (e) {
      console.error("Failed to save ongoing batches:", e);
      setError(e?.message || "Failed to save batches to website. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      commencementDate: "",
      courseName: "",
      brochureUrl: "",
      status: "Open",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    setFormData({ ...batches[index] });
    setModalOpen(true);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    if (!formData.courseName.trim() || !formData.commencementDate.trim()) {
      alert("Please enter both Course Name and Commencement Date.");
      return;
    }

    let updated;
    let msg;
    if (editingIndex !== null) {
      updated = [...batches];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ...formData,
      };
      msg = `Updated "${formData.courseName}" and published to website!`;
    } else {
      const newBatch = {
        id: `batch_${Date.now()}`,
        ...formData,
      };
      updated = [...batches, newBatch];
      msg = `Added "${formData.courseName}" and published to website!`;
    }

    const ok = await persistBatches(updated, msg);
    if (ok) {
      setModalOpen(false);
    }
  };

  const handleDelete = async (index) => {
    const target = batches[index];
    if (!confirm(`Are you sure you want to delete "${target?.courseName || 'this batch'}"? It will be removed from the live website immediately.`)) return;
    const updated = batches.filter((_, i) => i !== index);
    await persistBatches(updated, "Batch deleted from website successfully!");
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const updated = [...batches];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    await persistBatches(updated, "Batch order updated on website!");
  };

  const handleMoveDown = async (index) => {
    if (index === batches.length - 1) return;
    const updated = [...batches];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    await persistBatches(updated, "Batch order updated on website!");
  };

  const handleResetDefault = async () => {
    if (
      !confirm(
        "Reset all batches to the default 4 courses? Any custom batches will be replaced on the live website.",
      )
    ) {
      return;
    }
    const defaults = ongoingBatchesService.getDefaultBatches();
    await persistBatches(defaults, "Batches reset to default 4 courses on website!");
  };

  const handleSaveToCloud = async () => {
    await persistBatches(batches, "Ongoing Batches table updated and published to the website successfully!");
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-brand-navy" />
              Our Ongoing Batches
            </h1>
            <p className="mt-1.5 text-gray-600 text-sm">
              Manage the course schedule and ongoing batches table displayed on the public website (/batches).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefault}
              className="text-xs"
              title="Reset table to default 4 courses"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Default
            </Button>
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="bg-brand-navy hover:bg-brand-blue text-white text-xs font-semibold"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Batch
            </Button>
            <Button
              onClick={handleSaveToCloud}
              disabled={saving}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-xs"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800 text-sm">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3 text-green-800 text-sm font-semibold shadow-xs">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p>Ongoing Batches table updated and published to the website successfully!</p>
          </div>
        )}

        {/* Table Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">
              Live Website Table Preview ({batches.length} Batches)
            </p>
            <a
              href="/batches"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-blue hover:text-brand-navy font-semibold flex items-center gap-1"
            >
              View Public Page <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              No batches currently in the table. Click "Add New Batch" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-navy text-white text-xs">
                  <tr>
                    <th className="px-4 py-3.5 font-bold w-12 text-center">#</th>
                    <th className="px-6 py-3.5 font-bold">Commencement Date</th>
                    <th className="px-6 py-3.5 font-bold">Course Name</th>
                    <th className="px-6 py-3.5 font-bold">Course Brochure Link</th>
                    <th className="px-6 py-3.5 font-bold">Admission Status</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map((batch, index) => (
                    <tr key={batch.id || index} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-4 text-center font-mono text-gray-400 text-xs">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {batch.commencementDate}
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-navy">
                        {batch.courseName}
                      </td>
                      <td className="px-6 py-4">
                        {batch.brochureUrl ? (
                          <a
                            href={batch.brochureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-brand-blue underline underline-offset-4 hover:text-brand-navy inline-flex items-center gap-1 text-xs"
                          >
                            Click Here <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={batch.status === "Open" ? "success" : "danger"}>
                          {batch.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-100"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === batches.length - 1}
                            title="Move Down"
                            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-100"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(index)}
                            title="Edit Batch"
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            title="Delete Batch"
                            className="p-1.5 rounded text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Batch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingIndex !== null ? "Edit Batch Details" : "Add New Course Batch"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Commencement Date *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01.May.2026 or 26.January.2026"
                  value={formData.commencementDate}
                  onChange={(e) =>
                    setFormData({ ...formData, commencementDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAT WIN-26 (Crash Course)"
                  value={formData.courseName}
                  onChange={(e) =>
                    setFormData({ ...formData, courseName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Course Brochure Link (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or https://..."
                  value={formData.brochureUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, brochureUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Link to PDF brochure (Google Drive, Cloud storage, or website asset).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Admission Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                >
                  <option value="Open">Open (Accepting Admissions)</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="bg-brand-navy hover:bg-brand-blue text-white font-bold inline-flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving
                    ? "Saving to website..."
                    : editingIndex !== null
                    ? "Update & Publish"
                    : "Add & Publish"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
