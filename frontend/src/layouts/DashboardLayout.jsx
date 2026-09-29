import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import BottomNav from "../components/layout/BottomNav";

const titleMap = {
  "/dashboard": "Dashboard",
  "/upload": "Upload Document",
  "/documents": "My Documents",
  "/recent": "Recent Documents",
  "/favorites": "Favorites",
  "/shared": "Shared Documents",
  "/collections": "Collections",
  "/trash": "Trash",
  "/ai-summary": "AI Summaries",
  "/chat": "Chat with Document",
  "/flashcards": "Flashcards",
  "/quiz": "Quiz Generator",
  "/mindmaps": "Mind Maps",
  "/notes": "Smart Notes",
  "/highlights": "Highlights",
  "/bookmarks": "Bookmarks",
  "/search": "Search",
  "/storage": "Storage",
  "/profile": "Profile",
  "/settings": "Settings",
  "/billing": "Billing",
  "/help": "Help Center",
  "/notifications": "Notifications",
  "/viewer": "Document Viewer",
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const title = titleMap[pathname] || "Documind Ai";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
