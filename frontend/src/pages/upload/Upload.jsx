import { useState, useRef, useCallback } from "react";
import {
  Upload as UploadIcon,
  FileText,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Cloud,
  File,
  Trash2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { documentApi } from "../../lib/api";

const ACCEPTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ACCEPTED_EXT = [".pdf", ".docx", ".txt"];
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function FileItem({ file, onRemove, onRetry }) {
  const statusBadge = {
    pending: <Badge variant="default">Pending</Badge>,
    uploading: <Badge variant="warning">Uploading…</Badge>,
    success: <Badge variant="success">Uploaded</Badge>,
    error: <Badge variant="error">Failed</Badge>,
    unsupported: <Badge variant="error">Unsupported</Badge>,
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl animate-fade-in">
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
          file.status === "success"
            ? "bg-emerald-500/10"
            : file.status === "error" || file.status === "unsupported"
              ? "bg-red-500/10"
              : "bg-secondary"
        }`}
      >
        {file.status === "success" ? (
          <CheckCircle size={20} className="text-emerald-500" />
        ) : file.status === "error" || file.status === "unsupported" ? (
          <AlertCircle size={20} className="text-red-500" />
        ) : (
          <FileText size={20} className="text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {file.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {formatSize(file.size)}
          </span>
          {statusBadge[file.status]}
        </div>
        {file.status === "uploading" && (
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${file.progress || 0}%` }}
            />
          </div>
        )}
        {file.errorMsg && (
          <p className="mt-1 text-xs text-destructive">{file.errorMsg}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {file.status === "error" && (
          <button
            onClick={() => onRetry(file.id)}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
          >
            <RefreshCw size={14} />
          </button>
        )}
        <button
          onClick={() => onRemove(file.id)}
          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500"
        >
          {file.status === "success" ? <Trash2 size={14} /> : <X size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback((rawFiles) => {
    const newFiles = Array.from(rawFiles).map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: f.size,
      type: f.type,
      status: !ACCEPTED.includes(f.type.toLowerCase())
        ? "unsupported"
        : f.size > MAX_SIZE
          ? "error"
          : "pending",
      errorMsg: !ACCEPTED.includes(f.type.toLowerCase())
        ? "File type not supported"
        : f.size > MAX_SIZE
          ? "File exceeds 50 MB limit"
          : null,
      progress: 0,
      file: f,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeFile = (id) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const retryFile = (id) =>
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "pending", progress: 0 } : f,
      ),
    );

  const clearAll = () => setFiles([]);

  const startUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (!pendingFiles.length) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending"
          ? { ...f, status: "uploading", progress: 10 }
          : f,
      ),
    );

    for (const f of pendingFiles) {
      try {
        await documentApi.upload(f.file);
        setFiles((prev) =>
          prev.map((item) =>
            item.id === f.id
              ? { ...item, status: "success", progress: 100 }
              : item,
          ),
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((item) =>
            item.id === f.id
              ? {
                  ...item,
                  status: "error",
                  errorMsg: error.message || "Upload failed",
                }
              : item,
          ),
        );
      }
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Supports PDF, DOCX, and TXT files up to 50 MB.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 h-56 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
          ${
            dragging
              ? "border-primary bg-secondary scale-[1.01]"
              : "border-border hover:border-primary/60 hover:bg-muted"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXT.join(",")}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div
          className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all ${dragging ? "bg-primary animate-bounce" : "bg-secondary"}`}
        >
          <Cloud
            size={28}
            className={dragging ? "text-white" : "text-primary"}
          />
        </div>

        <div className="text-center">
          <p className="font-semibold text-foreground">
            {dragging ? "Drop to upload" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse files
          </p>
        </div>

        <div className="flex gap-2">
          {["PDF", "DOCX", "TXT"].map((ext) => (
            <span
              key={ext}
              className="px-2 py-1 rounded-md bg-card border border-border text-xs font-mono text-muted-foreground"
            >
              .{ext.toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {/* File queue */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} queued
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground"
              >
                <Trash2 size={13} /> Clear all
              </Button>
              {pendingCount > 0 && (
                <Button variant="gradient" size="sm" onClick={startUpload}>
                  <UploadIcon size={13} /> Upload {pendingCount} file
                  {pendingCount !== 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {files.map((f) => (
              <FileItem
                key={f.id}
                file={f}
                onRemove={removeFile}
                onRetry={retryFile}
              />
            ))}
          </div>

          {successCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={16} />
              {successCount} document{successCount !== 1 ? "s" : ""} uploaded
              successfully. They are being processed by AI.
            </div>
          )}
        </div>
      )}

      {/* Empty info */}
      {files.length === 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              title: "Any Document",
              desc: "Research papers, books, reports, contracts",
            },
            {
              icon: File,
              title: "Word Documents",
              desc: "DOCX files from Word or Google Docs",
            },
            {
              icon: Cloud,
              title: "Text Files",
              desc: "Plain text files and transcripts",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <Icon size={24} className="text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
