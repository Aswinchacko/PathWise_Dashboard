import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Lightbulb, Lock, MapPin, DollarSign, Calendar, Target, Sparkles, ExternalLink, TrendingUp } from 'lucide-react'
import './Jobs.css'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [jobStats, setJobStats] = useState({
    total: 0,
    sources: [],
    aiMatched: false
  })

  // Get user ID from localStorage or auth context
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.id || user._id || 'demo_user'
  }

  // Fetch jobs based on user's roadmap automatically on load
  useEffect(() => {
    fetchUserJobs()
  }, [])

  const fetchUserJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const userId = getUserId()
      const response = await fetch(`http://localhost:5007/api/jobs/user/${userId}?limit=12`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()
      
      if (data.success) {
        // Transform jobs for display
        const transformedJobs = data.jobs.map((job, index) => ({
          id: job.id || index,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary || 'Competitive',
          date: formatDate(job.posted_date),
          unlocked: job.match_score ? job.match_score > 60 : true,
          description: job.description,
          logo: job.company ? job.company[0].toUpperCase() : '?',
          url: job.url,
          remote: job.remote,
          matchScore: job.match_score,
          matchReason: job.match_reason,
          requirements: job.requirements || [],
          source: job.source
        }))

        setJobs(transformedJobs)
        setJobStats({
          total: data.total,
          sources: data.sources_used || [],
          aiMatched: data.ai_matched
        })
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs. Make sure the Job Agent service is running.')
    } finally {
      setLoading(false)
    }
  }

  const searchJobs = async () => {
    if (!searchQuery.trim()) {
      fetchUserJobs()
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const userId = getUserId()
      const response = await fetch('http://localhost:5007/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          query: searchQuery,
          location: 'United States',
          limit: 12,
          use_ai_matching: true
        })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      if (data.success) {
        const transformedJobs = data.jobs.map((job, index) => ({
          id: job.id || index,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary || 'Competitive',
          date: formatDate(job.posted_date),
          unlocked: job.match_score ? job.match_score > 60 : true,
          description: job.description,
          logo: job.company ? job.company[0].toUpperCase() : '?',
          url: job.url,
          remote: job.remote,
          matchScore: job.match_score,
          matchReason: job.match_reason,
          requirements: job.requirements || [],
          source: job.source
        }))

        setJobs(transformedJobs)
        setJobStats({
          total: data.total,
          sources: data.sources_used || [],
          aiMatched: data.ai_matched
        })
      }
    } catch (err) {
      console.error('Error searching jobs:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return `${Math.floor(diffDays / 30)} months ago`
    } catch {
      return 'Recently'
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchJobs()
    }
  }

  return (
    <div className="jobs-page">
      <motion.div 
        className="jobs-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>OPPORTUNITIES (Career Hub)</h1>
          <p>Real-world jobs from LinkedIn, Indeed, Glassdoor matched to your skills</p>
          {jobStats.aiMatched && (
            <div className="ai-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '13px', color: '#8b5cf6' }}>
              <Sparkles size={16} />
              <span>AI-Powered Matching</span>
            </div>
          )}
        </div>
        <button className="theme-toggle-btn" onClick={fetchUserJobs} title="Refresh Jobs">
          <TrendingUp size={20} />
        </button>
      </motion.div>

      <div className="search-section">
        <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input
              type="text"
              placeholder="Search jobs (e.g., 'React Developer', 'Data Scientist')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 12px 12px 45px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>
          <button 
            onClick={searchJobs} 
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {jobStats.total > 0 && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#666', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span>✅ Found {jobStats.total} jobs</span>
            {jobStats.sources.length > 0 && (
              <span>📊 Sources: {jobStats.sources.join(', ')}</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div style={{ 
          padding: '16px', 
          background: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
          <div style={{ marginTop: '8px', fontSize: '13px' }}>
            Make sure to run: <code style={{ background: '#fdd', padding: '2px 6px', borderRadius: '4px' }}>start_job_agent.bat</code>
          </div>
        </div>
      )}

      {loading && !jobs.length && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666' }}>Finding the best job opportunities for you...</p>
        </div>
      )}

      <div className="jobs-grid">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            className={`job-card ${job.unlocked ? 'unlocked' : 'locked'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="job-header">
              <div className="job-meta">
                <span className="job-date">{job.date}</span>
                <div className="company-logo">
                  <span>{job.logo}</span>
                </div>
              </div>
              <div className="job-info">
                <h3>{job.title}</h3>
                <p className="company-name">{job.company}</p>
                {job.source && (
                  <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', display: 'block' }}>
                    via {job.source}
                  </span>
                )}
              </div>
            </div>

            <div className="job-details">
              {job.requirements && job.requirements.length > 0 && (
                <div className="job-tags">
                  {job.requirements.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="tag">{skill}</span>
                  ))}
                </div>
              )}
              <div className="job-location-salary">
                <div className="location">
                  <MapPin size={16} />
                  <span>{job.location}</span>
                  {job.remote && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#10b981' }}>• Remote</span>}
                </div>
                <div className="salary">
                  <DollarSign size={16} />
                  <span>{job.salary}</span>
                </div>
              </div>
              
              {job.matchScore && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px', 
                  background: job.matchScore > 80 ? '#e0f2fe' : job.matchScore > 60 ? '#fef3c7' : '#fee2e2',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', marginBottom: '4px' }}>
                    <TrendingUp size={14} />
                    <span>Match Score: {job.matchScore}%</span>
                  </div>
                  {job.matchReason && (
                    <div style={{ color: '#666', fontSize: '11px' }}>
                      {job.matchReason}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="job-actions">
              {job.url && (
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                >
                  Apply Now <ExternalLink size={14} />
                </a>
              )}
            </div>

            {!job.unlocked && (
              <div className="locked-overlay">
                <Lock size={32} />
                <p style={{ marginTop: '10px', fontSize: '13px' }}>Upgrade to unlock</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {!loading && jobs.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <Target size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No jobs found. Try a different search term or check back later.</p>
          <button 
            onClick={fetchUserJobs}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Load Recommended Jobs
          </button>
        </div>
      )}
    </div>
  )
}

export default Jobs