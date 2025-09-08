import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Target,
  BookOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  Sparkles,
  Code,
} from 'lucide-react'
import './Roadmap.css'
import roadmapService from '../services/roadmapService'
import authService from '../services/authService'
import recommendationService from '../services/recommendationService'
import ProjectRecommendationModal from '../components/ProjectRecommendationModal'

const Roadmap = () => {
  // State for ML-generated roadmaps
  const [roadmapData, setRoadmapData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLatest, setIsLoadingLatest] = useState(true)
  const [error, setError] = useState(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [goal, setGoal] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [availableDomains, setAvailableDomains] = useState([])
  const [user, setUser] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [showSavedRoadmaps, setShowSavedRoadmaps] = useState(false)
  const [processingSkill, setProcessingSkill] = useState(null)
  
  // Project recommendation states
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [completedTopics, setCompletedTopics] = useState([])
  const [currentDomain, setCurrentDomain] = useState('')
  const [recommendationServiceAvailable, setRecommendationServiceAvailable] = useState(false)

  // Load user and domains on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }

    const loadDomains = async () => {
      try {
        const response = await roadmapService.getAvailableDomains()
        setAvailableDomains(response.domains)
      } catch (error) {
        console.error('Error loading domains:', error)
      }
    }

    const checkRecommendationService = async () => {
      try {
        const isAvailable = await recommendationService.checkHealth()
        setRecommendationServiceAvailable(isAvailable)
      } catch (error) {
        console.error('Recommendation service not available:', error)
        setRecommendationServiceAvailable(false)
      }
    }


    loadUser()
    loadDomains()
    checkRecommendationService()
    loadLatestRoadmap()
  }, [])

  // Load saved roadmaps when user is available
  useEffect(() => {
    if (user) {
      loadSavedRoadmaps()
    }
  }, [user])

  const loadSavedRoadmaps = async () => {
    try {
      const response = await roadmapService.getUserRoadmaps(user.id)
      setSavedRoadmaps(response.roadmaps)
    } catch (error) {
      console.error('Error loading saved roadmaps:', error)
    }
  }

  const loadLatestRoadmap = async () => {
    try {
      setIsLoadingLatest(true)
      const latestRoadmap = await roadmapService.getLatestRoadmap()
      if (latestRoadmap) {
        const convertedData = roadmapService.convertToRoadmapData(latestRoadmap)
        setRoadmapData(convertedData)
        setCurrentDomain(latestRoadmap.domain)
        console.log('Loaded latest roadmap:', latestRoadmap.goal)
      }
    } catch (error) {
      console.error('Error loading latest roadmap:', error)
    } finally {
      setIsLoadingLatest(false)
    }
  }

  const generateRoadmap = async () => {
    if (!goal.trim()) {
      setError('Please enter a goal')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await roadmapService.generateRoadmap(
        goal,
        selectedDomain || null,
        user?.id || null
      )

      const convertedData = roadmapService.convertToRoadmapData(response)
      setRoadmapData(convertedData)
      setCurrentDomain(response.domain || selectedDomain)
      setShowGenerator(false)
      
      // Refresh saved roadmaps
      if (user) {
        loadSavedRoadmaps()
      }
    } catch (error) {
      setError('Failed to generate roadmap. Please try again.')
      console.error('Error generating roadmap:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSavedRoadmap = (roadmap) => {
    const convertedData = roadmapService.convertToRoadmapData(roadmap)
    setRoadmapData(convertedData)
    setCurrentDomain(roadmap.domain)
    setShowSavedRoadmaps(false)
  }

  const deleteSavedRoadmap = async (roadmapId) => {
    if (!user) return

    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return
    }

    try {
      await roadmapService.deleteRoadmap(roadmapId, user.id)
      loadSavedRoadmaps()
      // Optional: Show success message
      console.log('Roadmap deleted successfully')
    } catch (error) {
      console.error('Error deleting roadmap:', error)
      alert('Failed to delete roadmap. Please try again.')
    }
  }

  const [collapsedIds, setCollapsedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('roadmap.collapsed')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('roadmap.completed')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    localStorage.setItem('roadmap.collapsed', JSON.stringify(Array.from(collapsedIds)))
  }, [collapsedIds])

  useEffect(() => {
    localStorage.setItem('roadmap.completed', JSON.stringify(Array.from(completedIds)))
  }, [completedIds])

  const matchesTerm = useCallback((title, term) => {
    if (!term) return false
    return title.toLowerCase().includes(term.toLowerCase())
  }, [])

  const filterTreeBySearch = useCallback((node, term) => {
    if (!term) return { node, hasMatchInSubtree: false }
    const selfMatches = matchesTerm(node.title, term)
    const children = node.children || []
    const filteredChildren = []
    let descendantMatches = false
    for (const child of children) {
      const result = filterTreeBySearch(child, term)
      if (result) {
        const { node: filteredChild, hasMatchInSubtree } = result
        if (filteredChild) filteredChildren.push(filteredChild)
        if (hasMatchInSubtree) descendantMatches = true
      }
    }
    const keep = selfMatches || descendantMatches
    if (!keep) return null
    return {
      node: { ...node, children: filteredChildren },
      hasMatchInSubtree: true,
    }
  }, [matchesTerm])

  const visibleData = useMemo(() => {
    if (!searchTerm) return roadmapData
    const out = []
    for (const n of roadmapData) {
      const res = filterTreeBySearch(n, searchTerm)
      if (res && res.node) out.push(res.node)
    }
    return out
  }, [roadmapData, searchTerm, filterTreeBySearch])

  const isNodeCollapsed = useCallback(
    (id) => collapsedIds.has(id),
    [collapsedIds]
  )

  const toggleCollapsed = useCallback((id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Define core topics that should trigger project recommendations
  const isCoreTopic = useCallback((skillTitle, skillIndex) => {
    // Only trigger for advanced skills (index 2+) OR specific core technologies
    const isAdvancedSkill = skillIndex >= 2
    
    // Very specific core technologies that should trigger recommendations
    const coreTechnologies = [
      'javascript', 'react', 'vue', 'angular', 'node.js', 'express', 'python', 'django', 'flask',
      'html5', 'css3', 'sql', 'mongodb', 'postgresql', 'api', 'rest', 'graphql', 'docker',
      'kubernetes', 'aws', 'azure', 'typescript', 'redux', 'next.js', 'vue.js',
      'machine learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch',
      'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'java', 'spring',
      'php', 'laravel', 'ruby', 'rails', 'go', 'rust', 'c++', 'c#', '.net'
    ]
    
    const skillLower = skillTitle.toLowerCase()
    const isCoreTechnology = coreTechnologies.some(tech => 
      skillLower.includes(tech.toLowerCase()) || 
      skillLower === tech.toLowerCase()
    )
    
    // Also check for specific patterns that indicate core skills
    const corePatterns = [
      'framework', 'library', 'database', 'server', 'backend', 'frontend',
      'full-stack', 'devops', 'deployment', 'testing', 'debugging',
      'authentication', 'authorization', 'security', 'performance',
      'scalability', 'microservices', 'containerization'
    ]
    
    const hasCorePattern = corePatterns.some(pattern => 
      skillLower.includes(pattern)
    )
    
    return isAdvancedSkill || isCoreTechnology || hasCorePattern
  }, [])

  const toggleCompleted = useCallback((e, id, skillTitle, skillIndex) => {
    // Prevent event bubbling to avoid accidental triggers
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent double-clicks by checking if already processing
    if (processingSkill === id) return
    
    setProcessingSkill(id)
    
    setCompletedIds((prev) => {
      const next = new Set(prev)
      const wasCompleted = next.has(id)
      
      if (next.has(id)) {
        next.delete(id)
        // Remove from completed topics
        setCompletedTopics(prevTopics => 
          prevTopics.filter(topic => topic !== skillTitle)
        )
      } else {
        next.add(id)
        // Add to completed topics
        setCompletedTopics(prevTopics => 
          [...prevTopics, skillTitle]
        )
        
        // Only show project recommendations for core topics
        if (recommendationServiceAvailable && isCoreTopic(skillTitle, skillIndex)) {
          console.log(`🎯 Core topic completed: "${skillTitle}" (index: ${skillIndex})`)
          setTimeout(() => {
            setShowProjectModal(true)
          }, 1000) // Longer delay to show completion animation
        } else {
          console.log(`📝 Regular topic completed: "${skillTitle}" (index: ${skillIndex}) - No recommendations`)
        }
      }
      return next
    })
    
    // Clear processing state after animation
    setTimeout(() => {
      setProcessingSkill(null)
    }, 300)
  }, [recommendationServiceAvailable, isCoreTopic, processingSkill])

  const highlightText = useCallback((text, term) => {
    if (!term) return text
    const idx = text.toLowerCase().indexOf(term.toLowerCase())
    if (idx === -1) return text
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + term.length)
    const after = text.slice(idx + term.length)
    return (
      <>
        {before}
        <mark className="highlight">{match}</mark>
        {after}
      </>
    )
  }, [])

  // Simple layout - no complex positioning needed

  return (
    <div className="roadmap-page">
      {/* Simple Header */}
      <div className="simple-header">
        <h1>Career Roadmap Generator</h1>
        <div className="header-actions">
          <button 
            className="btn-primary" 
            onClick={() => setShowGenerator(true)}
          >
            <Sparkles size={16} />
            Generate Roadmap
          </button>
          {user && (
            <button 
              className="btn-secondary" 
              onClick={() => setShowSavedRoadmaps(true)}
            >
              <BookOpen size={16} />
              Saved Roadmaps
            </button>
          )}
          {recommendationServiceAvailable && completedTopics.length > 0 && (
            <button 
              className="btn-accent" 
              onClick={() => setShowProjectModal(true)}
            >
              <Code size={16} />
              Project Ideas ({completedTopics.length})
            </button>
          )}
        </div>
      </div>

      {/* Simple Search */}
      <div className="search-section">
        <div className="search-box">
          <SearchIcon size={16} />
          <input
            type="text"
            placeholder="Search roadmap items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Simple Roadmap Display */}
      <div className="roadmap-content">
        {roadmapData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {isLoadingLatest ? (
                <Loader2 size={48} className="spinning" />
              ) : (
                <Target size={48} />
              )}
            </div>
            <h3>{isLoadingLatest ? 'Loading Latest Roadmap...' : 'No Roadmap Available'}</h3>
            <p>
              {isLoadingLatest 
                ? 'Loading the most recent roadmap...' 
                : 'No roadmaps found. Click "Generate Roadmap" to create your first one'
              }
            </p>
            {!isLoadingLatest && (
              <button 
                className="btn-primary"
                onClick={() => setShowGenerator(true)}
              >
                <Sparkles size={16} />
                Generate New Roadmap
              </button>
            )}
          </div>
        ) : (
          <div className="roadmap-container">
            {visibleData.map((root, rootIndex) => (
              <div key={rootIndex} className="roadmap-root">
                <div className="roadmap-header">
                  <h2 className="roadmap-title">{root.title}</h2>
                  <div className="roadmap-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(completedIds.size / (root.children?.reduce((acc, step) => acc + (step.children?.length || 0), 0) || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      <span className="progress-completed">{completedIds.size}</span>
                      {' / '}
                      <span className="progress-total">{root.children?.reduce((acc, step) => acc + (step.children?.length || 0), 0) || 0}</span>
                      {' skills completed'}
                      <span className="progress-percentage">
                        ({Math.round((completedIds.size / (root.children?.reduce((acc, step) => acc + (step.children?.length || 0), 0) || 1)) * 100)}%)
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="roadmap-timeline">
                  {root.children?.map((step, stepIndex) => (
                    <div key={stepIndex} className="timeline-item">
                      <div className="timeline-marker">
                        <div className="marker-number">{stepIndex + 1}</div>
                        <div className="marker-line"></div>
                      </div>
                      
                      <div className="timeline-content">
                        <div className="step-card">
                          <div className="step-header">
                            <div className="step-info">
                              <h3 className="step-title">{step.title}</h3>
                              <span className="step-badge">Phase {stepIndex + 1}</span>
                            </div>
                            <button
                              className={`collapse-btn ${isNodeCollapsed(step.id) ? 'collapsed' : ''}`}
                              onClick={() => toggleCollapsed(step.id)}
                            >
                              {isNodeCollapsed(step.id) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                          
                          {!isNodeCollapsed(step.id) && step.children && (
                            <div className="skills-grid">
                              {step.children.map((skill, skillIndex) => (
                                <div 
                                  key={skillIndex} 
                                  className={`skill-card ${completedIds.has(skill.id) ? 'completed' : ''} ${isCoreTopic(skill.title, skillIndex) ? 'core-topic' : ''} ${processingSkill === skill.id ? 'processing' : ''}`}
                                >
                                  <button
                                    className="skill-checkbox"
                                    onClick={(e) => toggleCompleted(e, skill.id, skill.title, skillIndex)}
                                    type="button"
                                    disabled={processingSkill === skill.id}
                                    aria-label={`Mark ${skill.title} as ${completedIds.has(skill.id) ? 'incomplete' : 'complete'}`}
                                  >
                                    {processingSkill === skill.id ? (
                                      <Loader2 size={18} className="spinning" />
                                    ) : completedIds.has(skill.id) ? (
                                      <CheckCircle2 size={18} />
                                    ) : (
                                      <Circle size={18} />
                                    )}
                                  </button>
                                  <div className="skill-content">
                                    <span className="skill-text">{highlightText(skill.title, searchTerm)}</span>
                                    <div className="skill-level">
                                      {skillIndex < 2 ? 'Beginner' : skillIndex < 4 ? 'Intermediate' : 'Advanced'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Generator Modal */}
      {showGenerator && (
        <div className="modal-overlay">
          <div className="simple-modal">
            <div className="modal-header">
              <h2>Generate Roadmap</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowGenerator(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {error && (
                <div className="error-msg">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <div className="input-group">
                <label>Career Goal</label>
                <input
                  type="text"
                  placeholder="e.g., Become a Python Developer"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
              
              <div className="input-group">
                <label>Domain (Optional)</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  <option value="">Select a domain...</option>
                  {availableDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowGenerator(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={generateRoadmap}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spinning" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Saved Roadmaps Modal */}
      {showSavedRoadmaps && (
        <div className="modal-overlay">
          <div className="simple-modal">
            <div className="modal-header">
              <h2>Saved Roadmaps</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowSavedRoadmaps(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {savedRoadmaps.length === 0 ? (
                <div className="empty-state">
                  <BookOpen size={48} />
                  <p>No saved roadmaps yet</p>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowSavedRoadmaps(false);
                      setShowGenerator(true);
                    }}
                  >
                    Generate First Roadmap
                  </button>
                </div>
              ) : (
                <div className="roadmap-list">
                  {savedRoadmaps.map((roadmap) => (
                    <div key={roadmap._id} className="roadmap-item">
                      <div className="roadmap-info">
                        <h3>{roadmap.goal}</h3>
                        <p>{roadmap.domain}</p>
                        <small>{new Date(roadmap.created_at).toLocaleDateString()}</small>
                      </div>
                      <div className="roadmap-actions">
                        <button 
                          className="btn-primary"
                          onClick={() => loadSavedRoadmap(roadmap)}
                        >
                          Load
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => deleteSavedRoadmap(roadmap.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Recommendation Modal */}
      <ProjectRecommendationModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        completedTopics={completedTopics}
        domain={currentDomain}
        difficulty="intermediate"
        userId={user?.id}
      />
    </div>
  )
}

export default Roadmap