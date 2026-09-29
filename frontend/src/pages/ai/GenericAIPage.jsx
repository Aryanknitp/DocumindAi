import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Brain,
  Sparkles,
  Map,
  StickyNote,
  HelpCircle,
  Highlighter,
  Bookmark,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import {
  aiApi,
  billingApi,
  collectionApi,
  documentApi,
  userApi,
} from "../../lib/api";
import Documents from "../documents/Documents";

function SharedDocumentPage() {
  const { pathname } = useLocation();
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/documents/shared/${pathname.split("/").pop()}`,
    )
      .then((response) =>
        response.json().then((payload) => ({ ok: response.ok, payload })),
      )
      .then(({ ok, payload }) => {
        if (!ok)
          throw new Error(payload.message || "Shared document not found");
        setDocument(payload.document);
      })
      .catch((requestError) => setError(requestError.message));
  }, [pathname]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold text-foreground">
        {document?.title || "Shared document"}
      </h1>
      {error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <div className="whitespace-pre-wrap rounded-xl border border-border bg-card p-5 text-sm text-foreground">
          {document?.summary ||
            document?.extractedText ||
            "This document has no extracted content."}
        </div>
      )}
    </div>
  );
}

const pageConfig = {
  "/quiz": {
    icon: Brain,
    title: "Quiz Generator",
    desc: "Auto-generate quizzes from your Document documents to test comprehension.",
    emptyTitle: "No quizzes generated",
    emptyDesc: "Select a document and generate a quiz to test your knowledge.",
  },
  "/mindmaps": {
    icon: Map,
    title: "Mind Maps",
    desc: "Visualize document structure and key concepts with AI-generated mind maps.",
    emptyTitle: "No mind maps yet",
    emptyDesc: "Generate a mind map from any of your uploaded documents.",
  },
  "/notes": {
    icon: StickyNote,
    title: "Smart Notes",
    desc: "AI-assisted notes that highlight key points and organize your thoughts.",
    emptyTitle: "No notes yet",
    emptyDesc: "Notes you create while reading Documents will appear here.",
  },
  "/highlights": {
    icon: Highlighter,
    title: "Highlights",
    desc: "All your highlighted text across documents in one place.",
    emptyTitle: "No highlights yet",
    emptyDesc:
      "Highlight text while reading Documents and they will appear here.",
  },
  "/bookmarks": {
    icon: Bookmark,
    title: "Bookmarks",
    desc: "Saved pages and important sections from your documents.",
    emptyTitle: "No bookmarks yet",
    emptyDesc:
      "Bookmark important pages while reading to revisit them quickly.",
  },
  "/help": {
    icon: HelpCircle,
    title: "Help Center",
    desc: "Documentation, tutorials, and support resources.",
    emptyTitle: "Help documentation loading",
    emptyDesc: "Help articles will be available after backend integration.",
  },
  "/storage": {
    icon: Brain,
    title: "Storage",
    desc: "Manage your document storage and usage.",
    emptyTitle: "Storage data unavailable",
    emptyDesc: "Storage analytics will appear after backend integration.",
  },
  "/billing": {
    icon: Sparkles,
    title: "Billing",
    desc: "Manage your subscription and billing information.",
    emptyTitle: "No billing data",
    emptyDesc:
      "Billing history and subscription details will appear after backend integration.",
  },
  "/trash": {
    icon: Sparkles,
    title: "Trash",
    desc: "Deleted documents are stored here for 30 days.",
    emptyTitle: "Trash is empty",
    emptyDesc:
      "Deleted documents will appear here before being permanently removed.",
  },
  "/collections": {
    icon: Brain,
    title: "Collections",
    desc: "Organize your documents into curated collections.",
    emptyTitle: "No collections yet",
    emptyDesc:
      "Create collections to organize your documents by topic or project.",
  },
  "/shared": {
    icon: Sparkles,
    title: "Shared Documents",
    desc: "Documents shared with you or by you.",
    emptyTitle: "No shared documents",
    emptyDesc:
      "Documents shared with you or that you have shared will appear here.",
  },
  "/favorites": {
    icon: Sparkles,
    title: "Favorites",
    desc: "Your starred documents for quick access.",
    emptyTitle: "No favorites yet",
    emptyDesc: "Star documents to add them to your favorites for quick access.",
  },
  "/viewer": {
    icon: Brain,
    title: "Document Viewer",
    desc: "View and annotate your Document documents.",
    emptyTitle: "No document selected",
    emptyDesc: "Select a document from your library to open it in the viewer.",
  },
};

function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    collectionApi
      .list()
      .then((res) => setCollections(res.collections || []))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const create = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      const response = await collectionApi.create({ name });
      setCollections((items) => [response.collection, ...items]);
      setName("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize your documents into focused workspaces.
        </p>
      </div>
      <form onSubmit={create} className="flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New collection name"
          className="flex-1 h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
        />
        <button className="px-4 rounded-lg bg-primary text-white text-sm font-medium">
          Create
        </button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        {collections.map((collection) => (
          <div
            key={collection._id}
            className="bg-card border border-border rounded-xl p-4"
          >
            <h2 className="font-semibold text-foreground">{collection.name}</h2>
            <p className="text-xs text-muted-foreground mt-2">
              {collection.documentIds?.length || 0} documents
            </p>
          </div>
        ))}
      </div>
      {!collections.length && !error && (
        <EmptyState
          icon={Map}
          title="No collections yet"
          description="Create a collection to organize your documents."
        />
      )}
    </div>
  );
}

function BillingPage() {
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    billingApi
      .config()
      .then(setConfig)
      .catch((error) => setMessage(error.message));
  }, []);

  const upgrade = async () => {
    setLoading(true);
    setMessage("");
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error("Unable to load Razorpay checkout"));
        document.body.appendChild(script);
      });
      const { order } = await billingApi.createOrder();
      const payment = await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: config.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Documind Ai",
          description: "Pro plan",
          order_id: order.id,
          handler: resolve,
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        checkout.on("payment.failed", () =>
          reject(new Error("Payment failed")),
        );
        checkout.open();
      });
      const result = await billingApi.verify(payment);
      setMessage(result.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your Documind Ai plan.
        </p>
      </div>
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Pro Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unlimited AI summaries and advanced tools.
          </p>
        </div>
        <button
          disabled={!config?.configured || loading}
          onClick={upgrade}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upgrade with Razorpay"}
        </button>
      </div>
      {message && (
        <p role="alert" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {config && !config.configured && (
        <p className="text-sm text-amber-600">
          Razorpay is not configured. Add RAZORPAY_KEY_ID and
          RAZORPAY_KEY_SECRET to the backend environment.
        </p>
      )}
    </div>
  );
}

function AIToolsPage() {
  const { pathname } = useLocation();
  const [documents, setDocuments] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [error, setError] = useState("");
  const [generation, setGeneration] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  useEffect(() => {
    if (pathname !== "/storage") return;
    setLoading(true);
    userApi
      .storage()
      .then((response) => setData(response.storage))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [pathname]);

  const config = pageConfig[pathname] || {
    icon: Sparkles,
    title: "Coming Soon",
    desc: "This feature is being built.",
    emptyTitle: "Feature unavailable",
    emptyDesc: "This page will be available after backend integration.",
  };

  const { icon: Icon, title, desc, emptyTitle, emptyDesc } = config;

  useEffect(() => {
    if (pathname === "/storage") return;
    const load = async () => {
      try {
        const res = await documentApi.list();
        const nextDocuments = res.documents || [];
        setDocuments(nextDocuments);
        setSelectedDoc((current) => current || nextDocuments[0]?._id || "");
        if (!nextDocuments.length) setData(null);
      } catch (error) {
        console.error("AI page data load failed", error);
        setError(error.message || "Unable to load documents");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    load();
  }, [pathname]);

  useEffect(() => {
    const generate = async () => {
      if (
        !selectedDoc ||
        pathname === "/storage" ||
        !["/quiz", "/mindmaps", "/notes", "/highlights", "/bookmarks"].includes(
          pathname,
        )
      )
        return;
      setLoading(true);
      setError("");
      try {
        const response =
          pathname === "/quiz"
            ? await aiApi.quiz(selectedDoc)
            : pathname === "/mindmaps"
              ? await aiApi.mindmap(selectedDoc)
              : pathname === "/notes"
                ? await aiApi.notes(selectedDoc)
                : pathname === "/highlights"
                  ? await aiApi.highlights(selectedDoc)
                  : await aiApi.bookmarks(selectedDoc);
        setData(
          response.quiz ||
            response.data ||
            response.notes ||
            response.highlights ||
            response.bookmarks ||
            null,
        );
        setQuizAnswers({});
      } catch (requestError) {
        setData(null);
        setError(requestError.message || "Unable to generate content");
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [pathname, selectedDoc, generation]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-md">
            <select
              value={selectedDoc}
              onChange={(event) => setSelectedDoc(event.target.value)}
              className="w-full h-10 appearance-none rounded-lg border border-border bg-card px-3 pr-9 text-sm text-foreground"
            >
              {documents.map((document) => (
                <option key={document._id} value={document._id}>
                  {document.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setGeneration((value) => value + 1)}
            className="h-10 px-3 rounded-lg border border-border text-sm bg-background text-foreground hover:bg-muted"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading AI-generated content...
          </p>
        ) : pathname === "/storage" && data ? (
          <div className="space-y-3">
            <p className="text-2xl font-bold text-foreground">
              {(data.bytes / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p className="text-sm text-muted-foreground">
              {data.documentCount} active document
              {data.documentCount === 1 ? "" : "s"} in your workspace.
            </p>
          </div>
        ) : data ? (
          <div className="space-y-3">
            {pathname === "/quiz" && data.questions && (
              <div className="space-y-3">
                {data.questions.map((question, idx) => (
                  <div
                    key={question.id || idx}
                    className="rounded-lg border border-border p-3"
                  >
                    <p className="font-medium text-foreground">
                      {idx + 1}. {question.question}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {question.options.map((option, i) => {
                        const selected = quizAnswers[question.id];
                        const answered = selected !== undefined;
                        const correct = option === question.answer;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setQuizAnswers((answers) => ({
                                ...answers,
                                [question.id]: option,
                              }))
                            }
                            className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                              answered && correct
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                                : answered && selected === option
                                  ? "border-destructive bg-destructive/10 text-destructive"
                                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {quizAnswers[question.id] !== undefined && (
                      <p className="mt-3 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Evidence:{" "}
                        </span>
                        {question.evidence}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {pathname === "/mindmaps" && data.nodes && (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">{data.root}</p>
                {data.nodes.map((node) => (
                  <span
                    key={node.id}
                    className="inline-block mr-2 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground"
                  >
                    {node.label}
                  </span>
                ))}
              </div>
            )}
            {pathname === "/notes" && data.notes && (
              <div className="space-y-2">
                {data.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded border border-border p-3"
                  >
                    <p className="font-medium text-foreground">
                      {note.heading}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {pathname === "/highlights" && data.length > 0 && (
              <div className="space-y-2">
                {data.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="rounded border border-border p-3 bg-yellow-500/5"
                  >
                    {highlight.text}
                  </div>
                ))}
              </div>
            )}
            {pathname === "/bookmarks" && data.length > 0 && (
              <div className="space-y-2">
                {data.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="rounded border border-border p-3"
                  >
                    <p className="font-medium text-foreground">
                      {bookmark.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bookmark.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState icon={Icon} title={emptyTitle} description={emptyDesc} />
        )}
      </div>
    </div>
  );
}

export default function GenericAIPage() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/shared/")) return <SharedDocumentPage />;

  if (pathname === "/collections") return <CollectionsPage />;
  if (pathname === "/billing") return <BillingPage />;

  if (["/favorites", "/shared", "/trash"].includes(pathname)) {
    const config = {
      "/favorites": {
        title: "Favorites",
        emptyTitle: "No favorites yet",
        emptyDesc: "Star documents to add them to your favorites.",
        scope: "favorites",
      },
      "/shared": {
        title: "Shared Documents",
        emptyTitle: "No shared documents",
        emptyDesc: "Documents shared with you will appear here.",
        scope: "shared",
      },
      "/trash": {
        title: "Trash",
        emptyTitle: "Trash is empty",
        emptyDesc: "Deleted documents are stored here for 30 days.",
        scope: "trash",
      },
    }[pathname];

    return <Documents {...config} />;
  }

  return <AIToolsPage />;
}
