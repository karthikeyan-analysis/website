import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { achievementsService } from "../../services/firebaseService";

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState({
    count: "",
    title: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const data = await achievementsService.getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.count.trim()) newErrors.count = "Count is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await achievementsService.updateAchievement(editingId, formData);
        const updated = achievements.map((a) =>
          a.id === editingId ? { id: editingId, ...formData } : a,
        );
        setAchievements(updated);
      } else {
        const newAchievement =
          await achievementsService.addAchievement(formData);
        setAchievements([newAchievement, ...achievements]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving achievement:", error);
      setErrors({ submit: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (achievement) => {
    setFormData({
      count: achievement.count,
      title: achievement.title,
    });
    setEditingId(achievement.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this achievement?")) {
      setDeleting(id);
      try {
        await achievementsService.deleteAchievement(id);
        setAchievements(achievements.filter((a) => a.id !== id));
      } catch (error) {
        console.error("Error deleting achievement:", error);
      } finally {
        setDeleting(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({ count: "", title: "" });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
            <p className="text-gray-500 mt-1">
              Manage student achievements and cleared exams
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-maroon transition"
          >
            <Plus className="h-5 w-5" />
            Add Achievement
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Achievement" : "Add New Achievement"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Count/Number *
                  </label>
                  <input
                    type="text"
                    value={formData.count}
                    onChange={(e) =>
                      setFormData({ ...formData, count: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                    placeholder="e.g., 27"
                  />
                  {errors.count && (
                    <p className="text-red-500 text-sm mt-1">{errors.count}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                    placeholder="e.g., TNPSC Combined Statistical Services (2022 - 2023)"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {saving ? "Saving..." : editingId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading achievements...</p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No achievements yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-brand-navy font-semibold hover:underline"
              >
                Add your first achievement
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((achievement) => (
                    <tr
                      key={achievement.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-brand-navy">
                        {achievement.count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {achievement.title}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2 flex justify-center">
                        <button
                          onClick={() => handleEdit(achievement)}
                          disabled={saving}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(achievement.id)}
                          disabled={deleting === achievement.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
