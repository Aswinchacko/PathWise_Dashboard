import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Crown, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import usePlan from '../../hooks/usePlan'
import './PlanGate.css'

const FEATURE_COPY = {
  projects: {
    title: 'Projects & portfolio',
    blurb:
      'Get unlimited AI-curated project recommendations with step-by-step build plans tailored to your roadmap.',
    perks: [
      'Unlimited project recommendations',
      'Step-by-step implementation guides',
      'Difficulty + tech-stack matching',
      'Save & track project progress',
    ],
  },
  mentors: {
    title: 'Mentor matching',
    blurb:
      'Connect with curated industry mentors and AI mentors that align with your goals and chosen path.',
    perks: [
      'Browse vetted human mentors',
      '1:1 AI mentor conversations',
      'Mentor matchmaking by domain',
      'Session scheduling & follow-ups',
    ],
  },
  jobs: {
    title: 'Job search & applications',
    blurb:
      'Personalized job feeds, resume-aware matching and applications powered by your live roadmap progress.',
    perks: [
      'Personalized job recommendations',
      'Resume-aware matching score',
      'Saved searches & alerts',
      'One-click apply tracking',
    ],
  },
  'micro-learning': {
    title: 'Gamified micro-learning',
    blurb:
      'Daily streaks, XP and bite-sized challenges that keep your skills sharp without burning hours.',
    perks: [
      'Daily challenges & streaks',
      'XP, badges and leaderboards',
      'Spaced-repetition mini quizzes',
      'Skill drills tied to your roadmap',
    ],
  },
}

export default function PlanGate({ feature, children }) {
  const { plan, loading, isPaid } = usePlan()
  const meta = FEATURE_COPY[feature] || {
    title: 'Premium feature',
    blurb: 'Upgrade to unlock this feature.',
    perks: [],
  }

  if (loading) {
    return (
      <div className="plan-gate-loading">
        <Loader2 className="spinner" size={36} />
        <p>Checking your plan…</p>
      </div>
    )
  }

  if (isPaid) return children

  return (
    <motion.div
      className="plan-gate"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="plan-gate-card">
        <div className="plan-gate-icon">
          <Lock size={28} />
          <span className="plan-gate-crown" aria-hidden>
            <Crown size={16} />
          </span>
        </div>

        <p className="plan-gate-kicker">
          <Sparkles size={14} /> Available on Advanced & Plus
        </p>
        <h1 className="plan-gate-title">Unlock {meta.title}</h1>
        <p className="plan-gate-blurb">{meta.blurb}</p>

        {meta.perks.length > 0 && (
          <ul className="plan-gate-perks">
            {meta.perks.map((p) => (
              <li key={p}>
                <Crown size={14} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="plan-gate-actions">
          <Link to="/subscription" className="plan-gate-cta">
            Upgrade plan <ArrowRight size={16} />
          </Link>
          <span className="plan-gate-current">
            Current plan: <strong>{plan === 'free' ? 'Business' : plan}</strong>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
