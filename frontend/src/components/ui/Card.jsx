export default function Card({
  children,
  className = "",
  onClick,
  hover = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card border border-border rounded-xl
        ${hover ? "hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`p-5 pb-3 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`px-5 py-3 border-t border-border ${className}`}>
      {children}
    </div>
  );
}
