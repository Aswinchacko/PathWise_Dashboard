import { useState, useEffect } from 'react'
import { 
  Users, 
  Target, 
  RefreshCw, 
  MapPin, 
  Briefcase, 
  Clock,
  Star,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Linkedin,
  ExternalLink,
  MessageCircle,
  Award,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react'
import authService from '../services/authService'
import { apiUrl } from '../config/apiBase'
import './Mentors.css'

const Mentors = () => {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roadmapGoal, setRoadmapGoal] = useState(null)
  const [roadmapDomain, setRoadmapDomain] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [experienceFilter, setExperienceFilter] = useState('all')
  const [scrapingStats, setScrapingStats] = useState({
    total: 0,
    real: 0,
    cached: false,
    searchSource: 'static' // 'ai', 'static', or 'web'
  })

  useEffect(() => {
    loadMentors()
  }, [])

  const loadMentors = async (refresh = false) => {
    setLoading(true)
    setError(null)

    try {
      const user = authService.getCurrentUser()
      if (!user || !user.id) {
        setError('Please login to view mentors')
        setLoading(false)
        return
      }

      // Call the new LinkedIn scraping service
      const response = await fetch(apiUrl('/api/mentors/scrape'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          limit: 20,
          experience_level: 'intermediate',
          refresh_cache: refresh
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch mentors')
      }

      const data = await response.json()

      if (data.success) {
        setMentors(data.mentors || [])
        setRoadmapGoal(data.mentors[0]?.roadmap_goal || null)
        setRoadmapDomain(data.mentors[0]?.domain || null)
        setScrapingStats({
          total: data.total_found,
          real: data.total_found,
          cached: data.cached,
          searchSource: data.search_source || 'static'
        })
      } else {
        setError(data.message || 'No mentors found')
      }
    } catch (err) {
      console.error('Error loading mentors:', err)
      setError(err.message || 'Failed to load mentors. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadMentors(true)
  }

  const handleViewProfile = (mentor) => {
    // Search LinkedIn for this person since we have curated profiles
    const searchQuery = encodeURIComponent(`${mentor.name} ${mentor.title} ${mentor.company} India`)
    const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${searchQuery}`
    window.open(linkedinSearchUrl, '_blank')
  }

  const handleContactMentor = (mentor) => {
    // Open LinkedIn search to find and contact this mentor
    const searchQuery = encodeURIComponent(`${mentor.name} ${mentor.company} ${mentor.location}`)
    const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${searchQuery}`
    window.open(linkedinSearchUrl, '_blank')
  }

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = !searchQuery || 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesExperience = experienceFilter === 'all' || 
      (experienceFilter === 'junior' && mentor.experience_years <= 3) ||
      (experienceFilter === 'mid' && mentor.experience_years > 3 && mentor.experience_years <= 7) ||
      (experienceFilter === 'senior' && mentor.experience_years > 7)

    return matchesSearch && matchesExperience
  })

  if (loading) {
    return (
      <div className="mentors-page-new">
        <div className="loading-state">
          <RefreshCw className="spinning" />
          <div className="loading-text">Finding the best mentors for you...</div>
          <div className="loading-subtext">
            Scraping LinkedIn profiles based on your roadmap goal
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mentors-page-new">
        <div className="alert-banner">
          <AlertTriangle />
          <div className="alert-content">
            <h4>Unable to Load Mentors</h4>
            <p className="alert-message">{error}</p>
          </div>
          <button className="alert-action" onClick={() => loadMentors()}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mentors-page-new">
      {/* Hero Section */}
      <div className="mentors-hero">
        <div className="hero-content">
          <div className="hero-header">
            <div className="hero-title-section">
              <Users className="hero-icon" />
              <h1>Find Your Mentor</h1>
            </div>
            <button 
              className="refresh-btn" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={loading ? 'spinning' : ''} />
              Refresh Mentors
            </button>
          </div>
          
          <p className="hero-subtitle">
            Connect with experienced professionals who can guide you on your learning journey
          </p>

          {/* Roadmap Context Card */}
          {roadmapGoal && (
            <div className="roadmap-context">
              <Target className="context-icon" />
              <div className="context-text">
                <div className="context-label">Finding mentors based on your goal:</div>
                <div className="context-goal">"{roadmapGoal}"</div>
                {roadmapDomain && (
                  <span className="context-domain">in {roadmapDomain}</span>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="scraping-stats">
            <div className="stat-item highlight">
              <CheckCircle />
              <span>
                {scrapingStats.real} {scrapingStats.searchSource === 'real' ? 'Real Profiles' : 
                  scrapingStats.searchSource === 'ai' ? 'AI-Generated' : 'Curated'} Recommendations
              </span>
            </div>
            <div className="stat-item">
              <ExternalLink />
              <span>Found from Google Search</span>
            </div>
            <div className="stat-item">
              <Clock />
              <span>
                {scrapingStats.cached ? 'Cached' : 
                  scrapingStats.searchSource === 'ai' ? '🤖 AI Web Search' : 'Freshly Generated'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, title, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-select">
            <Filter />
            <select 
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
            >
              <option value="all">All Experience</option>
              <option value="junior">Junior (0-3 years)</option>
              <option value="mid">Mid-Level (4-7 years)</option>
              <option value="senior">Senior (8+ years)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {filteredMentors.length > 0 && (
        <div className="results-summary">
          <div>
            Showing <strong>{filteredMentors.length}</strong> of{' '}
            <strong>{mentors.length}</strong> mentors
            {' '} | <span className="real-count">
              {scrapingStats.real} {scrapingStats.searchSource === 'real' ? '✓ Real profiles' : 
                scrapingStats.searchSource === 'ai' ? '🤖 AI-generated' : 'curated'} recommendations
            </span>
          </div>
          <div className="service-status">
            <span className="status-indicator online"></span>
            {scrapingStats.searchSource === 'real' ? '✓ Real Profiles Active' : 
             scrapingStats.searchSource === 'ai' ? '🤖 AI Generation Active' : 'Mentor Service Active'}
          </div>
        </div>
      )}

      {/* Mentors Grid */}
      {filteredMentors.length > 0 ? (
        <div className="mentors-grid-new">
          {filteredMentors.map((mentor, index) => (
            <div key={index} className="mentor-card-new">
              {/* Real/AI Badge with Source */}
              <div className="real-badge">
                <CheckCircle className="badge-icon" />
                {mentor.is_real_profile ? (
                  <>
                    ✓ Real Profile
                    {mentor.source_type && (
                      <span className="source-type">
                        {mentor.source_type === 'github' ? ' • GitHub' :
                         mentor.source_type === 'linkedin' ? ' • LinkedIn' :
                         mentor.source_type === 'blog' ? ' • Blog' :
                         mentor.source_type === 'website' ? ' • Web' : ''}
                      </span>
                    )}
                  </>
                ) : 
                 mentor.is_ai_generated ? '🤖 AI-Generated' : 'Recommended'}
              </div>

              {/* Card Header */}
              <div className="mentor-card-header">
                <div className="mentor-avatar-wrapper">
                  <img
                    src={mentor.avatar_url || `https://ui-avatars.com/api/?name=${mentor.name}&size=128&background=3b82f6&color=fff`}
                    alt={mentor.name}
                    className="mentor-avatar-new"
                  />
                  <div className="verified-badge">
                    <Linkedin style={{ width: '12px', height: '12px' }} />
                  </div>
                </div>

                <div className="mentor-basic-info">
                  <h3 className="mentor-name-new">{mentor.name}</h3>
                  <p className="mentor-title-new">{mentor.title || mentor.headline}</p>
                  {mentor.company && (
                    <div className="mentor-company-new">
                      <Briefcase />
                      <span>{mentor.company}</span>
                    </div>
                  )}
                  {mentor.location && (
                    <div className="mentor-location-new">
                      <MapPin />
                      <span>{mentor.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="mentor-stats-row">
                {mentor.experience_years && (
                  <div className="stat-badge">
                    <Award className="stat-icon" />
                    {mentor.experience_years} years
                  </div>
                )}
                {mentor.connections && (
                  <div className="stat-badge">
                    <Users className="stat-icon" />
                    {mentor.connections} connections
                  </div>
                )}
              </div>

              {/* LinkedIn Stats */}
              <div className="linkedin-stats-row">
                <div className="linkedin-stat">
                  <Linkedin />
                  <span>LinkedIn Verified</span>
                </div>
                <div className="linkedin-stat">
                  <TrendingUp />
                  <span>Active Profile</span>
                </div>
              </div>

              {/* Skills */}
              {mentor.skills && mentor.skills.length > 0 && (
                <div className="mentor-skills-new">
                  <h4>Top Skills</h4>
                  <div>
                    {mentor.skills.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="skill-badge">
                        {skill}
                      </span>
                    ))}
                    {mentor.skills.length > 5 && (
                      <span className="skill-badge more">
                        +{mentor.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* About/Bio */}
              {mentor.about && (
                <p className="mentor-bio-new">{mentor.about}</p>
              )}

              {/* Meta Info */}
              <div className="mentor-meta-new">
                <div className="meta-item-new">
                  <Clock />
                  <span>Usually responds in 24h</span>
                </div>
                <div className="meta-item-new">
                  <Star />
                  <span>4.8 rating</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons-new">
                <button 
                  className="btn-outline-new"
                  onClick={() => {
                    if (mentor.profile_url) {
                      window.open(mentor.profile_url, '_blank')
                    } else {
                      handleViewProfile(mentor)
                    }
                  }}
                  title={mentor.is_real_profile ? "Visit profile" : "Search for this profile"}
                >
                  <ExternalLink size={16} />
                  {mentor.is_real_profile ? 'View Profile' : 'Find on LinkedIn'}
                </button>
                <button 
                  className="btn-primary-new"
                  onClick={() => handleContactMentor(mentor)}
                  title="Search and connect"
                >
                  <MessageCircle size={16} />
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Users className="empty-icon" />
          <h3>No Mentors Found</h3>
          <p>
            {searchQuery || experienceFilter !== 'all' 
              ? 'Try adjusting your search filters' 
              : 'Create a roadmap first to find relevant mentors'}
          </p>
          {!roadmapGoal && (
            <button 
              className="btn-primary-large"
              onClick={() => window.location.href = '/roadmap'}
            >
              <Target size={20} />
              Create Your Roadmap
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Mentors
