import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Palette,
  Globe,
  Bell,
  Shield,
  Lock,
  HardDrive,
  CreditCard,
  Accessibility,
  Keyboard,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest } from "../../lib/api";

const sections = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-primary" : "bg-border"}`}
    >
      <div
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
      />
    </button>
  );
}

const shortcutKeys = [
  { action: "New chat", keys: ["Ctrl", "K"] },
  { action: "Upload Document", keys: ["Ctrl", "U"] },
  { action: "Search", keys: ["Ctrl", "/"] },
  { action: "Toggle sidebar", keys: ["Ctrl", "\\"] },
  { action: "Toggle theme", keys: ["Ctrl", "Shift", "L"] },
];

export default function Settings() {
  const [active, setActive] = useState("general");
  const { theme, toggleTheme } = useTheme();
  const [notifs, setNotifs] = useState({
    emailSummary: true,
    pushNotifications: false,
    weeklyDigest: true,
    uploadComplete: true,
    shareNotifications: false,
  });
  const [privacy, setPrivacy] = useState({
    analytics: false,
    crashReports: true,
    improveAI: false,
  });
  const [general, setGeneral] = useState({
    autoProcess: true,
    chatHistory: true,
    tips: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiRequest("/settings");
        const preferences = response.preferences || {};
        setNotifs((prev) => ({
          ...prev,
          ...(preferences.notifications || {}),
        }));
        setGeneral((prev) => ({ ...prev, ...(preferences.general || {}) }));
        setPrivacy((prev) => ({ ...prev, ...(preferences.privacy || {}) }));
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (nextPrefs) => {
    try {
      await apiRequest("/settings", {
        method: "PUT",
        body: { preferences: nextPrefs },
      });
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  const updatePreference = (group, key, value) => {
    const setters = {
      general: setGeneral,
      notifications: setNotifs,
      privacy: setPrivacy,
    };
    setters[group]((current) => {
      const next = { ...current, [key]: value };
      saveSettings({ [group]: next });
      return next;
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Nav */}
        <aside className="w-52 shrink-0 hidden md:block">
          <nav className="space-y-0.5 sticky top-20">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active === id
                    ? "bg-secondary text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon size={15} className="shrink-0" /> {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-4 animate-fade-in">
          {active === "general" && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">General Settings</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: "Auto-process Documents",
                      desc: "Automatically start AI processing when a Document is uploaded",
                      key: "autoProcess",
                      val: general.autoProcess,
                    },
                    {
                      label: "Save chat history",
                      desc: "Keep chat conversations for future reference",
                      key: "chatHistory",
                      val: general.chatHistory,
                    },
                    {
                      label: "Show onboarding tips",
                      desc: "Display helpful tips throughout the interface",
                      key: "tips",
                      val: general.tips,
                    },
                  ].map(({ label, desc, key, val }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Toggle
                        checked={val}
                        onChange={(value) =>
                          updatePreference("general", key, value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {active === "appearance" && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Appearance</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-foreground mb-3">
                  Theme
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => id !== "system" && toggleTheme()}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        theme === id || id === "system"
                          ? id === theme
                            ? "border-primary bg-secondary text-primary"
                            : "border-border text-muted-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <Icon size={20} />
                      {label}
                      {theme === id && (
                        <Badge variant="primary" className="text-[10px]">
                          Active
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-sm font-medium text-foreground mb-3">
                  Accent Color
                </p>
                <div className="flex gap-2">
                  {[
                    { color: "bg-indigo-500", label: "Indigo" },
                    { color: "bg-violet-500", label: "Violet" },
                    { color: "bg-blue-500", label: "Blue" },
                    { color: "bg-emerald-500", label: "Emerald" },
                    { color: "bg-rose-500", label: "Rose" },
                    { color: "bg-amber-500", label: "Amber" },
                  ].map(({ color, label }) => (
                    <button
                      key={color}
                      title={label}
                      className={`h-7 w-7 rounded-full ${color} ring-offset-2 ring-offset-background hover:ring-2 hover:ring-current transition-all`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Notification Preferences</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      key: "uploadComplete",
                      label: "Upload complete",
                      desc: "When a document finishes processing",
                    },
                    {
                      key: "emailSummary",
                      label: "Email summaries",
                      desc: "Daily digest of your AI activity",
                    },
                    {
                      key: "weeklyDigest",
                      label: "Weekly digest",
                      desc: "Weekly summary of your usage",
                    },
                    {
                      key: "pushNotifications",
                      label: "Push notifications",
                      desc: "Browser push notifications",
                    },
                    {
                      key: "shareNotifications",
                      label: "Share alerts",
                      desc: "When someone shares a document with you",
                    },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Toggle
                        checked={notifs[key]}
                        onChange={(v) => {
                          setNotifs((p) => {
                            const next = { ...p, [key]: v };
                            saveSettings({ notifications: next });
                            return next;
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {active === "privacy" && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Privacy Settings</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      key: "analytics",
                      label: "Usage analytics",
                      desc: "Share anonymous usage data to help improve the product",
                    },
                    {
                      key: "crashReports",
                      label: "Crash reports",
                      desc: "Automatically send error reports",
                    },
                    {
                      key: "improveAI",
                      label: "Improve AI models",
                      desc: "Allow your anonymized data to improve AI quality",
                    },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Toggle
                        checked={privacy[key]}
                        onChange={(value) =>
                          updatePreference("privacy", key, value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="destructive" size="sm">
                    Delete all my data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This action is irreversible and will delete all documents,
                    chats, and account data.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "shortcuts" && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Keyboard Shortcuts</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shortcutKeys.map(({ action, keys }) => (
                    <div
                      key={action}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-foreground">{action}</span>
                      <div className="flex items-center gap-1">
                        {keys.map((k, i) => (
                          <span
                            key={i}
                            className="mono text-xs px-2 py-0.5 rounded bg-muted border border-border font-medium"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {active === "language" && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Language & Region</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">
                      Display Language
                    </label>
                    <select className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">
                      Timezone
                    </label>
                    <select className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none">
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(active === "security" ||
            active === "storage" ||
            active === "billing" ||
            active === "accessibility") && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">
                  {sections.find((s) => s.id === active)?.label}
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {active} settings will be available after backend integration.
                  Connect your authentication and billing systems to enable
                  these features.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
