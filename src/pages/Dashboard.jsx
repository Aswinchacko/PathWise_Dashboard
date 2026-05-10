import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Map,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  Search,
  Target,
  Bot,
  Upload,
  RefreshCw
} from 'lucide-react'
import './Dashboard.css'
import dashboardService from '../services/dashboardService'

/** One rotating line per action — same tone as former overview quotes */
const MOTIVATION = {
  resume: [
    'Your story starts on the page—let PathWise read between the lines.',
    'Skills hide in plain sight until you upload.',
    'A strong profile begins with one honest file.'
  ],
  roadmap: [
    'A clear plan turns dreams into deadlines.',
    'Direction matters more than speed.',
    'Map it out, then walk it—one milestone at a time.'
  ],
  guidance: [
    'Good questions unlock better answers.',
    'Curiosity is a career skill—use it often.',
    'One focused chat can change your next move.'
  ],
  jobs: [
    'The right role is closer when your aim is clear.',
    'Search with intent; every listing is a data point.',
    'Opportunities favor the prepared roadmap.'
  ]
}

function pickMotivation(key) {
  const lines = MOTIVATION[key]
  if (!lines?.length) return ''
  const day = Math.floor(Date.now() / 86400000)
  const salt = { resume: 0, roadmap: 11, guidance: 23, jobs: 7 }[key] ?? 0
  return lines[(day + salt) % lines.length]
}

const ESSENTIAL_ACTIONS = [
  {
    key: 'resume',
    tag: 'Resume',
    title: 'Upload your resume',
    description:
      'Parse your resume to extract skills, experience, and career background for personalized recommendations.',
    motivationKey: 'resume',
    icon: Upload,
    cta: 'Start parsing',
    to: '/resume-parser'
  },
  {
    key: 'roadmap',
    tag: 'Roadmap',
    title: 'Generate career roadmap',
    description:
      'Create a personalized career path based on your skills, interests, and goals.',
    motivationKey: 'roadmap',
    icon: Target,
    cta: 'Create roadmap',
    to: '/roadmap'
  },
  {
    key: 'guidance',
    tag: 'AI mentor',
    title: 'Get AI career guidance',
    description:
      'Chat with our AI mentor for personalized advice, skill recommendations, and career insights.',
    motivationKey: 'guidance',
    icon: Bot,
    cta: 'Start chatting',
    to: '/chatbot'
  },
  {
    key: 'jobs',
    tag: 'Jobs',
    title: 'Find real jobs',
    description:
      'Discover job opportunities that match your roadmap and career progression goals.',
    motivationKey: 'jobs',
    icon: Search,
    cta: 'Browse jobs',
    to: '/jobs'
  }
]

const Dashboard = () => {
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardService.getRecentActivity()
      setRecentActivity(data)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Recent activity could not be loaded.')
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    dashboardService.clearCache()
    loadDashboardData()
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">PathWise Dashboard</h1>
          <p
            className="dashboard-subtitle"
            title="Your career workspace—resume, roadmap, guidance, and roles in one flow."
          >
            Your career workspace—resume, roadmap, guidance, and roles in one flow.
          </p>
          <div className="header-right">
            <div className="header-actions">
              {error && (
                <div className="error-indicator" title={error}>
                  <AlertCircle size={16} />
                </div>
              )}
              <button
                type="button"
                className={`btn-icon ${loading ? 'loading' : ''}`}
                title="Refresh"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw size={20} className={loading ? 'spinning' : ''} />
              </button>
              <Link to="/settings" className="btn-icon" title="Settings">
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="essentials-section" aria-labelledby="essentials-heading">
          <h2 id="essentials-heading" className="essentials-heading">
            Quick actions
          </h2>
          <p className="essentials-lead">
            Resume, roadmap, AI mentor, and jobs—each card opens that area of the app.
          </p>
          <div className="essentials-grid">
            {ESSENTIAL_ACTIONS.map((item) => (
              <article key={item.key} className="essential-card">
                <div className="essential-card-top">
                  <span className="essential-tag">{item.tag}</span>
                  <div className="essential-icon-wrap" aria-hidden>
                    <item.icon className="essential-icon" strokeWidth={1.75} />
                  </div>
                </div>
                <h3 className="essential-title">{item.title}</h3>
                <p className="essential-desc">{item.description}</p>
                <p className="essential-quote">{pickMotivation(item.motivationKey)}</p>
                <Link to={item.to} className="essential-cta">
                  <item.icon size={16} strokeWidth={2} aria-hidden />
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="activity-section dashboard-card" aria-labelledby="activity-heading">
          <div className="card-header card-header--activity">
            <div>
              <h2 id="activity-heading" className="card-title">
                Recent activity
              </h2>
              <p className="card-subtitle">Latest roadmap activity on the platform</p>
            </div>
          </div>
          <div className="activity-list">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <div
                      className="loading-skeleton"
                      style={{ width: '16px', height: '16px', borderRadius: '4px' }}
                    />
                  </div>
                  <div className="activity-content">
                    <div
                      className="loading-skeleton"
                      style={{ width: '200px', height: '16px', marginBottom: '4px' }}
                    />
                    <div className="loading-skeleton" style={{ width: '80px', height: '12px' }} />
                  </div>
                  <div className="activity-status">
                    <div
                      className="loading-skeleton"
                      style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                    />
                  </div>
                </div>
              ))
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'roadmap' && <Map size={16} />}
                    {activity.type === 'chat' && <MessageCircle size={16} />}
                    {activity.type === 'resume' && <FileText size={16} />}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.action}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                  <div className={`activity-status ${activity.status}`}>
                    {activity.status === 'success' && <CheckCircle size={16} />}
                    {activity.status === 'processing' && <Clock size={16} />}
                    {activity.status === 'error' && <XCircle size={16} />}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Activity size={48} />
                <p>No recent activity yet</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
