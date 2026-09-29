import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Sparkles,
  MessageSquare,
  Search,
  BookOpen,
  Map,
  StickyNote,
  Highlighter,
  Bookmark,
  Globe,
  Download,
  Shield,
  Zap,
  FileText,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight,
  Play,
  Check,
  Lock,
  Database,
  Cpu,
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import Button from "../components/ui/Button";

const features = [
  {
    icon: Sparkles,
    title: "AI Document Summary",
    desc: "Generate concise summaries in seconds. Choose from short, detailed, bullet-point, or executive formats.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Chat with Document",
    desc: "Ask questions about your document and get instant, accurate answers backed by AI.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Search,
    title: "Semantic Search",
    desc: "Find exactly what you need with AI-powered semantic search across all your documents.",
    color: "from-sky-500 to-cyan-600",
  },
  {
    icon: BookOpen,
    title: "Flashcards",
    desc: "Automatically generate study flashcards from any Document to accelerate learning.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Brain,
    title: "Quiz Generator",
    desc: "Create intelligent quizzes to test comprehension and reinforce knowledge.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Map,
    title: "Mind Maps",
    desc: "Visualize document structure and key concepts with auto-generated mind maps.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: StickyNote,
    title: "Smart Notes",
    desc: "AI-assisted note-taking that highlights key points and organizes your thoughts.",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: Highlighter,
    title: "Highlights",
    desc: "Mark and revisit important sections across all your documents with ease.",
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: Bookmark,
    title: "Bookmarks",
    desc: "Save important pages and jump back instantly with smart bookmarks.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Globe,
    title: "Multi-language",
    desc: "Read and extract insights from Documents in 50+ languages with automatic translation.",
    color: "from-teal-500 to-green-600",
  },
  {
    icon: Download,
    title: "Export Center",
    desc: "Export summaries, notes, and flashcards to Document, Word, Markdown, or JSON.",
    color: "from-slate-500 to-gray-600",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    desc: "Enterprise-grade encryption protects your documents at rest and in transit.",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    desc: "Upload and process large Documents in seconds with our distributed AI infrastructure.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: Cpu,
    title: "AI Insights",
    desc: "Surface hidden connections and key insights across your entire document library.",
    color: "from-purple-500 to-violet-600",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload your Document",
    desc: "Drag and drop or browse to upload any Document, DOCX, or TXT file. We process it instantly.",
  },
  {
    step: "02",
    title: "AI processes your document",
    desc: "Our AI analyzes structure, extracts key information, and prepares intelligent responses.",
  },
  {
    step: "03",
    title: "Chat, summarize, learn",
    desc: "Ask questions, generate summaries, create flashcards — all from one powerful workspace.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "0",
    desc: "Perfect to get started",
    features: [
      "5 Documents / month",
      "10 AI summaries",
      "Basic chat",
      "Community support",
    ],
    cta: "Start free",
    variant: "outline",
  },
  {
    name: "Pro",
    price: "19",
    desc: "For power users",
    features: [
      "Unlimited Documents",
      "Unlimited AI summaries",
      "Advanced chat",
      "Flashcards & quizzes",
      "Priority support",
      "API access",
    ],
    cta: "Start Pro trial",
    variant: "gradient",
    popular: true,
  },
  // {
  //   name: "Team",
  //   price: "49",
  //   desc: "For collaborative teams",
  //   features: [
  //     "Everything in Pro",
  //     "Team workspaces",
  //     "Shared collections",
  //     "Admin dashboard",
  //     "SSO & SAML",
  //     "Dedicated support",
  //   ],
  //   cta: "Contact sales",
  //   variant: "outline",
  // },
];

