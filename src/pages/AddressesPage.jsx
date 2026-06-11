import { Edit2, MapPin, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useUserAuth } from "../contexts/UserAuthContext";
import { userService } from "../services/userService";

const EMPTY_FORM = {
  label: "",
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  isDefault: false,
};

function AccountNav({ active }) {
  const links = [
    { to: "/profile", label: "Profile" },
    { to: "/my-orders", label: "My Orders" },
    { to: "/addresses", label: "Addresses" },
    { to: "/wishlist", label: "Wishlist" },
  ];
  return (
    <nav className="flex flex-wrap gap-2 border-b border-black/[0.07] pb-4 mb-6">
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            active === label
              ? "bg-brand-navy text-white"
              : "bg-black/[0.04] text-slate-600 hover:bg-black/[0.08]"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function AddressesPage() {
  const { user } = useUserAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const data = await userService.getAddresses(user.uid);
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]); // eslint-disable-line

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setEditId(addr.id);
    setForm({
      label: addr.label || "",
      name: addr.name || "",
      phone: addr.phone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      area: addr.area || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      landmark: addr.landmark || "",
      isDefault: addr.isDefault || false,
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    if (!form.phone.trim()) { setFormError("Phone number is required."); return; }
    if (!form.addressLine1.trim()) { setFormError("Address Line 1 is required."); return; }
    if (!form.city.trim()) { setFormError("City is required."); return; }
    if (!form.state.trim()) { setFormError("State is required."); return; }
    if (!form.pincode.trim()) { setFormError("Pincode is required."); return; }

    setSaving(true);
    try {
      let savedId = editId;
      if (editId) {
        await userService.updateAddress(user.uid, editId, form);
      } else {
        const newAddr = await userService.addAddress(user.uid, form);
        savedId = newAddr.id;
      }
      if (form.isDefault && savedId) {
        await userService.setDefaultAddress(user.uid, savedId);
      }
      await load();
      setShowForm(false);
    } catch {
      setFormError("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    setDeletingId(id);
    await userService.deleteAddress(user.uid, id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setDeletingId("");
  };

  const handleSetDefault = async (id) => {
    await userService.setDefaultAddress(user.uid, id);
    await load();
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <PageLayout title="My Addresses" subtitle="Manage your delivery addresses">
      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4">
          <AccountNav active="Addresses" />

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">{addresses.length} address{addresses.length !== 1 ? "es" : ""} saved</p>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 rounded-xl bg-brand-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-navy/90"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
              <MapPin className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-500">No addresses yet</p>
              <button
                onClick={openAdd}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-navy px-4 py-2 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                Add your first address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${addr.isDefault ? "border-brand-navy/30 ring-1 ring-brand-navy/20" : "border-black/[0.07]"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {addr.label && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            {addr.label}
                          </span>
                        )}
                        {addr.isDefault && (
                          <span className="flex items-center gap-1 rounded-full bg-brand-navy/10 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                            <Star className="h-3 w-3 fill-brand-navy" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 font-semibold text-slate-800">{addr.name}</p>
                      <p className="text-sm text-slate-500">{addr.phone}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {[addr.addressLine1, addr.addressLine2, addr.area, addr.city, addr.state, addr.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {addr.landmark && (
                        <p className="text-xs text-slate-400">Near: {addr.landmark}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-navy/5 hover:text-brand-navy"
                          title="Set as default"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(addr)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingId === addr.id}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Address form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-black/[0.07] bg-white px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold text-slate-800">
                {editId ? "Edit Address" : "Add New Address"}
              </h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 hover:bg-black/[0.05]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-5 sm:p-6">
              {formError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Label (Home / Work / Other)</label>
                <input {...field("label")} placeholder="e.g. Home" className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Full name *</label>
                  <input {...field("name")} className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Phone *</label>
                  <input {...field("phone")} className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Address Line 1 *</label>
                <input {...field("addressLine1")} placeholder="House / Flat No, Street" className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Address Line 2</label>
                <input {...field("addressLine2")} placeholder="Apartment, Floor (optional)" className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Area / Locality *</label>
                  <input {...field("area")} className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Landmark</label>
                  <input {...field("landmark")} placeholder="Near…" className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">City *</label>
                  <input {...field("city")} className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">State *</label>
                  <input {...field("state")} className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Pincode *</label>
                  <input {...field("pincode")} inputMode="numeric" className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded accent-brand-navy"
                />
                <span className="text-sm font-semibold text-slate-700">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-black/[0.03]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy/90 disabled:opacity-60"
                >
                  {saving ? "Saving…" : editId ? "Update" : "Add Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
