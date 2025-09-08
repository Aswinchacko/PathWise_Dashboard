import { useState, useEffect } from 'react'
import { 
  X, 
  ExternalLink, 
  Clock, 
  Star, 
  Code, 
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import recommendationService from '../services/recommendationService'
import './ProjectRecommendationModal.css'

const ProjectRecommendationModal = ({ 
  isOpen, 
  onClose, 
  completedTopics = [], 
  domain = null, 
  difficulty = null,
  userId = null 
}) => {
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty || 'intermediate')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState({})

  useEffect(() => {
    if (isOpen && completedTopics.length > 0) {
      loadRecommendations()
    }
  }, [isOpen, completedTopics, selectedDifficulty])

  const loadRecommendations = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const recs = await recommendationService.getRecommendations(
        completedTopics,
        domain,
        selectedDifficulty,
        6
      )
      setRecommendations(recs)
    } catch (err) {
      setError('Failed to load project recommendations. Please try again.')
      console.error('Error loading recommendations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (projectId, rating) => {
    if (!userId) return

    try {
      await recommendationService.submitFeedback(userId, projectId, rating)
      setFeedbackSubmitted(prev => ({ ...prev, [projectId]: rating }))
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#10b981'
      case 'intermediate': return '#f59e0b'
      case 'advanced': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '🟢'
      case 'intermediate': return '🟡'
      case 'advanced': return '🔴'
      default: return '⚪'
    }
  }

  if (!isOpen) return null

  return (
    <div className="project-modal-overlay">
      <div className="project-modal">
        <div className="project-modal-header">
          <div className="project-modal-title">
            <BookOpen size={20} />
            <h2>Project Recommendations</h2>
          </div>
          <button className="project-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="project-modal-body">
          {/* Completion Celebration */}
          <div className="completion-celebration">
            <CheckCircle2 size={24} className="celebration-icon" />
            <div className="celebration-text">
              <h3>Great job completing these topics!</h3>
              <p>Here are some projects to practice what you've learned:</p>
              <div className="completed-topics">
                {completedTopics.map((topic, index) => (
                  <span key={index} className="topic-tag">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="difficulty-filter">
            <label>Filter by difficulty:</label>
            <div className="difficulty-buttons">
              {['beginner', 'intermediate', 'advanced'].map((diff) => (
                <button
                  key={diff}
                  className={`difficulty-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {getDifficultyIcon(diff)} {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="loading-state">
              <Loader2 size={32} className="spinning" />
              <p>Finding perfect projects for you...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <AlertCircle size={24} />
              <p>{error}</p>
              <button className="retry-btn" onClick={loadRecommendations}>
                Try Again
              </button>
            </div>
          )}

          {/* Recommendations Grid */}
          {!isLoading && !error && recommendations.length > 0 && (
            <div className="recommendations-grid">
              {recommendations.map((project) => (
                <div key={project.project_id} className="project-card">
                  <div className="project-header">
                    <h3 className="project-title">{project.title}</h3>
                    <div className="project-meta">
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(project.difficulty) }}
                      >
                        {getDifficultyIcon(project.difficulty)} {project.difficulty}
                      </span>
                      <span className="time-badge">
                        <Clock size={14} />
                        {project.estimated_time}
                      </span>
                    </div>
                  </div>

                  <p className="project-description">{project.description}</p>

                  <div className="project-technologies">
                    {project.technologies.slice(0, 4).map((tech, index) => (
                      <span key={index} className="tech-tag">
                        <Code size={12} />
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="tech-more">+{project.technologies.length - 4} more</span>
                    )}
                  </div>

                  <div className="project-objectives">
                    <h4>What you'll learn:</h4>
                    <ul>
                      {project.learning_objectives.slice(0, 3).map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="project-actions">
                    <button 
                      className="project-btn primary"
                      onClick={() => window.open(`#project-${project.project_id}`, '_blank')}
                    >
                      <ExternalLink size={16} />
                      View Details
                    </button>
                    
                    {userId && (
                      <div className="feedback-buttons">
                        <button
                          className={`feedback-btn ${feedbackSubmitted[project.project_id] === 5 ? 'active' : ''}`}
                          onClick={() => handleFeedback(project.project_id, 5)}
                          title="Like this recommendation"
                        >
                          <ThumbsUp size={16} />
                        </button>
                        <button
                          className={`feedback-btn ${feedbackSubmitted[project.project_id] === 1 ? 'active' : ''}`}
                          onClick={() => handleFeedback(project.project_id, 1)}
                          title="Dislike this recommendation"
                        >
                          <ThumbsDown size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {project.final_score && (
                    <div className="project-score">
                      <Star size={14} />
                      <span>Match Score: {Math.round(project.final_score * 100)}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Recommendations */}
          {!isLoading && !error && recommendations.length === 0 && (
            <div className="no-recommendations">
              <BookOpen size={48} />
              <h3>No projects found</h3>
              <p>Try adjusting the difficulty filter or completing more topics.</p>
            </div>
          )}
        </div>

        <div className="project-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={loadRecommendations}>
            Refresh Recommendations
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectRecommendationModal

