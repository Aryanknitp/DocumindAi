import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authApi } from "../../lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Minimum 8 characters required");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("This reset link is invalid or missing");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: form.password });
      setDone(true);
    } catch (requestError) {
      setError(requestError.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password has been successfully reset"
      >
        <div className="text-center py-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            You can now sign in with your new password.
          </p>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Go to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password for your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type={show ? "text" : "password"}
          placeholder="New strong password"
          icon={Lock}
          value={form.password}
          onChange={(e) => {
            setForm((p) => ({ ...p, password: e.target.value }));
            setError("");
          }}
          rightElement={
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="text-muted-foreground"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <Input
          label="Confirm password"
          type={show ? "text" : "password"}
          placeholder="Repeat password"
          icon={Lock}
          value={form.confirm}
          onChange={(e) => {
            setForm((p) => ({ ...p, confirm: e.target.value }));
            setError("");
          }}
          error={error}
        />
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
