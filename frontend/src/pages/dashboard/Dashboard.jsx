import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Sparkles,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock,
  HardDrive,
  Zap,
  ArrowRight,
  Brain,
  Plus,
  ChevronRight,
} from "lucide-react";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { aiApi, documentApi, userApi } from "../../lib/api";

const quickActions = [
  {
    icon: Upload,
    label: "Upload Document",
    to: "/upload",
    color: "from-indigo-500 to-violet-500",
    desc: "Add a new document",
  },
  {
    icon: Sparkles,
    label: "AI Summary",
    to: "/ai-summary",
    color: "from-violet-500 to-purple-600",
    desc: "Summarize a Document",
  },
  {
    icon: MessageSquare,
    label: "Chat with Document",
    to: "/chat",
    color: "from-sky-500 to-blue-600",
    desc: "Ask questions",
  },
  {
    icon: BookOpen,
    label: "Flashcards",
    to: "/flashcards",
    color: "from-emerald-500 to-teal-600",
    desc: "Study smart",
  },
];

const aiTools = [
  {
    icon: Sparkles,
    label: "AI Summaries",
    to: "/ai-summary",
    desc: "Generate summaries in seconds",
  },
  {
    icon: MessageSquare,
    label: "Chat with Document",
    to: "/chat",
    desc: "Ask anything about your docs",
  },
  {
    icon: BookOpen,
    label: "Flashcards",
    to: "/flashcards",
    desc: "Auto-generate study cards",
  },
  {
    icon: Brain,
    label: "Mind Maps",
    to: "/mindmaps",
    desc: "Visualize document structure",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  // check for how to update this section on ui
  const [stats, setStats] = useState({
    totalDocuments: 0,
    aiSummaries: 0,
    chatSessions: 0,
    storageUsed: "0 MB",
  });
  const [documents, setDocuments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [overview, docList, storage] = await Promise.all([
          aiApi.dashboard(),
          documentApi.list().catch(() => ({ documents: [] })),
          userApi.storage().catch(() => ({ storage: { bytes: 0 } })),
        ]);

        setStats({
          totalDocuments: overview?.stats?.totalDocuments ?? 0,
          aiSummaries: overview?.stats?.aiSummaries ?? 0,
          chatSessions: overview?.stats?.chatSessions ?? 0,
          storageUsed: `${((storage.storage?.bytes || 0) / (1024 * 1024)).toFixed(2)} MB`,
        });
        setActivity(overview?.activity || []);
        setDocuments(docList.documents || []);
      } catch (error) {
        console.error("Dashboard fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome banner */}
      {showWelcome && (
        <div className="relative bg-linear-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 text-white overflow-hidden animate-fade-in">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-3 right-3 text-white/60 hover:text-white text-xl leading-none"
          >
            ×
          </button>
          <div
            className="absolute right-0 top-0 bottom-0 w-48 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={20} />
              <span className="text-sm font-medium text-white/80">
                Documind Ai
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {greeting()}
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </h2>
            <p className="text-white/70 text-sm mb-4">
              Your AI workspace is ready. Upload a Document to get started.
            </p>
            <Button
              size="sm"
              className="bg-white text-indigo-700 hover:bg-white/90 font-semibold"
              onClick={() => navigate("/upload")}
            >
              <Upload size={14} /> Upload your first Document
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: FileText,
            label: "Total Documents",
            value: stats.totalDocuments,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
          },
          {
            icon: Sparkles,
            label: "AI Summaries",
            value: stats.aiSummaries,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
          },
          {
            icon: MessageSquare,
            label: "Chat Sessions",
            value: stats.chatSessions,
            color: "text-sky-500",
            bg: "bg-sky-500/10",
          },
          {
            icon: HardDrive,
            label: "Storage Used",
            value: stats.storageUsed,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="animate-fade-in">
            <CardContent className="pt-5">
              <div
                className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
              >
                <Icon size={20} className={color} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              {value !== null ? (
                <p className="text-2xl font-bold text-foreground">{value}</p>
              ) : (
                <p className="text-2xl font-bold text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, to, color, desc }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="group flex flex-col gap-3 bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div
                className={`h-10 w-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Recent Documents
            </h2>
            <button
              onClick={() => navigate("/recent")}
              className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <Card>
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents yet"
                description="Upload your first Document to see it here. Your recent documents will appear in this list."
                action={() => navigate("/upload")}
                actionLabel="Upload Document"
              />
            ) : (
              <div className="divide-y divide-border">
                {documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc._id}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.fileType?.toUpperCase()} ·{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* AI Tools */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            AI Workspace
          </h2>
          <Card>
            <CardContent className="pt-5 space-y-2">
              {aiTools.map(({ icon: Icon, label, to, desc }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
                >
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Clock size={14} /> Recent Activity
          </h2>
        </div>
        <Card>
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">
              Loading activity...
            </div>
          ) : activity.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No activity yet"
              description="Your document interactions, AI sessions, and other activity will appear here."
            />
          ) : (
            <div className="divide-y divide-border">
              {activity.map((item) => (
                <div key={item._id} className="p-4">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
