import { Eye, EyeOff, LogOut, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useUserAuth } from "../contexts/UserAuthContext";
import { userService } from "../services/userService";

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

export default function ProfilePage() {
  const { user, userProfile, logout, changePassword, refreshProfile } = useUserAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setPhone(userProfile.phone || "");
    }
  }, [userProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveMsg("");
    if (!name.trim()) { setSaveError("Name is required."); return; }
    setSaving(true);
    try {
      await userService.updateProfile(user.uid, { name: name.trim(), phone: phone.trim() });
      await refreshProfile();
      setSaveMsg("Profile updated successfully.");
    } catch {
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassMsg("");
    if (!newPassword) { setPassError("New password is required."); return; }
    if (newPassword.length < 6) { setPassError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPassError("Passwords do not match."); return; }
    setChangingPass(true);
    const result = await changePassword(newPassword);
    setChangingPass(false);
    if (result.success) {
      setPassMsg("Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPassError(result.error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com";

  return (
    <PageLayout title="My Profile" subtitle="Manage your account details">
      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4">
          <AccountNav active="Profile" />

          {/* Profile info */}
          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xl font-bold text-white">
                {(userProfile?.name || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-800">{userProfile?.name || "—"}</p>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            {saveMsg && (
              <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {saveMsg}
              </div>
            )}
            {saveError && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-black/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
                <input
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-xl border border-black/10 bg-slate-50 px-4 py-3 text-sm text-slate-400 outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 99999"
                  className="w-full rounded-xl border border-black/10 py-3 px-4 text-sm outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy/90 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change password — only for email/password users */}
          {!isGoogleUser && (
            <div className="mt-6 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-base font-bold text-slate-800">Change Password</h2>

              {passMsg && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {passMsg}
                </div>
              )}
              {passError && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {passError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">New password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl border border-black/10 py-3 px-4 pr-11 text-sm outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm new password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-black/10 py-3 px-4 text-sm outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPass}
                  className="flex items-center gap-2 rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {changingPass ? "Updating…" : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {/* Sign out */}
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
