import { motion } from 'framer-motion'
import { Lightbulb, FileText, ExternalLink } from 'lucide-react'
import './Resources.css'

const Resources = () => {
  const topics = [
    { id: 1, name: 'Web Development', active: true },
    { id: 2, name: 'Data Science', active: false },
    { id: 3, name: 'Machine Learning', active: false },
    { id: 4, name: 'Mobile Development', active: false },
    { id: 5, name: 'DevOps', active: false },
    { id: 6, name: 'UI/UX Design', active: false },
    { id: 7, name: 'Cybersecurity', active: false },
    { id: 8, name: 'Cloud Computing', active: false },
  ]

  const resources = [
    {
      id: 1,
      title: 'Complete React Tutorial',
      description: 'Learn React from basics to advanced concepts with hands-on projects',
      type: 'Tutorial',
      color: 'var(--primary-500)',
    },
    {
      id: 2,
      title: 'Python for Data Science',
      description: 'Master Python programming for data analysis and visualization',
      type: 'Course',
      color: 'var(--success-500)',
    },
    {
      id: 3,
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to ML algorithms and practical applications',
      type: 'Guide',
      color: 'var(--warning-500)',
    },
    {
      id: 4,
      title: 'Full Stack Development',
      description: 'Build complete web applications with modern technologies',
      type: 'Project',
      color: 'var(--error-500)',
    },
  ]

  return (
    <div className="resources-page">
      <motion.div 
        className="resources-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Learning Resources</h1>
        <button className="theme-toggle-btn">
          <Lightbulb size={20} />
        </button>
      </motion.div>

      <div className="topics-section">
        <div className="topics-grid">
          {topics.map((topic) => (
            <motion.button
              key={topic.id}
              className={`topic-btn ${topic.active ? 'active' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {topic.name}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="resources-grid">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.id}
            className="resource-card"
            style={{ '--resource-color': resource.color }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="resource-icon">
              <FileText size={24} />
            </div>
            <div className="resource-content">
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <div className="resource-meta">
                <span className="resource-type">{resource.type}</span>
                <button className="access-btn">
                  <ExternalLink size={16} />
                  Access
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Resources 