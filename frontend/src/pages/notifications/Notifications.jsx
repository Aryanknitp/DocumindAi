import { useEffect, useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import { apiRequest } from "../../lib/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await apiRequest("/notifications");
        setNotifications(response.notifications || []);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.read);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const deleteAll = () => setNotifications([]);
  const dismiss = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && <Badge variant="primary">{unreadCount}</Badge>}
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check size={13} /> Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteAll}
              className="text-destructive"
            >
              <Trash2 size={13} /> Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all capitalize ${filter === f ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div>
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description={
                filter === "unread"
                  ? "You are all caught up!"
                  : "Notifications from the app will appear here."
              }
            />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-4 group ${!notif.read ? "bg-secondary/30" : ""}`}
              >
                <div
                  className={`h-2 w-2 rounded-full mt-2 shrink-0 ${!notif.read ? "bg-primary" : "bg-transparent"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notif.time}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
                      title="Mark as read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(notif.id)}
                    className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
