import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { testimonialsService } from "../../services/firebaseService";
import Button from "../../components/ui/Button";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  const [formData, setFormData] = useState({
    studentName: "",
    achievement: "",
    exam: "",
    content: "",
    rating: 5,
    image: "",
    videoUrl: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  // Load testimonials
  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testimonialsService.getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error("Error loading testimonials:", err);
      setError("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.studentName.trim())
      newErrors.studentName = "Student name is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (!formData.achievement.trim())
      newErrors.achievement = "Achievement is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      const url = await testimonialsService.uploadFile(
        file,
        "testimonials/images",
      );
      setFormData((prev) => ({ ...prev, image: url }));
      setSuccessMessage("Image uploaded successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file");
      return;
    }

    try {
      setUploadingVideo(true);
      setError(null);
      const url = await testimonialsService.uploadFile(
        file,
        "testimonials/videos",
      );
      setFormData((prev) => ({ ...prev, videoUrl: url }));
      setSuccessMessage("Video uploaded successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error uploading video:", err);
      setError("Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        await testimonialsService.updateTestimonial(editingId, formData);
        setTestimonials(
          testimonials.map((t) =>
            t.id === editingId ? { id: editingId, ...formData } : t,
          ),
        );
        setSuccessMessage("Testimonial updated successfully");
      } else {
        const newTestimonial =
          await testimonialsService.addTestimonial(formData);
        setTestimonials([newTestimonial, ...testimonials]);
        setSuccessMessage("Testimonial added successfully");
      }

      resetForm();
    } catch (err) {
      console.error("Error saving testimonial:", err);
      setError("Failed to save testimonial");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleEdit = (testimonial) => {
    setFormData(testimonial);
    setEditingId(testimonial.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?"))
      return;

    try {
      setDeleting(id);
      setError(null);
      await testimonialsService.deleteTestimonial(id);
      setTestimonials(testimonials.filter((t) => t.id !== id));
      setSuccessMessage("Testimonial deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      setError("Failed to delete testimonial");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      setError(null);
      await testimonialsService.toggleTestimonialActive(id, !isActive);
      setTestimonials(
        testimonials.map((t) =>
          t.id === id ? { ...t, isActive: !isActive } : t,
        ),
      );
      setSuccessMessage(
        !isActive ? "Testimonial activated" : "Testimonial deactivated",
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error toggling testimonial:", err);
      setError("Failed to toggle testimonial");
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: "",
      achievement: "",
      exam: "",
      content: "",
      rating: 5,
      image: "",
      videoUrl: "",
      isActive: true,
    });
    setErrors({});
    setEditingId(null);
    setShowForm(false);
    setPreviewVideo(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy">Testimonials</h1>
            <p className="text-brand-black/60">
              Manage student testimonials with videos and images
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-navy text-white px-4 py-2 text-sm font-medium hover:bg-brand-navy/90 transition"
            >
              <Plus className="h-4 w-4" />
              Add Testimonial
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <div className="h-2 w-2 bg-green-600 rounded-full mt-1.5" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 rounded-lg border border-black/10 bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-brand-navy">
                {editingId ? "Edit Testimonial" : "Add New Testimonial"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Name */}
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      studentName: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  placeholder="Enter student name"
                />
                {errors.studentName && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.studentName}
                  </p>
                )}
              </div>

              {/* Achievement */}
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">
                  Achievement *
                </label>
                <input
                  type="text"
                  value={formData.achievement}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      achievement: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  placeholder="e.g., Rank 1 in Group 1"
                />
                {errors.achievement && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.achievement}
                  </p>
                )}
              </div>

              {/* Exam */}
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">
                  Exam
                </label>
                <input
                  type="text"
                  value={formData.exam}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, exam: e.target.value }))
                  }
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  placeholder="e.g., TNPSC Group 1"
                />
              </div>

              {/* Testimonial Content */}
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">
                  Testimonial Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
                  placeholder="Enter the testimonial content"
                />
                {errors.content && (
                  <p className="text-red-600 text-xs mt-1">{errors.content}</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">
                  Rating (1-5)
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: parseInt(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                >
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r} Stars
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-2">
                  Student Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-black/10 py-6 px-3 hover:border-brand-navy cursor-pointer transition">
                      <Upload className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                      </span>
                    </div>
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: "" }))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-2">
                  Testimonial Video
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-black/10 py-6 px-3 hover:border-brand-navy cursor-pointer transition">
                      <Upload className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {uploadingVideo ? "Uploading..." : "Upload Video"}
                      </span>
                    </div>
                  </label>
                </div>
                {formData.videoUrl && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      Video uploaded
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, videoUrl: "" }))
                      }
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove video
                    </button>
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label className="text-sm text-brand-navy">
                  Make this testimonial active
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-brand-navy text-white px-4 py-2 text-sm font-medium hover:bg-brand-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Save className="h-4 w-4" />
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Testimonial"
                      : "Add Testimonial"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Add New Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex items-center gap-2 rounded-lg bg-brand-navy text-white px-4 py-2 text-sm font-medium hover:bg-brand-navy/90 transition"
          >
            <Plus className="h-4 w-4" />
            Add New Testimonial
          </button>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-lg border border-black/10 bg-white p-8 text-center">
            <p className="text-gray-500">
              No testimonials yet. Add one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex items-start gap-4 rounded-lg border border-black/10 bg-white p-4"
              >
                {/* Image Preview */}
                {testimonial.image && (
                  <img
                    src={testimonial.image}
                    alt={testimonial.studentName}
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy">
                    {testimonial.studentName}
                  </p>
                  <p className="text-xs text-brand-orange font-semibold">
                    {testimonial.achievement}
                  </p>
                  {testimonial.exam && (
                    <p className="text-sm text-gray-600 mt-1">
                      {testimonial.exam}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {testimonial.videoUrl && (
                      <span className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-1 rounded">
                        Has Video
                      </span>
                    )}
                    {testimonial.rating && (
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-3 w-3 rounded-full ${
                              i < testimonial.rating
                                ? "bg-brand-orange"
                                : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      handleToggleActive(testimonial.id, testimonial.isActive)
                    }
                    className={`p-2 rounded-lg transition ${
                      testimonial.isActive
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={testimonial.isActive ? "Deactivate" : "Activate"}
                  >
                    {testimonial.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={deleting === testimonial.id}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 disabled:opacity-50 transition"
                  >
                    <Trash2 className="h-4 w-4" />
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
