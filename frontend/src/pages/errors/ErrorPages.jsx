import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Lock,
  ShieldOff,
  ServerCrash,
  Wrench,
  Home,
  ArrowLeft,
} from "lucide-react";
import Button from "../../components/ui/Button";

function ErrorPage({
  icon: Icon,
  code,
  title,
  desc,
  action,
  actionLabel,
  secondary,
  secondaryLabel,
  iconColor = "text-primary",
  bgColor = "bg-secondary",
}) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md animate-fade-in">
        <div
          className={`h-20 w-20 rounded-3xl ${bgColor} flex items-center justify-center mx-auto mb-6`}
        >
          <Icon size={36} className={iconColor} />
        </div>
        {code && (
          <p className="mono text-6xl font-black text-border mb-2">{code}</p>
        )}
        <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">{desc}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button variant="gradient" size="lg" onClick={action}>
              {actionLabel}
            </Button>
          )}
          {secondary && (
            <Button variant="outline" size="lg" onClick={secondary}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      icon={AlertTriangle}
      code="404"
      title="Page not found"
      desc="The page you are looking for doesn't exist or has been moved."
      action={() => navigate("/")}
      actionLabel="Go home"
      secondary={() => navigate(-1)}
      secondaryLabel="Go back"
    />
  );
}

export function Unauthorized() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      icon={Lock}
      code="401"
      title="Authentication required"
      desc="You need to be signed in to access this page."
      action={() => navigate("/login")}
      actionLabel="Sign in"
      iconColor="text-amber-500"
      bgColor="bg-amber-500/10"
    />
  );
}

export function Forbidden() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      icon={ShieldOff}
      code="403"
      title="Access denied"
      desc="You don't have permission to access this resource."
      action={() => navigate("/dashboard")}
      actionLabel="Go to dashboard"
      iconColor="text-red-500"
      bgColor="bg-red-500/10"
    />
  );
}

export function ServerError() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      icon={ServerCrash}
      code="500"
      title="Server error"
      desc="Something went wrong on our end. We're working on fixing it."
      action={() => window.location.reload()}
      actionLabel="Try again"
      secondary={() => navigate("/")}
      secondaryLabel="Go home"
      iconColor="text-red-500"
      bgColor="bg-red-500/10"
    />
  );
}

export function Maintenance() {
  return (
    <ErrorPage
      icon={Wrench}
      code={null}
      title="Under maintenance"
      desc="Documind Ai is undergoing scheduled maintenance. We'll be back shortly."
      iconColor="text-amber-500"
      bgColor="bg-amber-500/10"
    />
  );
}
