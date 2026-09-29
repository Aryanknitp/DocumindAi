import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  BookOpen,
  Building,
  Globe,
  ChevronRight,
  Camera,
} from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";

const useCases = [
  { id: "student", label: "Student", icon: "🎓" },
  { id: "researcher", label: "Researcher", icon: "🔬" },
  { id: "professional", label: "Professional", icon: "💼" },
  { id: "lawyer", label: "Legal", icon: "⚖️" },
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "other", label: "Other", icon: "✨" },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    org: "",
    website: "",
    useCase: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleFinish = async () => {
    setLoading(true);
    // API: await api.updateProfile(form)
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <AuthLayout
      title={step === 1 ? "Set up your profile" : "How will you use DocuMind?"}
      subtitle={
        step === 1
          ? "Tell us a bit about yourself"
          : "Help us personalize your experience"
      }
    >
      {step === 1 && (
        <div className="space-y-5">
          {/* Avatar upload */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar name={form.name || "User"} size="2xl" />
              <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                <Camera size={14} />
              </button>
            </div>
          </div>
          <Input
            label="Full name"
            placeholder="Jane Smith"
            icon={User}
            value={form.name}
            onChange={set("name")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={set("bio")}
              className="w-full rounded-lg border border-border bg-card text-sm px-3 py-2 resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Input
            label="Organization (optional)"
            placeholder="Your company or school"
            icon={Building}
            value={form.org}
            onChange={set("org")}
          />
          <Button
            variant="gradient"
            size="lg"
            onClick={() => setStep(2)}
            className="w-full"
          >
            Continue <ChevronRight size={16} />
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate("/dashboard")}
            className="w-full text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {useCases.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setForm((p) => ({ ...p, useCase: id }))}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all
                  ${
                    form.useCase === id
                      ? "border-primary bg-secondary text-primary"
                      : "border-border bg-card hover:border-primary/40"
                  }
                `}
              >
                <span className="text-2xl">{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <Button
            variant="gradient"
            size="lg"
            loading={loading}
            onClick={handleFinish}
            className="w-full"
          >
            Get started
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStep(1)}
            className="w-full text-muted-foreground"
          >
            Back
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
