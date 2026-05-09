import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Mail,
  LogOut,
  ChevronRight,
  MessageCircle,
  Megaphone,
} from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tag,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Contact Messages",
      href: "/admin/contacts",
      icon: Mail,
    },
    {
      name: "Testimonials",
      href: "/admin/testimonials",
      icon: MessageCircle,
    },
    {
      name: "Offer ticker",
      href: "/admin/offer-banner",
      icon: Megaphone,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-brand-navy text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${!sidebarOpen && "justify-center w-full"}`}
          >
            <img
              src="/logo.jpeg"
              alt="Karthikeyan Analysis"
              className="h-10 w-10 rounded-lg"
            />
            {sidebarOpen && (
              <div className="text-sm font-bold">Admin Panel</div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? "bg-white/20 border-l-4 border-white"
                    : "hover:bg-white/10"
                } ${!sidebarOpen && "justify-center"}`}
                title={item.name}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && (
                  <span className="font-semibold">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {sidebarOpen && (
            <div className="px-4 py-2 bg-white/10 rounded-lg text-xs">
              <p className="text-white/80">Logged in as:</p>
              <p className="font-bold truncate">{admin?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition text-white ${
              !sidebarOpen && "justify-center"
            }`}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">{admin?.email}</p>
            </div>
            <div className="h-10 w-10 bg-brand-navy rounded-full flex items-center justify-center text-white font-bold">
              {admin?.name?.[0]}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
