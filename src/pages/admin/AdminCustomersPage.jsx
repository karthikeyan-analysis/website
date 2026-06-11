import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Mail, Phone, Search, ShoppingBag, User, X } from "lucide-react";
import { userService } from "../../services/userService";

function formatDate(value) {
  if (!value) return "-";
  const d = (() => {
    if (typeof value === "string" || value instanceof Date) return new Date(value);
    if (typeof value?.toDate === "function") return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    return null;
  })();
  if (!d || isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitial(name, email) {
  const s = name || email || "?";
  return s[0].toUpperCase();
}

function CustomerModal({ customer, onClose }) {
  if (!customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-navy to-brand-maroon px-6 py-4">
          <h2 className="text-lg font-bold text-white">Customer Details</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xl font-bold text-white">
              {getInitial(customer.name, customer.email)}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{customer.name || "-"}</p>
              <p className="text-sm text-gray-500">{customer.email || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</p>
              <p className="mt-0.5 font-medium text-gray-800">{customer.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Joined</p>
              <p className="mt-0.5 font-medium text-gray-800">{formatDate(customer.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Provider</p>
              <p className="mt-0.5 font-medium text-gray-800 capitalize">{customer.provider || "email"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">User ID</p>
              <p className="mt-0.5 font-mono text-xs text-gray-600 break-all">{customer.uid || customer.id || "-"}</p>
            </div>
          </div>
          {customer.addresses && customer.addresses.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                Saved Addresses ({customer.addresses.length})
              </p>
              <div className="space-y-2">
                {customer.addresses.map((addr, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-3 text-sm">
                    {addr.label && <span className="mr-2 rounded-full bg-brand-navy/10 px-2 py-0.5 text-xs font-bold text-brand-navy">{addr.label}</span>}
                    {addr.isDefault && <span className="mr-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Default</span>}
                    <p className="mt-1 text-gray-700">
                      {[addr.addressLine1, addr.area, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    userService
      .getAllCustomers()
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      String(c.name || "").toLowerCase().includes(q) ||
      String(c.email || "").toLowerCase().includes(q) ||
      String(c.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-gray-500">Registered customer accounts</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">Total Customers</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone…"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading customers…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {search ? "No customers match your search." : "No registered customers yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <tr key={c.uid || c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-sm font-bold text-brand-navy">
                            {getInitial(c.name, c.email)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{c.name || "(No name)"}</p>
                            <p className="text-xs text-gray-500">{c.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{c.phone || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          c.provider === "google.com"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {c.provider === "google.com" ? "Google" : "Email"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(c.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="View Details"
                        >
                          <User className="h-4 w-4" />
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

      {selectedCustomer && (
        <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </AdminLayout>
  );
}
