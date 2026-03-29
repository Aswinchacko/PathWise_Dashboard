import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  DollarSign,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Target,
  Briefcase,
  ArrowRight,
  Layers,
} from 'lucide-react'
import { searchJobs, getRoadmapJobContext, extractTechnicalRoleFromAim } from '../services/jobSearchService'
import './Jobs.css'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [roadmapCtx, setRoadmapCtx] = useState(() => getRoadmapJobContext())
  const [jobStats, setJobStats] = useState({
    total: 0,
    sources: [],
    aiMatched: false,
  })

  const refreshRoadmapContext = useCallback(() => {
    setRoadmapCtx(getRoadmapJobContext())
  }, [])

  const handleFetchUserJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    refreshRoadmapContext()
    const ctx = getRoadmapJobContext()

    try {
      const result = await searchJobs(ctx.searchQuery, {
        goal: ctx.goal,
        domain: ctx.domain,
        goalFull: ctx.goalFull,
      })

      setJobs(result.jobs)
      setJobStats({
        total: result.total,
        sources: result.sources,
        aiMatched: result.aiMatched,
      })
      setSearchQuery('')
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs. Check the console for API errors (Serper / Groq).')
    } finally {
      setLoading(false)
    }
  }, [refreshRoadmapContext])

  const handleSearchJobs = useCallback(async () => {
    if (!searchQuery.trim()) {
      handleFetchUserJobs()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const q = searchQuery.trim()
      const serperQ = extractTechnicalRoleFromAim(q) || q
      const result = await searchJobs(serperQ, {
        goal: serperQ,
        domain: roadmapCtx.domain || '',
        goalFull: q,
      })

      setJobs(result.jobs)
      setJobStats({
        total: result.total,
        sources: result.sources,
        aiMatched: result.aiMatched,
      })
    } catch (err) {
      console.error('Error searching jobs:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, roadmapCtx.domain, handleFetchUserJobs])

  useEffect(() => {
    handleFetchUserJobs()
  }, [handleFetchUserJobs])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'selectedRoadmap' || e.key === 'current_goal') {
        handleFetchUserJobs()
      }
    }
    const onRoadmapChanged = () => handleFetchUserJobs()

    window.addEventListener('storage', onStorage)
    window.addEventListener('roadmapChanged', onRoadmapChanged)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('roadmapChanged', onRoadmapChanged)
    }
  }, [handleFetchUserJobs])

  const onSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchJobs()
  }

  const ctx = roadmapCtx

  return (
    <div className="jobs-page jobs-page--modern">
      <header className="jobs-hero">
        <div className="jobs-hero__copy">
          <p className="jobs-hero__eyebrow">
            <Briefcase size={14} strokeWidth={2} aria-hidden />
            Job discovery
          </p>
          <h1 className="jobs-hero__title">Roles matched to your path</h1>
          <p className="jobs-hero__subtitle">
            Live search across LinkedIn, Indeed, and Glassdoor, filtered toward your active roadmap goal.
          </p>

          <div className="jobs-goal-chip">
            <Target size={16} strokeWidth={2} className="jobs-goal-chip__icon" aria-hidden />
            <div className="jobs-goal-chip__text">
              <span className="jobs-goal-chip__label">Current focus</span>
              <span className="jobs-goal-chip__value">
                {ctx.hasRoadmap ? ctx.goal : 'No roadmap selected'}
              </span>
              {ctx.hasRoadmap && ctx.goalFull && ctx.goalFull !== ctx.goal ? (
                <span className="jobs-goal-chip__aim-full" title={ctx.goalFull}>
                  Job search uses the role above; your full aim: {ctx.goalFull}
                </span>
              ) : null}
              {ctx.domain ? (
                <span className="jobs-goal-chip__domain">
                  <Layers size={12} strokeWidth={2} aria-hidden />
                  {ctx.domain}
                </span>
              ) : null}
            </div>
            {!ctx.hasRoadmap ? (
              <Link to="/roadmap" className="jobs-goal-chip__cta">
                Set goal
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="jobs-hero__actions">
          <button
            type="button"
            className="jobs-btn jobs-btn--ghost"
            onClick={() => {
              refreshRoadmapContext()
              handleFetchUserJobs()
            }}
            disabled={loading}
            title="Refresh from roadmap"
          >
            <RefreshCw size={18} strokeWidth={2} className={loading ? 'jobs-icon-spin' : ''} />
            Sync roadmap
          </button>
          {jobStats.aiMatched ? (
            <div className="jobs-ai-pill">
              <Sparkles size={14} strokeWidth={2} />
              AI-ranked for your goal
            </div>
          ) : null}
        </div>
      </header>

      <section className="jobs-toolbar" aria-label="Search jobs">
        <div className="jobs-search">
          <Search size={18} strokeWidth={2} className="jobs-search__icon" aria-hidden />
          <input
            type="search"
            className="jobs-search__input"
            placeholder="Refine search (e.g. Staff Engineer, MLOps)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            disabled={loading}
            aria-label="Job search"
          />
          <button
            type="button"
            className="jobs-btn jobs-btn--primary"
            onClick={handleSearchJobs}
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
        {jobStats.total > 0 ? (
          <p className="jobs-toolbar__meta">
            <span>{jobStats.total} openings</span>
            {jobStats.sources?.length ? (
              <span className="jobs-toolbar__sources">{jobStats.sources.join(' · ')}</span>
            ) : null}
          </p>
        ) : null}
      </section>

      <AnimatePresence>
        {error ? (
          <motion.div
            className="jobs-alert"
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {error}
            <span className="jobs-alert__hint">Open DevTools → Console for Serper / Groq details.</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {loading && jobs.length === 0 ? (
        <div className="jobs-skeleton-grid" aria-busy="true" aria-label="Loading jobs">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="jobs-skeleton-card" />
          ))}
        </div>
      ) : null}

      {loading && jobs.length > 0 ? <div className="jobs-loading-bar" /> : null}

      <div className={`jobs-grid jobs-grid--modern ${loading && jobs.length > 0 ? 'jobs-grid--dim' : ''}`}>
        {jobs.map((job, index) => (
          <motion.article
            key={job.id}
            className="job-card job-card--modern"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
          >
            <div className="job-card__top">
              <div className="job-card__logo" aria-hidden>
                {job.logo}
              </div>
              <div className="job-card__headline">
                <time className="job-card__time">{job.date}</time>
                <h2 className="job-card__title">{job.title}</h2>
                <p className="job-card__company">{job.company}</p>
                {job.source ? <span className="job-card__source">via {job.source}</span> : null}
              </div>
            </div>

            {job.requirements?.length ? (
              <ul className="job-card__tags">
                {job.requirements.slice(0, 4).map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            ) : null}

            <div className="job-card__meta-row">
              <span className="job-card__meta">
                <MapPin size={15} strokeWidth={2} aria-hidden />
                {job.location}
                {job.remote ? <span className="job-card__remote">Remote</span> : null}
              </span>
              <span className="job-card__meta job-card__meta--pay">
                <DollarSign size={15} strokeWidth={2} aria-hidden />
                {job.salary}
              </span>
            </div>

            {job.matchScore ? (
              <div
                className={`job-card__match job-card__match--${
                  job.matchScore > 80 ? 'high' : job.matchScore > 60 ? 'mid' : 'low'
                }`}
              >
                Match {job.matchScore}%
                {job.matchReason ? <span className="job-card__match-reason">{job.matchReason}</span> : null}
              </div>
            ) : null}

            {job.url ? (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="jobs-btn jobs-btn--outline job-card__apply"
              >
                Apply
                <ExternalLink size={15} strokeWidth={2} />
              </a>
            ) : null}
          </motion.article>
        ))}
      </div>

      {!loading && jobs.length === 0 && !error ? (
        <div className="jobs-empty">
          <Target size={40} strokeWidth={1.5} className="jobs-empty__icon" aria-hidden />
          <h2 className="jobs-empty__title">No listings yet</h2>
          <p className="jobs-empty__text">
            {ctx.hasRoadmap
              ? 'Try syncing again or broaden your search. Results depend on what Google returns for your goal.'
              : 'Generate or load a roadmap so we can search for roles that fit your goal.'}
          </p>
          <div className="jobs-empty__actions">
            {ctx.hasRoadmap ? (
              <button type="button" className="jobs-btn jobs-btn--primary" onClick={handleFetchUserJobs}>
                Search for {ctx.goal}
              </button>
            ) : (
              <Link to="/roadmap" className="jobs-btn jobs-btn--primary">
                Open roadmap
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Jobs
