import { motion } from 'framer-motion'
import { Send, Lightbulb, MessageCircle } from 'lucide-react'
import './Chatbot.css'

const Chatbot = () => {
  const suggestedPrompts = [
    {
      id: 1,
      title: 'Career Guidance',
      description: 'Get personalized advice for your career path',
      color: 'var(--primary-500)',
    },
    {
      id: 2,
      title: 'Skill Assessment',
      description: 'Evaluate your current skills and identify gaps',
      color: 'var(--warning-500)',
    },
    {
      id: 3,
      title: 'Project Ideas',
      description: 'Discover project ideas based on your interests',
      color: 'var(--success-500)',
    },
  ]

  return (
    <div className="chatbot-page">
      
      <div className="chatbot-container">
        <motion.div 
          className="chatbot-welcome"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="chatbot-icon">
            <MessageCircle size={48} />
          </div>
          <div className="welcome-text">
            <h2>Hello! I'm your AI Career Assistant</h2>
            <p>I'm here to help you with career guidance, skill assessment, project ideas, and more. Ask me anything!</p>
          </div>
        </motion.div>

        <motion.div 
          className="suggested-prompts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Suggested Questions</h3>
          <div className="prompts-grid">
            {suggestedPrompts.map((prompt, index) => (
              <motion.button
                key={prompt.id}
                className="prompt-card"
                style={{ '--prompt-color': prompt.color }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4>{prompt.title}</h4>
                <p>{prompt.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="chat-input"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="input-container">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              className="chat-input-field"
            />
            <button className="send-button">
              <Send size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Chatbot 