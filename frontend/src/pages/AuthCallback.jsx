import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const provider = params.get("provider");
    if (!token) {
      navigate("/login");
      return undefined;
    }

    let cancelled = false;
    const finishLogin = async () => {
      try {
        localStorage.setItem("auth_provider", provider || "unknown");
        await completeOAuthLogin(token);
        if (!cancelled) navigate("/dashboard", { replace: true });
      } catch (requestError) {
        if (!cancelled) {
          localStorage.removeItem("auth_provider");
          setError(requestError.message || "Unable to complete authentication");
        }
      }
    };

    finishLogin();
    return () => {
      cancelled = true;
    };
  }, [completeOAuthLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-border border-b-primary mx-auto mb-4"></div>
        <p className="text-foreground text-lg font-medium">
          {error || "Completing authentication..."}
        </p>
        {error && (
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Return to login
          </button>
        )}
      </div>
    </div>
  );
}