const faqs = [
  {
    q: "What file formats does Documind Ai support?",
    a: "We support Document, DOCX, and TXT files. Document support covers all versions, including scanned documents processed via OCR.",
  },
  {
    q: "How accurate are the AI summaries?",
    a: "Our AI models are trained on diverse academic and professional content. Accuracy depends on document quality, but we consistently achieve high precision across all summary modes.",
  },
  {
    q: "Is my data secure and private?",
    a: "All documents are encrypted at rest and in transit using AES-256. We never use your documents to train our models. Documents are automatically deleted after your retention period.",
  },
  {
    q: "Can I use Documind Ai for academic research?",
    a: "Absolutely. Researchers use DocuMind to process papers, extract citations, generate literature summaries, and create study materials at scale.",
  },
  {
    q: "Is there an API for developers?",
    a: "Yes, Pro and Team plans include API access with comprehensive documentation, SDKs for Python and JavaScript, and webhook support.",
  },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 glass border-b border-border shadow-sm" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              DocuMind <span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            {[
              "Features",
              "Solutions",
              "Documentation",
              "About",
              "Pricing",
              "Contact",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" size="sm">
                  Get started
                </Button>
              </Link>
            </div>
            <button
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-card border-b border-border px-6 py-4 space-y-3 animate-fade-in">
            {[
              "Features",
              "Solutions",
              "Pricing",
              "Documentation",
              "About",
              "Contact",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {item}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="md" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button variant="gradient" size="md" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-150 w-150 rounded-full bg-linear-to-r from-indigo-500/10 to-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/5 blur-2xl" />
          <div className="absolute top-20 right-10 h-60 w-60 rounded-full bg-indigo-500/5 blur-2xl" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(99,102,241,0.08) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-secondary text-xs font-medium text-primary mb-8 animate-fade-in">
            <Sparkles size={12} />
            Powered by Advanced AI — Trusted by 50,000+ users
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Transform Documents into
            <br />
            <span className="gradient-text">AI-Powered Insights</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Summarize, chat, study, and extract knowledge from any Document
            document. Documind Ai is your all-in-one intelligent document
            workspace.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link to="/upload">
              <Button
                variant="gradient"
                size="xl"
                className="gap-2 animate-pulse-glow"
              >
                <FileText size={18} /> Upload Document — Free
              </Button>
            </Link>
            <a href="#solutions">
              <Button variant="outline" size="xl" className="gap-2">
                <Play size={16} /> Watch demo
              </Button>
            </a>
          </div>

          {/* Animated AI Illustration */}
          <div
            className="relative mx-auto max-w-4xl animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden ai-glow">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 h-5 rounded bg-border mx-4" />
                <div className="h-5 w-24 rounded bg-border" />
              </div>

              {/* Dashboard preview */}
              <div className="flex h-64 sm:h-96">
                {/* Sidebar preview */}
                <div className="hidden sm:flex flex-col w-48 border-r border-border p-3 gap-1">
                  {[
                    "Dashboard",
                    "My Documents",
                    "AI Summary",
                    "Chat with Document",
                    "Flashcards",
                  ].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${i === 0 ? "bg-secondary text-primary" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`h-3 w-3 rounded-sm ${i === 0 ? "bg-primary" : "bg-border"}`}
                      />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main area */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="flex gap-3">
                    {[
                      ["Total Documents", "0"],
                      ["Summaries", "0"],
                      ["Chats", "0"],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        className="flex-1 bg-muted rounded-lg p-3"
                      >
                        <div className="text-xs text-muted-foreground">
                          {label}
                        </div>
                        <div className="text-xl font-bold gradient-text">
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 h-28">
                    <div className="flex-1 bg-muted rounded-xl p-3 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground text-center">
                        Upload your first Document to get started
                      </p>
                    </div>
                    <div className="w-40 bg-linear-to-br from-indigo-500/10 to-violet-500/10 border border-primary/20 rounded-xl p-3 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5">
                        <Brain size={14} className="text-primary" />
                        <span className="text-xs font-medium text-primary">
                          AI Ready
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Your AI workspace is ready
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl px-3 py-2 shadow-lg animate-float hidden sm:flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-xs font-medium">Summary generated</span>
            </div>
            <div
              className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-3 py-2 shadow-lg animate-float hidden sm:flex items-center gap-2"
              style={{ animationDelay: "1s" }}
            >
              <Brain size={14} className="text-primary" />
              <span className="text-xs font-medium">AI processing...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-primary mb-4">
              <Sparkles size={12} /> Powerful Features
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to master any Document
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              14 AI-powered tools to read, understand, and learn from documents
              faster than ever before.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200"
              >
                <div
                  className={`h-10 w-10 rounded-lg bg-linear-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1.5">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="solutions" className="py-24 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">
              From upload to insight in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                  <span className="font-black text-white text-sm mono">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-primary mb-6">
                <Lock size={12} /> Enterprise Security
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Your documents are safe with us
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We take data privacy seriously. Your documents are never used to
                train AI models, and you retain full ownership.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Shield,
                    title: "AES-256 Encryption",
                    desc: "End-to-end encryption for all documents",
                  },
                  {
                    icon: Lock,
                    title: "Zero-Knowledge Storage",
                    desc: "We cannot read your documents",
                  },
                  {
                    icon: Database,
                    title: "GDPR & CCPA Compliant",
                    desc: "Full regulatory compliance globally",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-linear-to-br from-indigo-500/10 to-violet-500/10 border border-primary/20 rounded-2xl p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30 animate-pulse-glow">
                  <Shield size={36} className="text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2">SOC 2 Type II</h3>
                <p className="text-sm text-muted-foreground">
                  Certified security infrastructure
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {["GDPR", "CCPA", "HIPAA Ready", "ISO 27001"].map((cert) => (
                    <div
                      key={cert}
                      className="bg-card border border-border rounded-lg py-2 text-xs font-medium text-center"
                    >
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section id="documentation" className="py-24 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Documentation
            </p>
            <h2 className="text-4xl font-bold mb-4">
              A clear path from upload to insight
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Upload a PDF, DOCX, or TXT file, then use summaries, chat,
              quizzes, flashcards, notes, highlights, and bookmarks from your
              workspace.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              [
                "Upload",
                "Add a document from the Upload page and wait for text extraction to finish.",
              ],
              [
                "Understand",
                "Choose a summary mode or ask grounded questions in Chat with Document.",
              ],
              [
                "Learn",
                "Generate study material and organize important sections for later.",
              ],
            ].map(([title, description], index) => (
              <div
                key={title}
                className="bg-card border border-border rounded-xl p-5"
              >
                <span className="text-xs font-bold text-primary">
                  0{index + 1}
                </span>
                <h3 className="font-semibold mt-3 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
          <Link to="/register" className="inline-flex mt-8">
            <Button variant="gradient">
              Open your workspace <ArrowRight size={15} />
            </Button>
          </Link>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              About Documind Ai
            </p>
            <h2 className="text-4xl font-bold mb-4">
              Make every document easier to use
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Documind Ai brings reading, research, study, and document
              organization into one focused workspace. It is designed to help
              people move from long files to useful understanding with less
              friction.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["14", "AI tools"],
              ["3", "Supported formats"],
              ["1", "Focused workspace"],
              ["24/7", "Available"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-5"
              >
                <p className="text-2xl font-bold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-5 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 ">
            {pricingTiers.map(
              ({
                name,
                price,
                desc,
                features: feats,
                cta,
                variant,
                popular,
              }) => (
                <div
                  key={name}
                  className={`relative bg-card border rounded-2xl p-6 ${popular ? "border-primary shadow-xl shadow-primary/10" : "border-border"}`}
                >
                  {popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-linear-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold">
                      Most popular
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-1">{name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black">${price}</span>
                    <span className="text-muted-foreground text-sm">
                      /month
                    </span>
                  </div>
                  <Link to="/register">
                    <Button variant={variant} size="md" className="w-full mb-6">
                      {cta}
                    </Button>
                  </Link>
                  <ul className="space-y-3">
                    {feats.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check size={14} className="text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 bg-muted">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Contact
          </p>
          <h2 className="text-4xl font-bold mb-4">Have a question?</h2>
          <p className="text-muted-foreground mb-8">
            Start with the workspace for product use, or contact the team about
            plans and collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:support@documind.ai">
              <Button variant="gradient">Email support</Button>
            </a>
            <Link to="/register">
              <Button variant="outline">Try Documind Ai</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-primary mb-6">
            <Star size={12} /> User Reviews
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Loved by researchers, students, and professionals
          </h2>
          <p className="text-muted-foreground mb-12">
            User testimonials and reviews will appear here after launch.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 text-left"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <div className="h-3 bg-muted rounded mb-2 w-full" />
                <div className="h-3 bg-muted rounded mb-2 w-4/5" />
                <div className="h-3 bg-muted rounded w-3/5" />
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-secondary" />
                  <div>
                    <div className="h-2.5 bg-muted rounded w-24 mb-1" />
                    <div className="h-2 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Reviews will be populated from your backend after collecting user
            feedback.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-muted">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-medium text-sm">{q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted transition-transform ${activeFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in border-t border-border pt-3">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-linear-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-12 text-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to transform how you read?
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                Join thousands of users who save hours every week with
                AI-powered document intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={name === "Team" ? "#contact" : "/register"}>
                  <Button
                    size="xl"
                    className="bg-white text-indigo-700 hover:bg-white/90 font-semibold"
                  >
                    Start free — no credit card <ArrowRight size={16} />
                  </Button>
                </a>
                <Link to="/login">
                  <Button
                    size="xl"
                    className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Brain size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg">
                  DocuMind <span className="text-primary">AI</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                AI-powered document intelligence platform. Summarize, chat, and
                learn from any Document.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Documentation", "Solutions"],
              },
              {
                title: "Company",
                links: ["About", "Contact"],
              },
              {
                title: "Legal",
                links: ["Security", "Privacy"],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href={
                          link === "Documentation"
                            ? "#documentation"
                            : link === "Solutions"
                              ? "#solutions"
                              : link === "Features"
                                ? "#features"
                                : link === "Pricing"
                                  ? "#pricing"
                                  : link === "About"
                                    ? "#about"
                                    : link === "Contact"
                                      ? "#contact"
                                      : link === "Security"
                                        ? "/login"
                                        : "#contact"
                        }
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2026 Documind Ai. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <p className="text-xs text-muted-foreground">
                Made with AI, for humans
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
