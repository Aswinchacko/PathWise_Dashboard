import { Star, Target, Loader2, X, CheckCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import './Projects.css'
import { projectRecommendationUrl } from '../config/apiBase'
const LOCAL_STARTED_KEY = 'pathwise.projectStartedIds'

function readLocalStartedIds() {
  try {
    const raw = localStorage.getItem(LOCAL_STARTED_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function writeLocalStartedIds(ids) {
  localStorage.setItem(LOCAL_STARTED_KEY, JSON.stringify([...ids]))
}

function applyStartedFromLocal(projects) {
  const local = readLocalStartedIds()
  return projects.map((p) => ({
    ...p,
    started: !!p.started || local.has(p.id),
  }))
}

const Projects = () => {
  const [userAim, setUserAim] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectStages, setProjectStages] = useState([])
  const [loadingStages, setLoadingStages] = useState(false)

  const DEFAULT_PROJECTS = [
    {
      id: 1,
      title: "Building a Simple Weather API",
      description: "Create a RESTful API that fetches and returns weather data for a given location. This project will reinforce understanding of API design principles, endpoint creation, and data serialization.",
      difficulty: "Intermediate",
      rating: 4.5,
      duration: "1-2 weeks",
      skills: ["RESTful API", "JSON serialization"],
      category: "web-dev"
    },
    {
      id: 2,
      title: "Implementing User Authentication with JWT",
      description: "Build a secure API that handles user authentication using JSON Web Tokens (JWT). This project will help solidify understanding of authentication mechanisms, token validation, and secure data transmission.",
      difficulty: "Advanced",
      rating: 4.5,
      duration: "2-4 weeks",
      skills: ["JWT", "Authentication", "Authorization"],
      category: "web-dev"
    },
    {
      id: 3,
      title: "Building a CRUD API with Real-time Updates",
      description: "Create a full-featured CRUD API that handles real-time updates using WebSockets. This project will reinforce understanding of real-time communication, API performance optimization, and data consistency.",
      difficulty: "Advanced",
      rating: 4.5,
      duration: "1-2 months",
      skills: ["WebSockets", "Real-time updates", "API performance optimization"],
      category: "web-dev"
    },
    {
      id: 4,
      title: "Building a Simple RESTful API for a Blog",
      description: "Create a RESTful API using Node.js and Express.js to manage a blog's posts. This project will help solidify understanding of API design, routing, and request handling. You'll learn to create API endpoints for CRUD operations, handle validation and errors, and implement authentication.",
      difficulty: "Intermediate",
      rating: 4.5,
      duration: "2-4 weeks",
      skills: ["Node.js", "Express.js", "API Design"],
      category: "web-dev"
    },
    {
      id: 5,
      title: "Implementing API Security Measures",
      description: "Build upon the previous project by adding security measures to prevent common web attacks. You'll learn to implement rate limiting, input validation, and authentication using JSON Web Tokens (JWT). This project will help you understand the importance of API security and how to protect against common threats.",
      difficulty: "Advanced",
      rating: 4.5,
      duration: "1-2 weeks",
      skills: ["API Security", "Rate Limiting", "Input Validation"],
      category: "web-dev"
    },
    {
      id: 6,
      title: "Creating a Real-time API using WebSockets",
      description: "Build a real-time API using Node.js, Express.js, and WebSockets to push updates to connected clients. This project will help you understand the concept of real-time APIs and how to implement WebSockets for live updates. You'll learn to handle WebSocket connections, messages, and errors.",
      difficulty: "Advanced",
      rating: 4.5,
      duration: "2-4 weeks",
      skills: ["Node.js", "Express.js", "WebSockets"],
      category: "web-dev"
    },
    {
      id: 7,
      title: "To-Do List App",
      description: "Build a simple command-line based To-Do List App using Python. This project will help you practice data structures, functions, and modules. You will learn how to store and retrieve data from a list, create functions for adding, removing, and marking tasks as completed.",
      difficulty: "Beginner",
      rating: 4.5,
      duration: "1-2 weeks",
      skills: ["functions", "data structures", "modules"],
      category: "python"
    },
    {
      id: 8,
      title: "Hangman Game",
      description: "Create a Hangman game using Python. This project will help you practice conditional statements, loops, and file input/output. You will learn how to generate random words, handle user input, and keep track of the game state.",
      difficulty: "Intermediate",
      rating: 4.5,
      duration: "2-4 weeks",
      skills: ["conditional statements", "loops", "file input/output"],
      category: "python"
    },
    {
      id: 9,
      title: "Quiz Program",
      description: "Build a Quiz program using Python. This project will help you practice object-oriented programming, file input/output, and error handling. You will learn how to create classes for questions and answers, read from a file, and display scores.",
      difficulty: "Advanced",
      rating: 4.5,
      duration: "1-2 months",
      skills: ["object-oriented programming", "file input/output", "error handling"],
      category: "python"
    },
    {
      id: 10,
      title: "Personal Finance Calculator",
      description: "Build a command-line based personal finance calculator that takes user input for income, expenses, savings, and investments to provide a detailed analysis of their financial health. This project reinforces skills in variables, data types, loops, conditional statements, functions, and object-oriented programming.",
      difficulty: "Beginner",
      rating: 4.5,
      duration: "1-2 weeks",
      skills: ["variables", "data types", "loops"],
      category: "python"
    },
    {
      id: 11,
      title: "Rock, Paper, Scissors Game",
      description: "Develop a simple game of Rock, Paper, Scissors using Python, where the user can play against the computer. This project applies skills in functions, loops, conditional statements, and random number generation.",
      difficulty: "Intermediate",
      rating: 4.5,
      duration: "1-2 weeks",
      skills: ["functions", "loops", "conditional statements"],
      category: "python"
    },
    {
      id: 12,
      title: "Advanced To-Do List App",
      description: "Create a simple command-line based to-do list app that allows users to add, remove, and mark tasks as completed. This project reinforces skills in lists, dictionaries, file input/output, and exception handling.",
      difficulty: "Advanced",
      rating: 4.5,
      duration: "2-4 weeks",
      skills: ["lists", "dictionaries", "file input/output"],
      category: "python"
    }
  ]

  const [recommendations, setRecommendations] = useState(() => applyStartedFromLocal(DEFAULT_PROJECTS))
  const [allProjects, setAllProjects] = useState(() => applyStartedFromLocal(DEFAULT_PROJECTS))
  const [loading, setLoading] = useState(false)
  const [recommendationMethod, setRecommendationMethod] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`${projectRecommendationUrl('/api/projects')}`)
        const data = await r.json()
        if (cancelled || !data.success || !Array.isArray(data.projects) || data.projects.length === 0) {
          return
        }
        const merged = applyStartedFromLocal(data.projects)
        setAllProjects(merged)
        setRecommendations(merged)
      } catch {
        /* offline / API down — keep defaults */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const projectCategories = [
    { id: 'all', label: 'All' },
    { id: 'started', label: 'Started' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'web-dev', label: 'Web Dev' },
    { id: 'ai-ml', label: 'AI / ML' },
    { id: 'data-science', label: 'Data Science' },
    { id: 'mobile-dev', label: 'Mobile Dev' },
  ]

  const getRecommendations = async () => {
    if (!userAim.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`${projectRecommendationUrl('/api/recommend')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aim: userAim, limit: 6 })
      })

      const data = await response.json()
      if (data.success) {
        const local = readLocalStartedIds()
        const merged = (data.recommendations || []).map((p) => ({
          ...p,
          started: !!p.started || local.has(p.id),
        }))
        setRecommendations(merged)
        setRecommendationMethod(data.method)
        setAllProjects((prev) => {
          const ids = new Set(merged.map((p) => p.id))
          const rest = prev.filter((p) => !ids.has(p.id))
          return [...merged, ...rest]
        })
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      getRecommendations()
    }
  }

  const filterProjects = (category) => {
    setActiveCategory(category)
    setRecommendationMethod('') // Clear recommendation badge

    if (category === 'all') {
      setRecommendations(allProjects)
    } else if (category === 'started') {
      setRecommendations(allProjects.filter((p) => p.started))
    } else if (['beginner', 'intermediate', 'advanced'].includes(category)) {
      const filtered = allProjects.filter(p =>
        p.difficulty.toLowerCase() === category
      )
      setRecommendations(filtered)
    } else {
      const filtered = allProjects.filter(p =>
        p.category === category
      )
      setRecommendations(filtered)
    }
  }

  const fetchProjectStages = async (project) => {
    setLoadingStages(true)
    setProjectStages([])
    try {
      const response = await fetch(`${projectRecommendationUrl('/api/project-stages')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          description: project.description
        })
      })
      const data = await response.json()
      if (data.success) {
        setProjectStages(data.stages)
      }
    } catch (error) {
      console.error('Error fetching stages:', error)
    } finally {
      setLoadingStages(false)
    }
  }

  const handleViewDetails = (project) => {
    setProjectStages([])
    setSelectedProject(project)
    void fetchProjectStages(project)
  }

  const toggleStarted = useCallback(async (project, nextStarted) => {
    const id = project.id
    const started = typeof nextStarted === 'boolean' ? nextStarted : !project.started

    const patchList = (list) => list.map((p) => (p.id === id ? { ...p, started } : p))

    setAllProjects((prev) => patchList(prev))
    setRecommendations((prev) => patchList(prev))
    setSelectedProject((prev) => (prev?.id === id ? { ...prev, started } : prev))

    try {
      await fetch(`${projectRecommendationUrl(`/api/projects/${id}/started`)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ started }),
      })
    } catch {
      /* offline — localStorage still updated */
    }

    const locals = readLocalStartedIds()
    if (started) locals.add(id)
    else locals.delete(id)
    writeLocalStartedIds(locals)
  }, [])

  const renderProjectCard = (project, index, animMs = 0) => (
    <div
      key={project.id}
      className="project-card project-card--enter"
      style={{ animationDelay: `${animMs + index * 35}ms` }}
    >
      <div className="project-image">
        <div className="image-placeholder">
          <Star size={24} />
        </div>
      </div>
      <div className="project-content">
        <h4>{project.title}</h4>
        <p className="project-description">{project.description}</p>
        {project.skills && (
          <div className="project-tags">
            {project.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        )}
        <div className="project-meta">
          <span className="difficulty">{project.difficulty}</span>
          <div className="rating">
            <Star size={16} />
            <span>{project.rating}</span>
          </div>
          {project.duration && <span className="duration">{project.duration}</span>}
        </div>
        <div className="project-actions">
          <button type="button" className="btn btn-primary" onClick={() => handleViewDetails(project)}>
            View details
          </button>
          <button
            type="button"
            className={`star-started-btn ${project.started ? 'star-started-btn--on' : ''}`}
            title={project.started ? 'Started' : 'Mark as started'}
            aria-label={project.started ? 'Started' : 'Mark as started'}
            aria-pressed={project.started}
            onClick={() => toggleStarted(project)}
          >
            <Star size={18} strokeWidth={2} fill={project.started ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div className="header-content">
          <span className="header-eyebrow">PathWise projects</span>
          <div className="header-heading-row">
            <h1>Project recommendations</h1>
            <p className="header-desc">
              Describe your goal and we&apos;ll surface build ideas, filters, and an implementation outline.
            </p>
          </div>
        </div>
      </header>

      <div className="aim-input-section">
        <div className="aim-input-wrapper">
          <Target className="aim-icon" size={24} />
          <input
            type="text"
            className="aim-input"
            placeholder="What's your goal? (e.g., 'I want to become a full-stack developer')"
            value={userAim}
            onChange={(e) => setUserAim(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            type="button"
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
            <span className="recommendation-badge__dot" aria-hidden />
            {recommendationMethod === 'ai-powered' ? 'AI-powered match' : 'Smart match'}
          </p>
        )}
      </div>

      {/* Categories Filter */}
      <div className="filter-section">
        <div className="filter-tabs">
          {projectCategories.map((category) => (
            <button
              type="button"
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
          <div className="empty-state">
            <div className="empty-content">
              <Target size={64} className="empty-icon" />
              <h3>No projects yet</h3>
              <p>Enter your career goal above to get AI-generated project recommendations tailored just for you!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="recommendation-group unlocked">
              <h3>Top picks</h3>
              <div className="project-grid">
                {recommendations.slice(0, 3).map((project, index) => renderProjectCard(project, index, 0))}
              </div>
            </div>

            {recommendations.length > 3 && (
              <div className="recommendation-group">
                <h3>More projects</h3>
                <div className="project-grid">
                  {recommendations.slice(3).map((project, index) => renderProjectCard(project, index, 80))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedProject && (
        <div
          className="modal-overlay projects-modal-overlay"
          role="presentation"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="modal-content project-modal projects-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="modal-header">
                <h2 id="project-modal-title">{selectedProject.title}</h2>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="modal-body">
                <div className="project-overview">
                  <p className="description">{selectedProject.description}</p>

                  <div className="project-stats">
                    <div className="stat-item">
                      <span className="label">Difficulty</span>
                      <span className="value">{selectedProject.difficulty}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Duration</span>
                      <span className="value">{selectedProject.duration}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Category</span>
                      <span className="value">{selectedProject.category}</span>
                    </div>
                  </div>

                  <div className="skills-section">
                    <h4>Skills You'll Learn</h4>
                    <div className="skills-list">
                      {selectedProject.skills?.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="project-roadmap">
                  <h3>Implementation Roadmap</h3>
                  {loadingStages ? (
                    <div className="fetching-stages">
                      <Loader2 className="spinner" size={24} />
                      <p>AI is generating step-by-step implementation plan...</p>
                    </div>
                  ) : projectStages.length > 0 ? (
                    <div className="stages-timeline">
                      {projectStages.map((stage, index) => (
                        <div key={index} className="stage-item">
                          <div className="stage-number">{index + 1}</div>
                          <div className="stage-content">
                            <div className="stage-header">
                              <h4>{stage.title}</h4>
                              <span className="stage-duration">{stage.duration}</span>
                            </div>
                            <p>{stage.description}</p>
                            <ul className="stage-tasks">
                              {stage.items?.map((item, i) => (
                                <li key={i}>
                                  <CheckCircle size={14} className="task-icon" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-stages">
                      <p>Could not generate roadmap.</p>
                      <button
                        type="button"
                        className="retry-btn"
                        onClick={() => fetchProjectStages(selectedProject)}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedProject(null)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary start-project-btn"
                  onClick={() => {
                    void toggleStarted(selectedProject, true)
                    setSelectedProject(null)
                  }}
                >
                  Start project
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects 