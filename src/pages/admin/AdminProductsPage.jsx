import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  productsService,
  categoriesService,
} from "../../services/firebaseService";

function newGalleryRowId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function orderedImageUrlsFromProduct(product) {
  const urls = [];
  const seen = new Set();
  if (Array.isArray(product?.images)) {
    for (const u of product.images) {
      const s = String(u || "").trim();
      if (s && !seen.has(s)) {
        seen.add(s);
        urls.push(s);
      }
    }
  }
  const single = String(product?.image || "").trim();
  if (single && !seen.has(single)) {
    urls.push(single);
  }
  return urls;
}

function imageGalleryOrderLabel(index) {
  switch (index) {
    case 0:
      return "First";
    case 1:
      return "Second";
    case 2:
      return "Third";
    default:
      return `${index + 1}`;
  }
}

function revokeGalleryBlobs(rows) {
  rows.forEach((row) => {
    if (typeof row?.preview === "string" && row.preview.startsWith("blob:")) {
      URL.revokeObjectURL(row.preview);
    }
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
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
    mrpPrice: "",
    price: "",
    categoryId: "",
    category: "",
    description: "",
    image: "",
    stock: "",
  });
  const [galleryRows, setGalleryRows] = useState([]);
  const [errors, setErrors] = useState({});
  const galleryRowsRef = useRef(galleryRows);
  galleryRowsRef.current = galleryRows;

  // Load products and categories
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      revokeGalleryBlobs(galleryRowsRef.current);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        productsService.getProducts(),
        categoriesService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid selling price is required";
    if (formData.mrpPrice !== "" && Number(formData.mrpPrice) > 0) {
      const mrp = Number(formData.mrpPrice);
      if (!Number.isFinite(mrp) || mrp <= 0) {
        newErrors.mrpPrice = "Valid MRP is required";
      } else if (Number(formData.price) > 0 && mrp < Number(formData.price)) {
        newErrors.mrpPrice = "MRP must be >= selling price";
      }
    }
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.stock || formData.stock < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
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
      const selectedCategory = categories.find(
        (c) => c.id === formData.categoryId,
      );

      const finalImages = (
        await Promise.all(
          galleryRows.map((row) =>
            row.file
              ? productsService.uploadProductImage(row.file)
              : Promise.resolve(row.preview),
          ),
        )
      )
        .map((url) => String(url || "").trim())
        .filter(Boolean);

      const productData = {
        name: formData.name.trim(),
        // Keep `price` as selling price for backward compatibility
        price: parseFloat(formData.price),
        mrpPrice:
          formData.mrpPrice === "" ? null : parseFloat(formData.mrpPrice),
        categoryId: formData.categoryId,
        category: selectedCategory?.name || formData.category,
        description: formData.description.trim(),
        image: finalImages[0] || "",
        images: finalImages,
        stock: parseInt(formData.stock),
      };

      if (editingId) {
        // Update existing product
        await productsService.updateProduct(editingId, productData);
        const updated = products.map((p) =>
          p.id === editingId ? { id: editingId, ...productData } : p,
        );
        setProducts(updated);
        setSuccessMessage("Product updated successfully!");
      } else {
        // Add new product
        const newProduct = await productsService.addProduct(productData);
        setProducts([...products, newProduct]);
        setSuccessMessage("Product added successfully!");
      }

      resetForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      mrpPrice: product.mrpPrice ?? "",
      price: product.price,
      categoryId: product.categoryId || "",
      category: product.category || "",
      description: product.description,
      image: product.image || "",
      stock: product.stock,
    });
    setGalleryRows((prev) => {
      revokeGalleryBlobs(prev);
      return orderedImageUrlsFromProduct(product).map((url) => ({
        id: newGalleryRowId(),
        file: null,
        preview: url,
      }));
    });
    setEditingId(product.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setDeleting(id);
    setError(null);

    try {
      await productsService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setSuccessMessage("Product deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.message || "Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mrpPrice: "",
      price: "",
      categoryId: "",
      category: "",
      description: "",
      image: "",
      stock: "",
    });
    setGalleryRows((prev) => {
      revokeGalleryBlobs(prev);
      return [];
    });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
    setError(null);
  };

  const appendGalleryFiles = (files) => {
    if (!files.length) return;
    setGalleryRows((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: newGalleryRowId(),
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeGalleryRow = (index) => {
    setGalleryRows((prev) => {
      const row = prev[index];
      if (row?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(row.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveGalleryRow = (from, to) => {
    setGalleryRows((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-navy border-t-transparent"></div>
            <p className="text-brand-black/60">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy">Products</h1>
            <p className="text-brand-black/60">Manage your store products</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-white transition hover:bg-brand-navy/90"
            >
              <Plus className="h-5 w-5" />
              Add Product
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
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-brand-black/80">
                    Product Name *
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
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black/80">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className={`mt-1 w-full rounded-lg border ${
                      errors.price ? "border-red-500" : "border-black/10"
                    } px-4 py-2 transition focus:border-brand-navy focus:outline-none`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black/80">
                    MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mrpPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, mrpPrice: e.target.value })
                    }
                    className={`mt-1 w-full rounded-lg border ${
                      errors.mrpPrice ? "border-red-500" : "border-black/10"
                    } px-4 py-2 transition focus:border-brand-navy focus:outline-none`}
                    placeholder="0.00"
                  />
                  {errors.mrpPrice && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.mrpPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black/80">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className={`mt-1 w-full rounded-lg border ${
                      errors.categoryId ? "border-red-500" : "border-black/10"
                    } px-4 py-2 transition focus:border-brand-navy focus:outline-none`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black/80">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className={`mt-1 w-full rounded-lg border ${
                      errors.stock ? "border-red-500" : "border-black/10"
                    } px-4 py-2 transition focus:border-brand-navy focus:outline-none`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-black/80">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`mt-1 w-full rounded-lg border ${
                    errors.description ? "border-red-500" : "border-black/10"
                  } px-4 py-2 transition focus:border-brand-navy focus:outline-none`}
                  placeholder="Enter product description"
                  rows="4"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-black/80">
                  Product Images
                </label>
                <div className="mt-2 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        e.target.value = "";
                        appendGalleryFiles(files);
                      }}
                      className="block w-full max-w-md rounded-lg border border-black/10 bg-white px-4 py-2 transition focus:border-brand-navy focus:outline-none md:w-auto md:flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGalleryRows((prev) => {
                          revokeGalleryBlobs(prev);
                          return [];
                        });
                        setFormData((prev) => ({ ...prev, image: "" }));
                      }}
                      className="rounded-lg border border-black/10 px-3 py-2 text-sm transition hover:bg-black/5"
                    >
                      Clear all
                    </button>
                  </div>
                  <p className="text-xs text-brand-black/50">
                    Add all images first, then use the arrows — order is saved as shown (first row is the main storefront and detail image).
                  </p>

                  {galleryRows.length === 0 ? (
                    <div className="flex min-h-[4.5rem] items-center rounded-lg border border-dashed border-black/20 bg-black/[0.02] px-4 text-sm text-brand-black/45">
                      No images yet — use the file picker above.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {galleryRows.map((row, index) => (
                        <li
                          key={row.id}
                          className="flex flex-wrap items-center gap-3 rounded-lg border border-black/10 bg-black/[0.02] p-3"
                        >
                          <span className="min-w-[5.5rem] text-xs font-semibold uppercase tracking-wide text-brand-navy">
                            {imageGalleryOrderLabel(index)}
                            {index === 0 ? (
                              <span className="ml-1 font-normal normal-case text-brand-black/50">
                                (main)
                              </span>
                            ) : null}
                          </span>
                          <img
                            src={row.preview}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-lg border border-black/10 object-cover"
                          />
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              title="Move up"
                              aria-label={`Move ${imageGalleryOrderLabel(index)} up`}
                              disabled={index === 0}
                              onClick={() => moveGalleryRow(index, index - 1)}
                              className="rounded-md border border-black/10 p-1.5 text-brand-black transition hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30"
                            >
                              <ChevronUp className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              title="Move down"
                              aria-label={`Move ${imageGalleryOrderLabel(index)} down`}
                              disabled={index === galleryRows.length - 1}
                              onClick={() => moveGalleryRow(index, index + 1)}
                              className="rounded-md border border-black/10 p-1.5 text-brand-black transition hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30"
                            >
                              <ChevronDown className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              title="Remove image"
                              aria-label="Remove image from list"
                              onClick={() => removeGalleryRow(index)}
                              className="rounded-md border border-black/10 p-1.5 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-brand-navy px-6 py-2 text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {saving ? "Saving..." : "Save Product"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 rounded-lg border border-black/10 px-6 py-2 transition hover:bg-black/5"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {products.length === 0 ? (
            <div className="p-8 text-center text-brand-black/60">
              No products yet. Add one to get started!
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-black/10 bg-black/5">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-brand-black">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-brand-black">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-brand-black">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-brand-black">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-brand-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-black/5 hover:bg-black/2"
                  >
                    <td className="px-6 py-4 text-sm text-brand-black">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-black">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-brand-navy">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-black">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={deleting === product.id}
                          className="flex items-center gap-1 rounded-lg px-3 py-1 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="flex items-center gap-1 rounded-lg px-3 py-1 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deleting === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
