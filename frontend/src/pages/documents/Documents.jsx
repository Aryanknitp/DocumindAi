import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Grid3X3,
  List,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Heart,
  Share2,
  Trash2,
  RefreshCw,
  FolderOpen,
  Star,
  Clock,
} from "lucide-react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import { documentApi } from "../../lib/api";

function DocumentCard({
  doc,
  view,
  onFavorite,
  onShare,
  onDelete,
  onRestore,
  isTrash,
}) {
  if (view === "list") {
    return (
      <div className="flex items-center gap-4 p-4">
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
          <FileText size={16} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{doc.title}</p>
          <p className="text-xs text-muted-foreground">
            {doc.fileType?.toUpperCase()} ·{" "}
            {new Date(doc.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{doc.status}</Badge>
          <button
            onClick={() => (isTrash ? onRestore(doc._id) : onDelete(doc._id))}
            title={isTrash ? "Restore document" : "Move to trash"}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
          >
            {isTrash ? <RefreshCw size={14} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
          <FileText size={18} className="text-primary" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => (isTrash ? onRestore(doc._id) : onDelete(doc._id))}
            title={isTrash ? "Restore document" : "Move to trash"}
            className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            {isTrash ? <RefreshCw size={14} /> : <Trash2 size={14} />}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => (isTrash ? onRestore(doc._id) : onDelete(doc._id))}
              title={isTrash ? "Restore document" : "Move to trash"}
              className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              {isTrash ? <RefreshCw size={14} /> : <Trash2 size={14} />}
            </button>
            <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
              <MoreVertical size={14} />
            </button>
          </div>
        </div>
      </div>
      <div>
        <p className="font-medium text-foreground truncate">{doc.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {doc.fileType?.toUpperCase()} ·{" "}
          {new Date(doc.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Badge>{doc.status}</Badge>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onFavorite(doc._id)}
            title="Toggle favorite"
            className={`h-7 w-7 rounded-md hover:bg-muted ${doc.isFavorite ? "text-red-500" : "text-muted-foreground"}`}
          >
            <Heart size={13} fill={doc.isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => onShare(doc._id)}
            title="Toggle shared"
            className={`h-7 w-7 rounded-md hover:bg-muted ${doc.isShared ? "text-primary" : "text-muted-foreground"}`}
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Documents({
  title = "My Documents",
  emptyTitle = "No documents yet",
  emptyDesc = "Upload your first Document to get started. Your documents will appear here.",
  scope = "",
}) {
  const navigate = useNavigate();
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [shareError, setShareError] = useState("");

  const updateDocument = async (id, action) => {
    try {
      const response = await action(id);
      if (response.isFavorite !== undefined) {
        setDocuments((items) =>
          items.map((item) =>
            item._id === id
              ? { ...item, isFavorite: response.isFavorite }
              : item,
          ),
        );
      } else if (response.isShared !== undefined) {
        setDocuments((items) =>
          items.map((item) =>
            item._id === id ? { ...item, isShared: response.isShared } : item,
          ),
        );
      } else {
        setDocuments((items) => items.filter((item) => item._id !== id));
      }
    } catch (error) {
      console.error("Document action failed", error);
    }
  };

  const prepareShare = async (id) => {
    try {
      const document = documents.find((item) => item._id === id);
      const response = await documentApi.createShareLink(id);
      setShareTarget(document);
      setShareUrl(response.shareUrl);
      setShareError("");
    } catch (error) {
      setShareError(error.message || "Unable to create share link");
    }
  };

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await documentApi.list(scope);
        setDocuments(response.documents || []);
      } catch (error) {
        console.error("Failed to load documents", error);
      }
    };
    loadDocuments();
  }, [scope]);

  const filtered = [...documents]
    .filter((d) => d.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {documents.length
              ? `${documents.length} document${documents.length !== 1 ? "s" : ""}`
              : "No documents"}
          </p>
        </div>
        <Button
          variant="gradient"
          size="md"
          onClick={() => navigate("/upload")}
        >
          <Plus size={15} /> Upload Document
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full h-9 pl-9 pr-4 rounded-radius border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-radius border border-border bg-card text-sm focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="size">Size</option>
          </select>

          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-colors ${filterOpen ? "border-primary bg-secondary text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}
          >
            <SlidersHorizontal size={15} />
          </button>

          <div className="flex border border-border rounded-radius overflow-hidden">
            {[
              { id: "grid", Icon: Grid3X3 },
              { id: "list", Icon: List },
            ].map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`h-9 w-9 flex items-center justify-center transition-colors ${view === id ? "bg-secondary text-primary" : "bg-card text-muted-foreground hover:bg-muted"}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      {filterOpen && (
        <div className="flex flex-wrap gap-2 p-3 bg-card border border-border rounded-xl animate-fade-in">
          <p className="text-xs font-medium text-muted-foreground self-center">
            Filter by type:
          </p>
          {["All", "Document", "DOCX", "TXT"].map((type) => (
            <button
              key={type}
              className="px-3 py-1 rounded-full text-xs border border-border bg-muted hover:border-primary/50 transition-colors"
            >
              {type}
            </button>
          ))}
          <div className="w-pxbg-border mx-1" />
          <p className="text-xs font-medium text-muted-foreground self-center">
            Status:
          </p>
          {["Processed", "Processing", "Failed"].map((s) => (
            <button
              key={s}
              className="px-3 py-1 rounded-full text-xs border border-border bg-muted hover:border-primary/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div>
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl">
            <EmptyState
              icon={FileText}
              title={search ? "No documents match your search" : emptyTitle}
              description={search ? "Try a different search term." : emptyDesc}
              action={() => navigate("/upload")}
              actionLabel="Upload Document"
              secondaryAction={search ? () => setSearch("") : undefined}
              secondaryLabel="Clear search"
            />
          </div>
        ) : view === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                view="grid"
                onFavorite={(id) =>
                  updateDocument(id, documentApi.toggleFavorite)
                }
                onShare={prepareShare}
                onDelete={(id) => updateDocument(id, documentApi.remove)}
                onRestore={(id) => updateDocument(id, documentApi.restore)}
                isTrash={scope === "trash"}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {filtered.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                view="list"
                onFavorite={(id) =>
                  updateDocument(id, documentApi.toggleFavorite)
                }
                onShare={prepareShare}
                onDelete={(id) => updateDocument(id, documentApi.remove)}
                onRestore={(id) => updateDocument(id, documentApi.restore)}
                isTrash={scope === "trash"}
              />
            ))}
          </div>
        )}
      </div>
      {shareTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                Share {shareTarget.title}
              </h2>
              <button
                onClick={() => setShareTarget(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <input
              readOnly
              value={shareUrl}
              className="mt-4 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                [
                  "WhatsApp",
                  `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
                ],
                [
                  "Email",
                  `mailto:?subject=${encodeURIComponent(shareTarget.title)}&body=${encodeURIComponent(shareUrl)}`,
                ],
                [
                  "Outlook",
                  `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(shareTarget.title)}&body=${encodeURIComponent(shareUrl)}`,
                ],
                [
                  "Telegram",
                  `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTarget.title)}`,
                ],
                ["Google Drive", "https://drive.google.com/drive/my-drive"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border px-3 py-2 text-center text-sm text-foreground hover:bg-muted"
                >
                  {label}
                </a>
              ))}
            </div>
            {shareError && (
              <p className="mt-3 text-sm text-destructive">{shareError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
