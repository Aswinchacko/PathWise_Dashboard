import { motion } from 'framer-motion'
import { Search, Filter, Heart, Lock, Lightbulb, Star, Target, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import './Projects.css'

const Projects = () => {
  const [userAim, setUserAim] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [phaseProjects, setPhaseProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [recommendationMethod, setRecommendationMethod] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const projectCategories = [
    { id: 'all', label: 'All' },
    { id: 'saved', label: 'Saved' },
    { id: 'phase-based', label: 'Phase-Based' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'web-dev', label: 'Web Dev' },
    { id: 'ai-ml', label: 'AI / ML' },
    { id: 'data-science', label: 'Data Science' },
    { id: 'mobile-dev', label: 'Mobile Dev' },
  ]

  // Fetch all projects on mount
  useEffect(() => {
    fetchAllProjects()
  }, [])

  const fetchAllProjects = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/projects')
      const data = await response.json()
      if (data.success) {
        // Separate phase-based projects from regular projects
        const phaseBasedProjects = data.projects.filter(p => p.phase)
        const regularProjects = data.projects.filter(p => !p.phase)
        
        // Add unlocked status to projects from API (first one is unlocked)
        const regularProjectsWithStatus = regularProjects.map((p, index) => ({
          ...p,
          unlocked: index === 0 // First project is unlocked
        }))
        
        const phaseProjectsWithStatus = phaseBasedProjects.map(p => ({
          ...p,
          unlocked: true // Phase-based projects are always unlocked
        }))
        
        setAllProjects(regularProjectsWithStatus)
        setPhaseProjects(phaseProjectsWithStatus)
        setRecommendations(regularProjectsWithStatus.slice(0, 6)) // Show first 6 initially
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      // No fallback - show empty state with message to get recommendations
      setAllProjects([])
      setPhaseProjects([])
      setRecommendations([])
    }
  }

  const getRecommendations = async () => {
    if (!userAim.trim()) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5003/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aim: userAim, limit: 6 })
      })
      
      const data = await response.json()
      if (data.success) {
        // Add unlocked status to recommended projects
        const projectsWithStatus = data.recommendations.map((p, index) => ({
          ...p,
          unlocked: index === 0 // First recommended project is unlocked
        }))
        setRecommendations(projectsWithStatus)
        setRecommendationMethod(data.method)
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      getRecommendations()
    }
  }

  const filterProjects = (category) => {
    setActiveCategory(category)
    setRecommendationMethod('') // Clear recommendation badge
    
    if (category === 'all') {
      // Show both regular and phase-based projects
      const combinedProjects = [...allProjects, ...phaseProjects]
      setRecommendations(combinedProjects.slice(0, 6))
    } else if (category === 'phase-based') {
      // Show only phase-based projects
      setRecommendations(phaseProjects)
    } else if (category === 'saved') {
      // Filter saved projects (you can implement this logic)
      const combinedProjects = [...allProjects, ...phaseProjects]
      setRecommendations(combinedProjects.filter(p => p.saved).slice(0, 6))
    } else if (['beginner', 'intermediate', 'advanced'].includes(category)) {
      // Filter by difficulty
      const combinedProjects = [...allProjects, ...phaseProjects]
      const filtered = combinedProjects.filter(p => 
        p.difficulty.toLowerCase() === category
      )
      setRecommendations(filtered)
    } else {
      // Filter by category
      const combinedProjects = [...allProjects, ...phaseProjects]
      const filtered = combinedProjects.filter(p => 
        p.category === category
      )
      setRecommendations(filtered)
    }
  }

  // No default projects - everything comes from AI or API

  return (
    <div className="projects-page">
      <motion.div 
        className="projects-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>Project Recommendations</h1>
          <p>AI-powered project suggestions based on your goals</p>
        </div>
        <div className="header-actions">
          <button className="theme-toggle-btn">
            <Lightbulb size={20} />
          </button>
        </div>
      </motion.div>

      {/* AI Recommendation Input */}
      <motion.div 
        className="aim-input-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="aim-input-wrapper">
          <Target className="aim-icon" size={24} />
          <input
            type="text"
            className="aim-input"
            placeholder="What's your goal? (e.g., 'I want to become a full-stack developer')"
            value={userAim}
            onChange={(e) => setUserAim(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="recommend-btn" 
            onClick={getRecommendations}
            disabled={loading || !userAim.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Analyzing...
              </>
            ) : (
              <>
                <Star size={20} />
                Get Recommendations
              </>
            )}
          </button>
        </div>
        {recommendationMethod && (
          <p className="recommendation-badge">
            {recommendationMethod === 'ai-powered' ? '🤖 AI-Powered' : '🎯 Smart Match'}
          </p>
        )}
      </motion.div>

      {/* Phase-Based Projects Section */}
      {phaseProjects.length > 0 && (
        <motion.div 
          className="phase-projects-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="phase-projects-header">
            <h3>🎉 Phase-Based Projects</h3>
            <p>Projects recommended based on completed learning phases</p>
          </div>
          <div className="phase-projects-grid">
            {phaseProjects.slice(0, 3).map((project, index) => (
              <motion.div
                key={project.id}
                className="phase-project-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="phase-badge">
                  <span className="phase-name">{project.phase}</span>
                </div>
                <div className="project-image">
                  <div className="image-placeholder phase-based">
                    <Target size={24} />
                  </div>
                </div>
                <div className="project-content">
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                  {project.skills && (
                    <div className="project-tags">
                      {project.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  )}
                  <div className="project-meta">
                    <span className="difficulty">{project.difficulty}</span>
                    <div className="rating">
                      <Star size={16} />
                      <span>{project.rating}</span>
                    </div>
                    {project.duration && (
                      <span className="duration">{project.duration}</span>
                    )}
                  </div>
                  <div className="project-actions">
                    <button className="btn btn-primary">
                      Start Project
                    </button>
                    <button className="like-btn">
                      <Heart size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {phaseProjects.length > 3 && (
            <div className="view-more-phase">
              <button 
                className="btn btn-secondary"
                onClick={() => filterProjects('phase-based')}
              >
                View All Phase-Based Projects ({phaseProjects.length})
              </button>
            </div>
          )}
        </motion.div>
      )}

      <div className="filter-section">
        <div className="filter-tabs">
          {projectCategories.map((category) => (
            <button
              key={category.id}
              className={`filter-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => filterProjects(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="recommendations-section">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="spinner-large" size={48} />
            <p>AI is generating custom projects for you...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="empty-content">
              <Target size={64} className="empty-icon" />
              <h3>No Projects Yet</h3>
              <p>Enter your career goal above to get AI-generated project recommendations tailored just for you!</p>
              <div className="example-aims">
                <p>Try these examples:</p>
                <div className="example-buttons">
                  <button onClick={() => setUserAim('I want to become a full-stack developer')}>
                    Full-Stack Developer
                  </button>
                  <button onClick={() => setUserAim('I want to learn machine learning')}>
                    Machine Learning
                  </button>
                  <button onClick={() => setUserAim('I want to build mobile apps')}>
                    Mobile Development
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div 
              className="recommendation-group unlocked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3>{userAim ? 'AI-Generated Projects for Your Goal' : 'Recommended Projects'}</h3>
              <div className="project-grid">
                {recommendations.slice(0, 3).map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="project-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="project-image">
                      {project.unlocked ? (
                        <div className="image-placeholder unlocked">
                          <Star size={24} />
                        </div>
                      ) : (
                        <div className="image-placeholder locked">
                          <Lock size={24} />
                        </div>
                      )}
                    </div>
                    <div className="project-content">
                      <h4>{project.title}</h4>
                      <p>{project.description}</p>
                      {project.skills && (
                        <div className="project-tags">
                          {project.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      )}
                      <div className="project-meta">
                        <span className="difficulty">{project.difficulty}</span>
                        <div className="rating">
                          <Star size={16} />
                          <span>{project.rating}</span>
                        </div>
                        {project.duration && (
                          <span className="duration">{project.duration}</span>
                        )}
                      </div>
                      <div className="project-actions">
                        <button className="btn btn-primary">
                          {project.unlocked ? 'Start Project' : 'Unlock'}
                        </button>
                        <button className="like-btn">
                          <Heart size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {recommendations.length > 3 && (
              <motion.div 
                className="recommendation-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3>Additional Projects</h3>
                <div className="project-grid">
                  {recommendations.slice(3).map((project, index) => (
                    <motion.div
                      key={project.id}
                      className="project-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="project-image">
                        <div className="image-placeholder locked">
                          <Lock size={24} />
                        </div>
                      </div>
                      <div className="project-content">
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        {project.skills && (
                          <div className="project-tags">
                            {project.skills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        )}
                        <div className="project-meta">
                          <span className="difficulty">{project.difficulty}</span>
                          <div className="rating">
                            <Star size={16} />
                            <span>{project.rating}</span>
                          </div>
                          {project.duration && (
                            <span className="duration">{project.duration}</span>
                          )}
                        </div>
                        <div className="project-actions">
                          <button className="btn btn-secondary">Unlock</button>
                          <button className="like-btn">
                            <Heart size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Projects 