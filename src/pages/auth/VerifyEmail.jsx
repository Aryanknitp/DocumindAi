import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, RefreshCw } from 'lucide-react'
import AuthLayout from '../../layouts/AuthLayout'
import Button from '../../components/ui/Button'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const refs = useRef([])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    setError('')
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the complete 6-digit code'); return }
    setLoading(true)
    // API: await api.verifyEmail(code)
    setTimeout(() => { setLoading(false); navigate('/profile-setup') }, 1000)
  }

  const handleResend = async () => {
    setResending(true)
    // API: await api.resendCode()
    setTimeout(() => { setResending(false); setCountdown(60) }, 1000)
  }

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code sent to your email address">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-[var(--secondary)] flex items-center justify-center">
            <Mail size={24} className="text-[var(--primary)]" />
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`
                h-12 w-12 text-center text-xl font-bold rounded-[var(--radius)] border-2 bg-[var(--card)] text-[var(--foreground)]
                focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all
                ${digit ? 'border-[var(--primary)]' : 'border-[var(--border)]'}
                ${error ? 'border-[var(--destructive)]' : ''}
              `}
            />
          ))}
        </div>
        {error && <p className="text-center text-sm text-[var(--destructive)]">{error}</p>}

        <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full">
          Verify Email
        </Button>

        <div className="text-center text-sm text-[var(--muted-foreground)]">
          {countdown > 0 ? (
            <span>Resend code in {countdown}s</span>
          ) : (
            <button type="button" onClick={handleResend} disabled={resending} className="flex items-center gap-1 mx-auto text-[var(--primary)] hover:underline">
              <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
              Resend code
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  )
}
