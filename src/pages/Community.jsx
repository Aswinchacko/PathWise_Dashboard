import { motion } from 'framer-motion'
import { Search, Lightbulb, MessageCircle, Users } from 'lucide-react'
import './Community.css'

const Community = () => {
  const discussions = [
    {
      id: 1,
      title: 'Best practices for React state management',
      description: 'Share your experiences with different state management solutions in React applications.',
      author: 'Sarah Chen',
      replies: 12,
      views: 234,
      category: 'Web Development',
    },
    {
      id: 2,
      title: 'Getting started with Machine Learning',
      description: 'Tips and resources for beginners in machine learning and data science.',
      author: 'Alex Rodriguez',
      replies: 8,
      views: 156,
      category: 'Data Science',
    },
    {
      id: 3,
      title: 'Career transition from non-tech to tech',
      description: 'Experiences and advice for professionals transitioning into tech roles.',
      author: 'Maria Garcia',
      replies: 15,
      views: 342,
      category: 'Career Advice',
    },
    {
      id: 4,
      title: 'Interview preparation strategies',
      description: 'How to prepare effectively for technical interviews and coding challenges.',
      author: 'David Kim',
      replies: 6,
      views: 189,
      category: 'Career Advice',
    },
    {
      id: 5,
      title: 'Building a portfolio website',
      description: 'Design and development tips for creating an impressive portfolio.',
      author: 'Emily Johnson',
      replies: 9,
      views: 267,
      category: 'Web Development',
    },
    {
      id: 6,
      title: 'Open source contribution guide',
      description: 'How to start contributing to open source projects as a beginner.',
      author: 'Michael Brown',
      replies: 11,
      views: 198,
      category: 'Development',
    },
  ]

  return (
    <div className="community-page">
      <motion.div 
        className="community-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>Community Discussion</h1>
          <p>Connect with fellow learners and share knowledge</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search topics..." />
          </div>
          <button className="theme-toggle-btn">
            <Lightbulb size={20} />
          </button>
        </div>
      </motion.div>

      <div className="discussions-grid">
        {discussions.map((discussion, index) => (
          <motion.div
            key={discussion.id}
            className="discussion-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="discussion-header">
              <h3>{discussion.title}</h3>
              <span className="category-tag">{discussion.category}</span>
            </div>
            <p className="discussion-description">{discussion.description}</p>
            <div className="discussion-meta">
              <div className="meta-item">
                <Users size={16} />
                <span>{discussion.author}</span>
              </div>
              <div className="meta-item">
                <MessageCircle size={16} />
                <span>{discussion.replies} replies</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Community 