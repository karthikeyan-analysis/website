import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Eye, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { contactsService } from "../../services/firebaseService";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Load contacts from Firebase
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await contactsService.getContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error loading contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const handleMarkRead = async (contactId, isRead) => {
    try {
      await contactsService.updateContact(contactId, { read: !isRead });
      const updated = contacts.map((contact) =>
        contact.id === contactId ? { ...contact, read: !isRead } : contact,
      );
      setContacts(updated);
      if (selectedContact?.id === contactId) {
        setSelectedContact({ ...selectedContact, read: !isRead });
      }
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleDelete = async (contactId) => {
    if (confirm("Are you sure you want to delete this message?")) {
      setDeleting(contactId);
      try {
        await contactsService.deleteContact(contactId);
        setContacts(contacts.filter((c) => c.id !== contactId));
        setShowModal(false);
        setSelectedContact(null);
      } catch (error) {
        console.error("Error deleting contact:", error);
      } finally {
        setDeleting(null);
      }
    }
  };

  const filteredContacts =
    filter === "unread" ? contacts.filter((c) => !c.read) : contacts;

  const unreadCount = contacts.filter((c) => !c.read).length;

  const formatDate = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contact Messages
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage customer inquiries and messages
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-100 border-2 border-red-300 rounded-lg px-4 py-2">
              <p className="font-bold text-red-700">{unreadCount} Unread</p>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "all"
                ? "bg-brand-navy text-white"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            All Messages ({contacts.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "unread"
                ? "bg-brand-navy text-white"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-500">
                {filter === "unread"
                  ? "No unread messages"
                  : "No messages found"}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`rounded-xl shadow-md p-5 cursor-pointer transition hover:shadow-lg border-l-4 ${
                  contact.read
                    ? "bg-white border-gray-300"
                    : "bg-blue-50 border-blue-500"
                }`}
                onClick={() => {
                  setSelectedContact(contact);
                  setShowModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      {!contact.read && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      <span className="font-semibold">Email:</span>{" "}
                      {contact.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {contact.message}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {contact.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(contact.submittedAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContact(contact);
                      setShowModal(true);
                    }}
                    className="ml-4 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition flex-shrink-0"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Details Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-navy to-brand-maroon text-white p-6 flex items-center justify-between sticky top-0">
              <h2 className="text-2xl font-bold">
                Message from {selectedContact.name}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl font-bold hover:bg-white/20 rounded-lg p-2"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">NAME</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedContact.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">EMAIL</p>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-lg font-bold text-blue-600 hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">PHONE</p>
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="text-lg font-bold text-blue-600 hover:underline"
                  >
                    {selectedContact.phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">DATE</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(selectedContact.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">
                  MESSAGE
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-100 p-4 rounded-lg space-y-3">
                <p className="font-semibold text-gray-900">Quick Actions</p>
                <div className="flex flex-col gap-2">
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                  >
                    Reply via Email
                  </a>
                  <a
                    href={`https://wa.me/${selectedContact.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-center font-semibold"
                  >
                    Contact via WhatsApp
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleMarkRead(selectedContact.id, selectedContact.read)
                  }
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-semibold"
                >
                  {selectedContact.read ? "Mark as Unread" : "Mark as Read"}
                </button>
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  disabled={deleting === selectedContact.id}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold disabled:opacity-50"
                >
                  {deleting === selectedContact.id
                    ? "Deleting..."
                    : "Delete Message"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
