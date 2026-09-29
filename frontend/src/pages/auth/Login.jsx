import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { OAuthLoginButtons } from "../../components/auth/OAuthButtons";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

export default function Login() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    const regex = /\S+@\S+\.\S+/;
    if (!form.email) e.email = "Email is required";
    else if (!regex.test(form.email)) e.email = "Invalid email address";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await login(form);
      toast({ message: "Welcome back!", type: "success" });
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (error) {
      toast({ message: error.message || "Login failed", type: "error" });
    }
  };

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Documind Ai account"
      altText="Don't have an account?"
      altLink="/register"
      altLinkText="Create one"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="youremail@gmail.com"
          icon={Mail}
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Your password"
          icon={Lock}
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          autoComplete="current-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-primary hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          loading={isLoading}
          className="w-full mt-2"
        >
          <LogIn size={16} />
          Sign in
        </Button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 text-muted-foreground">or continue with</span>
          </div>
        </div>
        <OAuthLoginButtons />
      </form>
    </AuthLayout>
  );
}
