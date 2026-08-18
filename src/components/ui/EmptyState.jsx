import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {Icon && (
        <div className="mb-4 p-4 rounded-2xl bg-[var(--secondary)]">
          <Icon size={32} className="text-[var(--primary)]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] max-w-xs mb-6">{description}</p>
      )}
      <div className="flex gap-3">
        {action && (
          <Button onClick={action} variant="primary" size="md">{actionLabel}</Button>
        )}
        {secondaryAction && (
          <Button onClick={secondaryAction} variant="outline" size="md">{secondaryLabel}</Button>
        )}
      </div>
    </div>
  )
}
