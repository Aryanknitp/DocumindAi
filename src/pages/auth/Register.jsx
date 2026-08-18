import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react'
import AuthLayout from '../../layouts/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    // API integration point: await api.register(form)
    setTimeout(() => {
      setLoading(false)
      navigate('/verify-email')
    }, 1000)
  }

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })) }

  const strength = form.password
    ? form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : /[^a-zA-Z0-9]/.test(form.password) ? 4 : 3
    : 0
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-500']

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your AI PDF journey — free for 14 days"
      altText="Already have an account?"
      altLink="/login"
      altLinkText="Sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" type="text" placeholder="Jane Smith" icon={User} value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email address" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set('email')} error={errors.email} />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            icon={Lock}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            rightElement={
              <button type="button" onClick={() => setShowPassword(v => !v)} className="text-[var(--muted-foreground)]">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          {form.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-[var(--border)]'}`} />
                ))}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">Strength: {strengthLabels[strength]}</p>
            </div>
          )}
        </div>
        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          icon={Lock}
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />
        <label className="flex items-start gap-2 cursor-pointer text-sm text-[var(--muted-foreground)]">
          <input type="checkbox" className="mt-0.5 rounded" required />
          <span>I agree to the <a href="#" className="text-[var(--primary)] hover:underline">Terms of Service</a> and <a href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</a></span>
        </label>
        <Button type="submit" variant="gradient" size="lg" loading={loading} className="w-full">
          <UserPlus size={16} />
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
