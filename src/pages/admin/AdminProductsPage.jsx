import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Edit2, Trash2, X, Save, AlertCircle } from "lucide-react";
import {
  productsService,
  categoriesService,
} from "../../services/firebaseService";

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
    price: "",
    categoryId: "",
    category: "",
    description: "",
    image: "",
    stock: "",
  });
  const [errors, setErrors] = useState({});

  // Load products and categories
  useEffect(() => {
    loadData();
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
      newErrors.price = "Valid price is required";
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

      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        category: selectedCategory?.name || formData.category,
        description: formData.description.trim(),
        image: formData.image.trim() || "",
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
      price: product.price,
      categoryId: product.categoryId || "",
      category: product.category || "",
      description: product.description,
      image: product.image || "",
      stock: product.stock,
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
      price: "",
      categoryId: "",
      category: "",
      description: "",
      image: "",
      stock: "",
    });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
    setError(null);
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
                    Price (₹) *
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
