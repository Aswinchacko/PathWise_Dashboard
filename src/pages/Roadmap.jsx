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
} from 'lucide-react'
import './Roadmap.css'
import roadmapService from '../services/roadmapService'
import authService from '../services/authService'
import recommendationService from '../services/recommendationService'
import mentorService from '../services/mentorService'
import ConfirmationModal from '../components/ConfirmationModal'

const Roadmap = () => {
  // State for ML-generated roadmaps
  const [roadmapData, setRoadmapData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [goal, setGoal] = useState('')
  const [user, setUser] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [showSavedRoadmaps, setShowSavedRoadmaps] = useState(false)
  const [processingSkill, setProcessingSkill] = useState(null)
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true)
  
  // Project recommendation states
  const [currentDomain, setCurrentDomain] = useState('')
  const [recommendationServiceAvailable, setRecommendationServiceAvailable] = useState(false)
  
  // Phase completion notification states
  const [phaseNotification, setPhaseNotification] = useState(null)
  const [phaseRecommendations, setPhaseRecommendations] = useState([])
  
  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roadmapToDelete, setRoadmapToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

    const checkRecommendationService = async () => {
      try {
        console.log('🔍 Checking recommendation service availability...')
        const isAvailable = await recommendationService.checkHealth()
        console.log('📡 Recommendation service available:', isAvailable)
        setRecommendationServiceAvailable(isAvailable)
      } catch (error) {
        console.error('❌ Recommendation service not available:', error)
        setRecommendationServiceAvailable(false)
      }
    }


    loadUser()
    checkRecommendationService()
    // Don't load latest roadmap automatically - let user choose
  }, [])

  // Load saved roadmaps when user is available
  useEffect(() => {
    if (user) {
      loadSavedRoadmaps()
    }
  }, [user])

  // Load latest roadmap after saved roadmaps are loaded
  useEffect(() => {
    if (savedRoadmaps.length >= 0) { // Run when savedRoadmaps changes (including empty array)
      loadLatestRoadmap()
    }
  }, [savedRoadmaps])

  const loadSavedRoadmaps = async () => {
    try {
      setIsLoadingRoadmaps(true)
      const response = await roadmapService.getUserRoadmaps(user.id)
      setSavedRoadmaps(response.roadmaps)
    } catch (error) {
      console.error('Error loading saved roadmaps:', error)
    } finally {
      setIsLoadingRoadmaps(false)
    }
  }

  const loadLatestRoadmap = async () => {
    try {
      // Only load latest roadmap if user has saved roadmaps
      if (savedRoadmaps.length > 0) {
        // Get the most recent saved roadmap
        const latestRoadmap = savedRoadmaps[0] // Assuming they're sorted by date
        const convertedData = roadmapService.convertToRoadmapData(latestRoadmap)
        setRoadmapData(convertedData)
        setCurrentDomain(latestRoadmap.domain)
        console.log('Loaded latest saved roadmap:', latestRoadmap.goal)
      } else {
        // Clear roadmap data if no saved roadmaps
        setRoadmapData([])
        setCurrentDomain('')
        console.log('No saved roadmaps found, clearing roadmap data')
      }
    } catch (error) {
      console.error('Error loading latest roadmap:', error)
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
        null,  // No domain - let AI find the best match
        user?.id || null
      )

      const convertedData = roadmapService.convertToRoadmapData(response)
      setRoadmapData(convertedData)
      setCurrentDomain(response.domain)
      setShowGenerator(false)
      
      // Save current roadmap goal for mentor recommendations
      mentorService.saveCurrentRoadmapGoal(goal, response.domain)
      
      // Save goal separately in localStorage
      const goalData = {
        goal: goal,
        domain: response.domain,
        createdAt: new Date().toISOString(),
        roadmapId: response.id
      }
      localStorage.setItem('current_goal', JSON.stringify(goalData))
      
      // Clear completion state for new roadmap
      setCompletedIds(new Set())
      setCompletedTopics([])
      localStorage.removeItem('roadmap.completed')
      
      // Refresh saved roadmaps immediately and with delay
      if (user) {
        console.log('🔄 Refreshing saved roadmaps after generation...')
        
        // Immediate refresh
        await loadSavedRoadmaps()
        console.log('✅ Immediate refresh completed')
        
        // Delayed refresh to ensure backend has processed
        setTimeout(async () => {
          console.log('🔄 Delayed refresh of saved roadmaps...')
          await loadSavedRoadmaps()
          console.log('✅ Delayed refresh completed, count:', savedRoadmaps.length)
        }, 2000)
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
    
    // Save current roadmap goal for mentor recommendations
    mentorService.saveCurrentRoadmapGoal(roadmap.goal, roadmap.domain)
    
    // Clear completion state when loading a different roadmap
    setCompletedIds(new Set())
    setCompletedTopics([])
    localStorage.removeItem('roadmap.completed')
  }

  const handleDeleteClick = (roadmap) => {
    setRoadmapToDelete(roadmap)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!user || !roadmapToDelete) return

    setIsDeleting(true)
    try {
      await roadmapService.deleteRoadmap(roadmapToDelete.id, user.id)
      loadSavedRoadmaps()
      console.log('Roadmap deleted successfully')
      
      // Close modal
      setShowDeleteModal(false)
      setRoadmapToDelete(null)
    } catch (error) {
      console.error('Error deleting roadmap:', error)
      alert('Failed to delete roadmap. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setRoadmapToDelete(null)
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

  const checkPhaseCompletion = useCallback((step, stepIndex, completedIds) => {
    if (!step.children || step.children.length === 0) return false
    
    const totalSkills = step.children.length
    const completedSkills = step.children.filter(skill => completedIds.has(skill.id)).length
    
    return completedSkills === totalSkills
  }, [])

  const getPhaseRecommendations = useCallback(async (phaseName) => {
    console.log(`🔍 Phase recommendation check:`, {
      phaseName,
      recommendationServiceAvailable,
      phaseNotification: phaseNotification
    })
    
    if (!recommendationServiceAvailable) {
      console.log(`❌ Recommendation service not available`)
      return
    }
    
    try {
      console.log(`🎉 Phase completed: "${phaseName}" - Getting phase-based recommendations...`)
      
      const response = await fetch('http://localhost:5003/api/recommend/phase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phase: phaseName,
          limit: 3
        })
      })
      
      console.log(`📡 API Response status:`, response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Phase recommendations received:`, data)
        
        // Show notification with phase-based projects
        if (data.recommendations && data.recommendations.length > 0) {
          console.log(`🎨 Setting phase notification with ${data.recommendations.length} projects`)
          setPhaseRecommendations(data.recommendations)
          setPhaseNotification({
            phase: phaseName,
            count: data.recommendations.length,
            method: data.method
          })
          
          // Auto-hide notification after 8 seconds
          setTimeout(() => {
            console.log(`⏰ Auto-hiding phase notification`)
            setPhaseNotification(null)
          }, 8000)
        } else {
          console.log(`⚠️ No recommendations received`)
        }
      } else {
        console.error('Failed to get phase recommendations:', response.statusText)
      }
    } catch (error) {
      console.error('Error getting phase recommendations:', error)
    }
  }, [recommendationServiceAvailable, phaseNotification])

  const handleProjectClick = useCallback(async (project) => {
    try {
      console.log(`🎯 Project clicked: ${project.title}`)
      
      // Save project to database
      const response = await fetch('http://localhost:5003/api/projects/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Project saved to database with ID: ${data.id}`)
        
        // Show success message
        alert(`✅ Project "${project.title}" has been saved to your projects!`)
        
        // Close notification
        setPhaseNotification(null)
        
        // Optionally redirect to projects page
        // window.location.href = '/projects'
      } else {
        console.error('Failed to save project:', response.statusText)
        alert(`❌ Failed to save project. Please try again.`)
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert(`❌ Error saving project: ${error.message}`)
    }
  }, [])

  const handleViewAllProjects = useCallback(() => {
    console.log(`📋 Viewing all ${phaseRecommendations.length} recommended projects`)
    
    // Save all projects to database
    const saveAllProjects = async () => {
      try {
        const savePromises = phaseRecommendations.map(project => 
          fetch('http://localhost:5003/api/projects/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project)
          })
        )
        
        const responses = await Promise.all(savePromises)
        const results = await Promise.all(responses.map(r => r.json()))
        
        console.log(`✅ All ${results.length} projects saved to database`)
        alert(`✅ All ${results.length} projects have been saved to your projects!`)
        
        // Close notification
        setPhaseNotification(null)
        
        // Optionally redirect to projects page
        // window.location.href = '/projects'
      } catch (error) {
        console.error('Error saving all projects:', error)
        alert(`❌ Error saving projects: ${error.message}`)
      }
    }
    
    saveAllProjects()
  }, [phaseRecommendations])

  const toggleCompleted = useCallback((e, id, skillTitle, skillIndex, step, stepIndex) => {
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
      } else {
        next.add(id)
        
        // Check if entire phase is now completed
        if (step && stepIndex !== undefined) {
          const isPhaseComplete = checkPhaseCompletion(step, stepIndex, next)
          console.log(`🔍 Phase completion check:`, {
            phaseTitle: step.title,
            stepIndex,
            totalSkills: step.children?.length || 0,
            completedSkills: step.children?.filter(skill => next.has(skill.id)).length || 0,
            isPhaseComplete
          })
          
          if (isPhaseComplete) {
            console.log(`🎉 Phase "${step.title}" completed!`)
            // Get phase-based recommendations
            getPhaseRecommendations(step.title)
          }
        }
        
        // Phase-based recommendations only - no individual topic recommendations
        console.log(`📝 Topic completed: "${skillTitle}" (index: ${skillIndex}) - Phase-based recommendations only`)
      }
      return next
    })
    
    // Clear processing state after animation
    setTimeout(() => {
      setProcessingSkill(null)
    }, 300)
  }, [recommendationServiceAvailable, isCoreTopic, processingSkill, checkPhaseCompletion, getPhaseRecommendations])

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
        </div>
      </div>

      {/* Phase Completion Notification */}
      {phaseNotification && (
        <div className="phase-notification">
          <div className="notification-content">
            <div className="notification-icon">🎉</div>
            <div className="notification-text">
              <h4>Phase Completed!</h4>
              <p>
                <strong>{phaseNotification.phase}</strong> completed! 
                {phaseRecommendations.length} new projects recommended based on your progress.
              </p>
              <div className="notification-projects">
                {phaseRecommendations.slice(0, 2).map((project, index) => (
                  <button 
                    key={index} 
                    className="project-preview clickable"
                    onClick={() => handleProjectClick(project)}
                    title="Click to view project details"
                  >
                    {project.title}
                  </button>
                ))}
                {phaseRecommendations.length > 2 && (
                  <button 
                    className="more-projects clickable"
                    onClick={() => handleViewAllProjects()}
                    title="View all recommended projects"
                  >
                    +{phaseRecommendations.length - 2} more
                  </button>
                )}
              </div>
            </div>
            <button 
              className="notification-close"
              onClick={() => setPhaseNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

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
              {isLoadingRoadmaps ? (
                <Loader2 size={48} className="spinning" />
              ) : (
                <Target size={48} />
              )}
            </div>
            <h3>
              {isLoadingRoadmaps 
                ? 'Loading Roadmaps...' 
                : savedRoadmaps.length === 0 
                  ? 'No Roadmap Available' 
                  : 'No Roadmap Loaded'
              }
            </h3>
            <p>
              {isLoadingRoadmaps 
                ? 'Checking for saved roadmaps...' 
                : savedRoadmaps.length === 0 
                  ? 'No roadmaps found. Click "Generate Roadmap" to create your first one.'
                  : 'You have saved roadmaps. Click "Saved Roadmaps" to load one or generate a new one.'
              }
            </p>
            {!isLoadingRoadmaps && (
              <div className="empty-actions">
                {savedRoadmaps.length > 0 && (
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowSavedRoadmaps(true)}
                  >
                    <BookOpen size={16} />
                    Load Saved Roadmap
                  </button>
                )}
                <button 
                  className="btn-primary"
                  onClick={() => setShowGenerator(true)}
                >
                  <Sparkles size={16} />
                  Generate New Roadmap
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="roadmap-container">
            {visibleData.map((root, rootIndex) => (
              <div key={rootIndex} className="roadmap-root">
                <div className="roadmap-header">
                  <div className="roadmap-title-section">
                    <h2 className="roadmap-title">{root.title}</h2>
                    {root.metadata && (
                      <div className="roadmap-metadata">
                        <span className={`difficulty-badge ${root.metadata.difficulty?.toLowerCase()}`}>
                          {root.metadata.difficulty || 'Intermediate'}
                        </span>
                        <span className="hours-badge">
                          ⏱️ {root.metadata.estimatedHours || 300} hours
                        </span>
                        <span className="domain-badge">
                          📚 {root.metadata.domain}
                        </span>
                        {root.metadata.matchScore > 0 && (
                          <span className="match-badge">
                            ✨ {Math.round(root.metadata.matchScore * 100)}% match
                          </span>
                        )}
                      </div>
                    )}
                    {root.metadata && (root.metadata.prerequisites || root.metadata.learningOutcomes) && (
                      <div className="roadmap-details">
                        {root.metadata.prerequisites && (
                          <details className="metadata-section">
                            <summary>📋 Prerequisites</summary>
                            <p>{root.metadata.prerequisites}</p>
                          </details>
                        )}
                        {root.metadata.learningOutcomes && (
                          <details className="metadata-section">
                            <summary>🎯 Learning Outcomes</summary>
                            <p>{root.metadata.learningOutcomes}</p>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
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
                                    onClick={(e) => toggleCompleted(e, skill.id, skill.title, skillIndex, step, stepIndex)}
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
                  placeholder="e.g., Python Developer, Full Stack Developer, AI Engineer"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      generateRoadmap()
                    }
                  }}
                />
                <small style={{ color: '#64748b', marginTop: '0.5rem', display: 'block' }}>
                  Just enter your career goal - our AI will find the perfect roadmap for you!
                </small>
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
              <div className="modal-actions">
                <button 
                  className="refresh-btn"
                  onClick={() => {
                    console.log('🔄 Manual refresh of saved roadmaps...')
                    loadSavedRoadmaps()
                  }}
                  title="Refresh saved roadmaps"
                >
                  ↻
                </button>
                <button 
                  className="close-btn" 
                  onClick={() => setShowSavedRoadmaps(false)}
                >
                  ×
                </button>
              </div>
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
              <button 
                className="btn-secondary"
                onClick={() => {
                  console.log('🔄 Manual refresh of saved roadmaps...')
                  loadSavedRoadmaps()
                }}
                style={{ marginTop: '1rem' }}
              >
                Refresh
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
                          onClick={() => handleDeleteClick(roadmap)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Roadmap"
        message={`Are you sure you want to delete "${roadmapToDelete?.goal}"? This action cannot be undone and all progress will be lost.`}
        confirmText="Delete Roadmap"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

    </div>
  )
}

export default Roadmap