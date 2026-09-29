import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Key,
  Monitor,
  Link2,
  CreditCard,
  HardDrive,
  Cpu,
  Activity,
  Camera,
  Edit3,
  Check,
  X,
} from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../lib/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "sessions", label: "Sessions", icon: Monitor },
  { id: "connected", label: "Connected", icon: Link2 },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "usage", label: "Usage", icon: Cpu },
  { id: "activity", label: "Activity", icon: Activity },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [overview, setOverview] = useState(null);
  const [storage, setStorage] = useState({ bytes: 0, documentCount: 0 });
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        bio: user.profile?.bio || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "sessions" || activeTab === "activity") {
      userApi
        .overview()
        .then((response) => setOverview(response.overview))
        .catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "usage") {
      userApi
        .storage()
        .then((response) => setStorage(response.storage))
        .catch(() => {});
    }
  }, [activeTab]);

  const handleSave = async () => {
    try {
      const response = await userApi.updateProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
      });
      const profile = response.user || response.profile || {};
      updateUser({
        ...profile,
        name: form.name,
        email: form.email,
        profile: { ...(profile.profile || {}), bio: form.bio },
      });
    } catch (error) {
      console.error("Profile update failed", error);
    }
    setEditing(false);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    try {
      const response = await userApi.changePassword(passwords);
      setPasswordMessage(response.message);
      setPasswords({ currentPassword: "", newPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      setPasswordMessage(error.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="bg-linear-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 flex items-center gap-5">
          <div className="relative">
            <Avatar
              name={user?.name || "User"}
              src={user?.avatar}
              size="2xl"
              className="border-4 border-white/30"
            />
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Camera size={14} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {user?.name || "Your Account"}
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              {user?.email || "No email set"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-white/10 text-white border-0">
                Free Plan
              </Badge>
              <Badge className="bg-white/10 text-white border-0">
                Member since 2026
              </Badge>
            </div>
          </div>
          <Button
            className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Edit3 size={13} /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Personal Information</h2>
                {!editing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit3 size={13} /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(false)}
                    >
                      <X size={13} /> Cancel
                    </Button>
                    <Button variant="gradient" size="sm" onClick={handleSave}>
                      <Check size={13} /> Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Full Name", key: "name", icon: User, type: "text" },
                  {
                    label: "Email Address",
                    key: "email",
                    icon: Mail,
                    type: "email",
                  },
                  { label: "Bio", key: "bio", icon: Edit3, type: "textarea" },
                ].map(({ label, key, icon: Icon, type }) => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1">
                      <Icon size={15} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        {label}
                      </label>
                      {editing ? (
                        type === "textarea" ? (
                          <textarea
                            rows={3}
                            value={form[key]}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, [key]: e.target.value }))
                            }
                            className="w-full rounded-lg border border-border bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder={`Enter your ${label.toLowerCase()}`}
                          />
                        ) : (
                          <input
                            type={type}
                            value={form[key]}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, [key]: e.target.value }))
                            }
                            className="w-full h-9 rounded-lg border border-border bg-background text-sm px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        )
                      ) : (
                        <p className="text-sm text-foreground">
                          {form[key] || (
                            <span className="text-muted-foreground italic">
                              Not set
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h2 className="font-semibold flex items-center gap-2">
                  <Key size={16} /> Password
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Update your password to keep your account secure.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPasswordMessage("");
                    setShowPasswordForm((value) => !value);
                  }}
                >
                  Change Password
                </Button>
                {showPasswordForm && (
                  <form
                    onSubmit={handlePasswordChange}
                    className="mt-4 space-y-3"
                  >
                    <input
                      type="password"
                      required
                      value={passwords.currentPassword}
                      onChange={(event) =>
                        setPasswords((value) => ({
                          ...value,
                          currentPassword: event.target.value,
                        }))
                      }
                      placeholder="Current password"
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
                    />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwords.newPassword}
                      onChange={(event) =>
                        setPasswords((value) => ({
                          ...value,
                          newPassword: event.target.value,
                        }))
                      }
                      placeholder="New password"
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
                    />
                    <Button type="submit" variant="gradient" size="sm">
                      Save password
                    </Button>
                  </form>
                )}
                {passwordMessage && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {passwordMessage}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h2 className="font-semibold flex items-center gap-2">
                  <Shield size={16} /> Two-Factor Authentication
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account.
                </p>
                <Badge variant="warning">Not enabled</Badge>
                <Button variant="outline" size="sm" className="ml-3">
                  Enable 2FA
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "sessions" && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Active Sessions</h2>
            </CardHeader>
            <CardContent>
              {overview?.recentChats?.length ? (
                overview.recentChats.map((session) => (
                  <div
                    key={session._id}
                    className="border-b border-border py-3 last:border-0"
                  >
                    <p className="text-sm font-medium">
                      {session.title || "Chat session"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(session.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active sessions found.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "subscription" && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Current Plan</h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div>
                  <p className="font-semibold">Free Plan</p>
                  <p className="text-xs text-muted-foreground">
                    5 Documents / month · 10 AI summaries
                  </p>
                </div>
                <Button variant="gradient" size="sm">
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "usage" && (
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "Storage",
                value: `${(storage.bytes / (1024 * 1024)).toFixed(2)} MB`,
                max: "5 GB",
                icon: HardDrive,
              },
              {
                label: "AI Tokens Used",
                value: null,
                max: "Unlimited",
                icon: Cpu,
              },
              {
                label: "API Requests",
                value: null,
                max: "1,000 / mo",
                icon: Activity,
              },
            ].map(({ label, value, max, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} className="text-primary" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {value || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">of {max}</p>
                  <div className="mt-3 h-1.5 bg-muted rounded-full">
                    <div className="h-full w-0 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "activity" && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Recent Activity</h2>
            </CardHeader>
            <CardContent>
              {overview?.recentActivity?.length ? (
                overview.recentActivity.map((item) => (
                  <div
                    key={item._id}
                    className="border-b border-border py-3 last:border-0"
                  >
                    <p className="text-sm font-medium">
                      {item.description || item.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No account activity found.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "connected" && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Connected Accounts</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Google", "GitHub", "Slack"].map((provider) => (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-3 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-primary">
                        {provider[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{provider}</p>
                        <p className="text-xs text-muted-foreground">
                          {(provider === "Google" && user?.googleId) ||
                          (provider === "GitHub" && user?.githubId)
                            ? "Connected"
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    {provider === "Slack" ? (
                      <Button variant="outline" size="sm" disabled>
                        Coming soon
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.location.href = `${API_BASE}/auth/${provider.toLowerCase()}`;
                        }}
                      >
                        {(provider === "Google" && user?.googleId) ||
                        (provider === "GitHub" && user?.githubId)
                          ? "Reconnect"
                          : "Connect"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
