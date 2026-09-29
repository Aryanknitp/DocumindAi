import { useEffect, useState } from "react";
import {
  Sparkles,
  Copy,
  Download,
  Share2,
  RefreshCw,
  Printer,
  Globe,
  FileText,
  ChevronDown,
  Loader2,
  AlertCircle,
  Brain,
} from "lucide-react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { aiApi, documentApi } from "../../lib/api";

function SummaryContent({ text }) {
  return (
    <div className="space-y-3 text-sm leading-7 text-foreground">
      {text.split("\n").map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />;
        if (line.startsWith("## "))
          return (
            <h2 key={index} className="text-xl font-semibold leading-tight">
              {line.slice(3)}
            </h2>
          );
        if (line.startsWith("### "))
          return (
            <h3
              key={index}
              className="pt-2 text-sm font-semibold uppercase tracking-wide text-primary"
            >
              {line.slice(4)}
            </h3>
          );
        if (line.startsWith("- "))
          return (
            <div key={index} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

const modes = [
  { id: "short", label: "Short", desc: "~100 words" },
  { id: "medium", label: "Medium", desc: "~300 words" },
  { id: "detailed", label: "Detailed", desc: "~600 words" },
  { id: "bullets", label: "Bullet Points", desc: "Key points" },
  { id: "executive", label: "Executive", desc: "C-suite format" },
  { id: "academic", label: "Academic", desc: "Scholarly tone" },
  { id: "research", label: "Research", desc: "Citation-ready" },
  { id: "technical", label: "Technical", desc: "Technical depth" },
  { id: "business", label: "Business", desc: "Action-oriented" },
  { id: "legal", label: "Legal", desc: "Legal language" },
  { id: "medical", label: "Medical", desc: "Clinical format" },
];

const states = {
  idle: "idle",
  loading: "loading",
  streaming: "streaming",
  success: "success",
  error: "error",
};

export default function AISummary() {
  const [mode, setMode] = useState("medium");
  const [status, setStatus] = useState(states.idle);
  const [summary, setSummary] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const res = await documentApi.list();
        setDocuments(res.documents || []);
      } catch (error) {
        console.error("Failed to load documents for summary", error);
      }
    };
    loadDocuments();
  }, []);

  const handleGenerate = async () => {
    if (!selectedDoc) return;
    setStatus(states.loading);
    setSummary("");

    try {
      const response = await aiApi.generateSummary(selectedDoc, mode);
      setSummary(response.summary || "");
      setStatus(states.success);
    } catch (error) {
      setSummary(error.message || "Failed to generate summary.");
      setStatus(states.error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExport = () => {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documents.find((doc) => doc._id === selectedDoc)?.title || "summary"}-${mode}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      if (navigator.share)
        await navigator.share({ title: "Documind Ai Summary", text: summary });
      else await navigator.clipboard.writeText(summary);
      setNotice(
        navigator.share ? "Summary shared" : "Summary copied for sharing",
      );
    } catch (error) {
      if (error.name !== "AbortError") setNotice("Unable to share summary");
    }
    setTimeout(() => setNotice(""), 2500);
  };

  const handleTranslate = async () => {
    const language = window.prompt(
      "Translate summary to (for example: Spanish):",
      "Spanish",
    );
    if (!language || !selectedDoc) return;
    try {
      const response = await aiApi.translate(selectedDoc, language);
      setSummary(response.translatedText || summary);
      setNotice(`Translated to ${language}`);
    } catch (error) {
      setNotice(error.message || "Translation failed");
    }
    setTimeout(() => setNotice(""), 2500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Summary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate intelligent summaries from your documents
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Document selector */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText size={15} /> Select Document
            </h3>
            <div className="relative">
              <select
                value={selectedDoc || ""}
                onChange={(e) => setSelectedDoc(e.target.value || null)}
                className="w-full h-9 px-3 pr-8 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="">Choose a document...</option>
                {documents.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            {!selectedDoc && (
              <p className="text-xs text-muted-foreground mt-2">
                Upload documents first to enable summaries.
              </p>
            )}
          </div>

          {/* Mode selector */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles size={15} /> Summary Mode
            </h3>
            <div className="space-y-1">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    mode === m.id
                      ? "bg-secondary text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{m.label}</span>
                  <span className="text-xs opacity-60">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            onClick={handleGenerate}
            disabled={!selectedDoc}
            loading={status === states.loading}
            className="w-full"
          >
            <Sparkles size={16} />
            {status === states.loading ? "Generating…" : "Generate Summary"}
          </Button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl min-h-96 flex flex-col">
            {/* Actions */}
            {(status === states.success || status === states.streaming) && (
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground mr-auto">
                  {modes.find((m) => m.id === mode)?.label} Summary
                  {status === states.streaming && (
                    <span className="ml-2 inline-flex items-center gap-1 text-primary">
                      <Loader2 size={11} className="animate-spin" /> Streaming…
                    </span>
                  )}
                </span>
                {[
                  {
                    icon: Copy,
                    label: copied ? "Copied!" : "Copy",
                    action: handleCopy,
                  },
                  { icon: Download, label: "Export", action: handleExport },
                  {
                    icon: Printer,
                    label: "Print",
                    action: () => window.print(),
                  },
                  { icon: Share2, label: "Share", action: handleShare },
                  { icon: Globe, label: "Translate", action: handleTranslate },
                  {
                    icon: RefreshCw,
                    label: "Regenerate",
                    action: handleGenerate,
                  },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    title={label}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="min-h-0 max-h-[calc(100vh-12rem)] flex-1 overflow-y-auto p-5">
              {status === states.idle && (
                <EmptyState
                  icon={Sparkles}
                  title="No summary yet"
                  description="Select a document and summary mode, then click Generate to get an AI-powered summary."
                />
              )}
              {status === states.loading && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center animate-pulse-glow">
                    <Brain size={28} className="text-white animate-spin-slow" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      Analyzing document…
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This may take a few seconds
                    </p>
                  </div>
                </div>
              )}
              {(status === states.streaming || status === states.success) && (
                <div className="animate-fade-in">
                  <SummaryContent text={summary} />
                  {status === states.streaming && (
                    <span className="inline-block h-4 w-0.5 bg-primary animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              )}
              {status === states.error && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <AlertCircle size={32} className="text-destructive" />
                  <p className="font-medium text-foreground">
                    Failed to generate summary
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check your connection and try again.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    <RefreshCw size={13} /> Retry
                  </Button>
                </div>
              )}
            </div>
            {notice && (
              <p className="border-t border-border px-5 py-2 text-xs text-primary">
                {notice}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
