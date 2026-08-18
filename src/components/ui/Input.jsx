export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  rightElement,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-[var(--muted-foreground)] pointer-events-none">
            <Icon size={16} />
          </span>
        )}
        <input
          className={`
            w-full h-10 rounded-[var(--radius)] border border-[var(--border)]
            bg-[var(--card)] text-[var(--foreground)] text-sm
            px-3 py-2 transition-all duration-150
            placeholder:text-[var(--muted-foreground)]
            focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-9' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${error ? 'border-[var(--destructive)] focus:ring-[var(--destructive)]' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3">{rightElement}</span>
        )}
      </div>
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  )
}
