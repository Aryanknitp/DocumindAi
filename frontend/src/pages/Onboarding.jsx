import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  FileText,
  MessageSquare,
  Sparkles,
  BookOpen,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Button from "../components/ui/Button";

const slides = [
  {
    icon: FileText,
    gradient: "from-indigo-500 to-violet-500",
    title: "Upload any Document",
    desc: "Drag and drop your documents — research papers, books, contracts, or reports. We support Document, DOCX, and TXT.",
  },
  {
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-500",
    title: "AI-powered summaries",
    desc: "Get concise, accurate summaries in seconds. Choose from 11 different summary styles tailored to your needs.",
  },
  {
    icon: MessageSquare,
    gradient: "from-sky-500 to-blue-500",
    title: "Chat with your Document",
    desc: "Ask questions in natural language and get instant, accurate answers powered by advanced AI technology.",
  },
  {
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-500",
    title: "Study smarter",
    desc: "Auto-generate flashcards, quizzes, and mind maps. Transform any document into an interactive learning experience.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem("onboarding_seen", "1");
      navigate("/landing");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_seen", "1");
    navigate("/landing");
  };

  const current = slides[step];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Skip */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:bg-muted"
          >
            Skip
          </button>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-8 animate-fade-in" key={step}>
          <div
            className={`h-28 w-28 rounded-3xl bg-linear-to-br ${current.gradient} flex items-center justify-center shadow-2xl animate-float`}
          >
            <Icon size={56} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div
          className="text-center mb-10 animate-fade-in"
          key={`content-${step}`}
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">
            {current.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {current.desc}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all ${i === step ? "w-6 h-2 bg-primary" : "w-2 h-2bg-border"}`}
            />
          ))}
        </div>

        <Button
          variant="gradient"
          size="xl"
          onClick={handleNext}
          className="w-full"
        >
          {step < slides.length - 1 ? (
            <>
              Next <ChevronRight size={18} />
            </>
          ) : (
            <>
              Get started <ArrowRight size={18} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
