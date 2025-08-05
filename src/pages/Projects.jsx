import { motion } from 'framer-motion'
import { Search, Filter, Heart, Lock, Lightbulb, Star } from 'lucide-react'
import './Projects.css'

const Projects = () => {
  const projectCategories = [
    { id: 'all', label: 'All', active: true },
    { id: 'saved', label: 'Saved', active: false },
    { id: 'beginner', label: 'Beginner', active: false },
    { id: 'intermediate', label: 'Intermediate', active: false },
    { id: 'ai-ml', label: 'AI / ML', active: false },
    { id: 'web-dev', label: 'WEB Dev', active: false },
    { id: 'data-science', label: 'Data Science', active: false },
  ]

  const projectCards = [
    {
      id: 1,
      title: 'React E-commerce Platform',
      description: 'Build a full-stack e-commerce application with React and Node.js',
      difficulty: 'Intermediate',
      category: 'web-dev',
      unlocked: true,
      rating: 4.8,
      students: 1247,
    },
    {
      id: 2,
      title: 'Machine Learning Model',
      description: 'Create a predictive model using Python and scikit-learn',
      difficulty: 'Advanced',
      category: 'ai-ml',
      unlocked: false,
      rating: 4.9,
      students: 892,
    },
    {
      id: 3,
      title: 'Data Visualization Dashboard',
      description: 'Build interactive dashboards with D3.js and React',
      difficulty: 'Intermediate',
      category: 'data-science',
      unlocked: false,
      rating: 4.7,
      students: 567,
    },
    {
      id: 4,
      title: 'Python Web Scraper',
      description: 'Learn web scraping with BeautifulSoup and Selenium',
      difficulty: 'Beginner',
      category: 'web-dev',
      unlocked: false,
      rating: 4.6,
      students: 2341,
    },
    {
      id: 5,
      title: 'Neural Network Implementation',
      description: 'Build neural networks from scratch using NumPy',
      difficulty: 'Advanced',
      category: 'ai-ml',
      unlocked: false,
      rating: 4.9,
      students: 445,
    },
  ]

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
          <p>Discover projects tailored to your skill level and interests</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search projects..." />
          </div>
          <button className="theme-toggle-btn">
            <Lightbulb size={20} />
          </button>
        </div>
      </motion.div>

      <div className="filter-section">
        <div className="filter-tabs">
          {projectCategories.map((category) => (
            <button
              key={category.id}
              className={`filter-tab ${category.active ? 'active' : ''}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="recommendations-section">
        <motion.div 
          className="recommendation-group unlocked"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Recommended for You</h3>
          <div className="project-grid">
            {projectCards.slice(0, 3).map((project, index) => (
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
                  <div className="project-meta">
                    <span className="difficulty">{project.difficulty}</span>
                    <div className="rating">
                      <Star size={16} />
                      <span>{project.rating}</span>
                    </div>
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

        <motion.div 
          className="recommendation-group locked"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Advanced Projects</h3>
          <div className="project-grid">
            {projectCards.slice(3).map((project, index) => (
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
                  <div className="project-meta">
                    <span className="difficulty">{project.difficulty}</span>
                    <div className="rating">
                      <Star size={16} />
                      <span>{project.rating}</span>
                    </div>
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
      </div>
    </div>
  )
}

export default Projects 