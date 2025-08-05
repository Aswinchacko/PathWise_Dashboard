import { motion } from 'framer-motion'
import { Search, Filter, Lightbulb, Lock, Star, MapPin, Briefcase } from 'lucide-react'
import './Mentors.css'

const Mentors = () => {
  const mentors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'San Francisco, CA',
      expertise: ['React', 'Node.js', 'Machine Learning'],
      rating: 4.9,
      reviews: 127,
      hourlyRate: 150,
      available: true,
      description: 'Experienced software engineer with 8+ years in full-stack development and machine learning. Passionate about mentoring and helping others grow in their tech careers.',
      image: null,
    },
    {
      id: 2,
      name: 'Alex Rodriguez',
      title: 'Data Science Lead',
      company: 'Microsoft',
      location: 'Seattle, WA',
      expertise: ['Python', 'TensorFlow', 'Data Analysis'],
      rating: 4.8,
      reviews: 89,
      hourlyRate: 200,
      available: false,
      description: 'Leading data science initiatives with expertise in machine learning, statistical analysis, and big data technologies. Available for career guidance and technical mentoring.',
      image: null,
    },
  ]

  return (
    <div className="mentors-page">
      <motion.div 
        className="mentors-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>Mentor Recommendations</h1>
          <p>Connect with experienced professionals in your field</p>
        </div>
        <button className="theme-toggle-btn">
          <Lightbulb size={20} />
        </button>
      </motion.div>

      <div className="search-filter-section">
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Search mentors..." />
        </div>
        <div className="filter-buttons">
          <button className="filter-btn">
            <Filter size={16} />
            Filter
          </button>
          <button className="filter-btn">
            Domain
            <span className="dropdown-arrow">▼</span>
          </button>
          <button className="filter-btn">
            Platform
            <span className="dropdown-arrow">▼</span>
          </button>
          <button className="filter-btn">
            Rating
            <span className="dropdown-arrow">▼</span>
          </button>
        </div>
      </div>

      <div className="mentors-grid">
        {mentors.map((mentor, index) => (
          <motion.div
            key={mentor.id}
            className="mentor-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="mentor-header">
              <div className="mentor-info">
                <h3>{mentor.name}</h3>
                <p className="mentor-title">{mentor.title}</p>
              </div>
              <div className="mentor-avatar">
                {mentor.image ? (
                  <img src={mentor.image} alt={mentor.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
            </div>

            <div className="mentor-details">
              <div className="mentor-meta">
                <div className="meta-item">
                  <Briefcase size={16} />
                  <span>{mentor.company}</span>
                </div>
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{mentor.location}</span>
                </div>
              </div>

              <div className="mentor-expertise">
                <h4>Expertise</h4>
                <div className="expertise-tags">
                  {mentor.expertise.map((skill, skillIndex) => (
                    <span key={skillIndex} className="expertise-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mentor-rating">
                <div className="rating-info">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(mentor.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="rating-text">
                    {mentor.rating} ({mentor.reviews} reviews)
                  </span>
                </div>
                <div className="hourly-rate">
                  ${mentor.hourlyRate}/hr
                </div>
              </div>

              <p className="mentor-description">
                {mentor.description}
              </p>

              {!mentor.available && (
                <div className="locked-overlay">
                  <Lock size={32} />
                  <span>Premium Mentor</span>
                </div>
              )}
            </div>

            <div className="mentor-actions">
              <button className={`btn ${mentor.available ? 'btn-primary' : 'btn-secondary'}`}>
                {mentor.available ? 'Connect' : 'Unlock'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Mentors 