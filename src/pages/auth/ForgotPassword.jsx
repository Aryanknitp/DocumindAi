import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // API: await api.forgotPassword(email)
    setTimeout(() => { setLoading(false); setSent(true) }, 1000)
  }

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle={`We sent a reset link to ${email}`}>
        <div className="text-center py-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-emerald-500" />
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">
            Didn't receive it? Check your spam folder or try again.
          </p>
          <Button variant="outline" onClick={() => setSent(false)} className="w-full">Resend email</Button>
          <button onClick={() => navigate('/login')} className="mt-3 flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mx-auto">
            <ArrowLeft size={14} /> Back to login
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full">
          <Send size={16} /> Send reset link
        </Button>
        <button type="button" onClick={() => navigate('/login')} className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mx-auto">
          <ArrowLeft size={14} /> Back to login
        </button>
      </form>
    </AuthLayout>
  )
}
