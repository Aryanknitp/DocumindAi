export default function Card({ children, className = '', onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--card)] border border-[var(--border)] rounded-xl
        ${hover ? 'hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`p-5 pb-3 ${className}`}>{children}</div>
}

export function CardContent({ children, className = '' }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-5 py-3 border-t border-[var(--border)] ${className}`}>
      {children}
    </div>
  )
}
