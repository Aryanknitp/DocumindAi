export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  rightElement,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-muted-foreground pointer-events-none">
            <Icon size={16} />
          </span>
        )}
        <input
          className={`
            w-full h-10 rounded-lg border border-border
            bg-card text-sm
            px-3 py-2 transition-all duration-150
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? "pl-9" : ""}
            ${rightElement ? "pr-10" : ""}
            ${error ? "border-destructive focus:ring-destructive" : ""}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3">{rightElement}</span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
