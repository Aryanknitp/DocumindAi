import { Globe, GitBranch } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function OAuthLoginButtons() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  // handle the github login with api_base
  const handleGithubLogin = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  return (
    <div className="w-full space-y-3">
      <button
        onClick={handleGoogleLogin}
        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent transition-all"
      >
        <Globe size={18} />
        Continue with Google
      </button>

      <button
        onClick={handleGithubLogin}
        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent transition-all"
      >
        <GitBranch size={18} />
        Continue with GitHub
      </button>
    </div>
  );
}
