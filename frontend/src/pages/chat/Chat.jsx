import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  ChevronLeft,
  Copy,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { aiApi, documentApi } from "../../lib/api";

function MessageBubble({ message, onCopy }) {
  const { user } = useAuth();
  const isUser = message.role === "user";
  const messageParts = message.content.split(
    /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s)]+)/g,
  );
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <Avatar name={user?.name || "User"} src={user?.avatar} size="sm" />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <Brain size={16} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${isUser ? "bg-linear-to-br from-indigo-500 to-violet-500 text-white rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}
        >
          {messageParts.map((part, index) => {
            const markdownLink = part.match(
              /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/,
            );
            const url =
              markdownLink?.[2] || (part.startsWith("http") ? part : null);
            return url ? (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                {markdownLink?.[1] || url}
              </a>
            ) : (
              part
            );
          })}
        </div>
        {!isUser && (
          <button
            onClick={() => onCopy(message.content)}
            title="Copy response"
            className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

const promptTemplates = [
  "Summarize the main argument and supporting evidence.",
  "What are the most important facts, numbers, or decisions?",
  "List the risks, limitations, and unresolved questions.",
  "Turn the document into practical next steps.",
];

export default function Chat() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([documentApi.list(), aiApi.listSessions()])
      .then(([documentResponse, sessionResponse]) => {
        setDocuments(documentResponse.documents || []);
        setSessions(sessionResponse.sessions || []);
      })
      .catch((requestError) =>
        setError(requestError.message || "Unable to load chat"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, sending]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || sending) return;
    setInput("");
    setError("");
    setSending(true);
    const optimistic = {
      role: "user",
      content: message,
      _id: `local-${Date.now()}`,
    };
    setActiveSession((current) => ({
      ...(current || { title: "New discussion", messages: [] }),
      messages: [...(current?.messages || []), optimistic],
    }));
    try {
      const response = await aiApi.sendChat({
        message,
        documentId: selectedDocumentId || undefined,
        sessionId: activeSession?._id,
      });
      setActiveSession(response.session);
      setSessions((current) => [
        response.session,
        ...current.filter((item) => item._id !== response.session._id),
      ]);
    } catch (requestError) {
      setActiveSession((current) => ({
        ...current,
        messages: (current?.messages || []).filter(
          (item) => item._id !== optimistic._id,
        ),
      }));
      setError(requestError.message || "Unable to generate an answer");
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async () => {
    if (!activeSession?._id) return setActiveSession(null);
    try {
      await aiApi.deleteSession(activeSession._id);
      setSessions((current) =>
        current.filter((item) => item._id !== activeSession._id),
      );
      setActiveSession(null);
    } catch (requestError) {
      setError(requestError.message || "Unable to delete conversation");
    }
  };

  const visibleSessions = sessions.filter((session) =>
    session.title?.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedDocument = documents.find(
    (document) => document._id === selectedDocumentId,
  );
  const choosePrompt = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden bg-background">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="space-y-3 border-b border-border p-4">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setActiveSession(null)}
            className="w-full"
          >
            <Plus size={14} /> New chat
          </Button>
          <label className="block text-xs font-medium text-muted-foreground">
            Document context
          </label>
          <select
            value={selectedDocumentId}
            onChange={(event) => {
              setSelectedDocumentId(event.target.value);
              setActiveSession(null);
              setError("");
            }}
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs"
          >
            <option value="">Choose a PDF or document...</option>
            {documents.map((document) => (
              <option key={document._id} value={document._id}>
                {document.title}
              </option>
            ))}
          </select>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {visibleSessions.map((session) => (
            <button
              key={session._id}
              onClick={() => {
                setActiveSession(session);
                setSelectedDocumentId(session.documentId || "");
              }}
              className={`mb-1 w-full rounded-lg px-3 py-2 text-left ${activeSession?._id === session._id ? "bg-secondary" : "hover:bg-muted"}`}
            >
              <p className="truncate text-sm font-medium text-foreground">
                {session.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session.messages?.at(-1)?.content || "No messages yet"}
              </p>
            </button>
          ))}
          {!loading && !visibleSessions.length && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No saved conversations
            </p>
          )}
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <button
            onClick={() => navigate("/dashboard")}
            title="Back to dashboard"
            className="text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500">
            <Brain size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">
              {selectedDocument?.title ||
                activeSession?.title ||
                "Document chat"}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {selectedDocument
                ? "Answers grounded in this document"
                : "Select a document for grounded answers"}
            </p>
          </div>
          <button
            onClick={deleteConversation}
            title="Delete conversation"
            className="ml-auto h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </header>
        <section className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <p
              role="alert"
              className="mx-auto mb-4 max-w-3xl rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}
          {!activeSession?.messages?.length && !sending ? (
            <div className="mx-auto flex h-full max-w-3xl items-center justify-center">
              <div className="w-full rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  {selectedDocument ? (
                    <FileText size={28} className="text-primary" />
                  ) : (
                    <MessageSquare size={28} className="text-primary" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedDocument
                    ? `Ask anything about ${selectedDocument.title}`
                    : "Start with a document"}
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  {selectedDocument
                    ? "Answers use relevant passages from the complete extracted document. If the source lacks evidence, web sources are added for review."
                    : "Choose an uploaded PDF from Document context to unlock grounded answers."}
                </p>
                {selectedDocument ? (
                  <div className="mt-6 grid gap-2 text-left sm:grid-cols-2">
                    {promptTemplates.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => choosePrompt(prompt)}
                        className="rounded-xl border border-border p-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Sparkles size={14} className="mb-2 text-primary" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Button
                    variant="gradient"
                    size="md"
                    onClick={() => navigate("/upload")}
                    className="mt-6"
                  >
                    <FileText size={15} /> Upload a document
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {activeSession.messages.map((message, index) => (
                <MessageBubble
                  key={message._id || index}
                  message={message}
                  onCopy={(text) => navigator.clipboard.writeText(text)}
                />
              ))}
              {sending && (
                <div className="text-sm text-muted-foreground">Thinking...</div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </section>
        <footer className="shrink-0 border-t border-border bg-card p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                selectedDocument
                  ? "Ask anything about this document..."
                  : "Select a document, then ask a question..."
              }
              disabled={!selectedDocument}
              rows={1}
              className="min-h-8 max-h-32 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending || !selectedDocument}
              title="Send message"
              className="h-9 w-9 shrink-0 rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 text-white disabled:opacity-40"
            >
              <Send size={14} className="mx-auto" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Answers are based on the selected document content. Verify important
            information.
          </p>
        </footer>
      </main>
    </div>
  );
}
