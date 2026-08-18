import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'

export default function Splash({ onComplete }) {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      const seen = localStorage.getItem('onboarding_seen')
      if (!seen) {
        navigate('/onboarding')
      } else {
        navigate('/landing')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 flex items-center justify-center">
      <div className="text-center animate-scale-in">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
          <Brain size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">DocuMind AI</h1>
        <p className="text-white/50 text-sm">Your intelligent PDF workspace</p>
        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white/30 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
