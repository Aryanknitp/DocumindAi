import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authApi } from "../../lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (requestError) {
      setError(requestError.message || "Unable to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`We sent a reset link to ${email}`}
        formAlignment="left"
      >
        <div className="text-center py-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-emerald-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Didn't receive it? Check your spam folder or try again.
          </p>
          <Button
            variant="outline"
            onClick={() => setSent(false)}
            className="w-full"
          >
            Resend email
          </Button>
          <button
            onClick={() => navigate("/login")}
            className="mt-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto"
          >
            <ArrowLeft size={14} /> Back to login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      formAlignment="left"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="youremail@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          loading={loading}
          className="w-full"
        >
          <Send size={16} /> Send reset link
        </Button>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto"
        >
          <ArrowLeft size={14} /> Back to login
        </button>
      </form>
    </AuthLayout>
  );
}
