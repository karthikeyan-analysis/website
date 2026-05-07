import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Edit2, Trash2, X, Save, AlertCircle } from "lucide-react";
import { categoriesService } from "../../services/firebaseService";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [errors, setErrors] = useState({});

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
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
    setError(null);

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
      };

      if (editingId) {
        // Update existing category
        await categoriesService.updateCategory(editingId, categoryData);
        const updated = categories.map((c) =>
          c.id === editingId ? { id: editingId, ...categoryData } : c,
        );
        setCategories(updated);
        setSuccessMessage("Category updated successfully!");
      } else {
        // Add new category
        const newCategory = await categoriesService.addCategory(categoryData);
        setCategories([...categories, newCategory]);
        setSuccessMessage("Category added successfully!");
      }

      // Reset form
      setFormData({ name: "", description: "", image: "" });
      setErrors({});
      setEditingId(null);
      setShowForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setEditingId(category.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setDeleting(id);
    setError(null);

    try {
      await categoriesService.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      setSuccessMessage("Category deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err.message || "Failed to delete category");
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", image: "" });
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy">Categories</h1>
            <p className="text-brand-black/60">Manage product categories</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-white transition hover:bg-brand-navy/90"
            >
              <Plus className="h-5 w-5" />
              Add Category
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            <AlertCircle className="h-5 w-5" />
            {successMessage}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-brand-navy">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-black/80">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`mt-1 w-full rounded-lg border ${
                    errors.name ? "border-red-500" : "border-black/10"
                  } px-4 py-2 transition focus:border-brand-navy focus:outline-none`}
                  placeholder="e.g., PYQ Banks"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-black/80">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-black/10 px-4 py-2 transition focus:border-brand-navy focus:outline-none"
                  placeholder="Category description"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-black/80">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-black/10 px-4 py-2 transition focus:border-brand-navy focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-brand-navy px-6 py-2 text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Category"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-lg border border-black/10 px-6 py-2 transition hover:bg-black/5"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-brand-black/60">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
            <p className="text-brand-black/60">
              No categories yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-black/10 bg-white p-6 transition hover:shadow-soft"
              >
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="mb-4 h-32 w-full rounded-lg object-cover"
                  />
                )}

                <h3 className="text-lg font-semibold text-brand-navy">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="mt-2 text-sm text-brand-black/60">
                    {category.description}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-navy text-brand-navy transition hover:bg-brand-navy/10 py-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 text-red-600 transition hover:bg-red-50 py-2 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting === category.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
