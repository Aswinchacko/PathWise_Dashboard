import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, Bot, User, Loader2, Plus, MessageSquare, Trash2, Edit3, RefreshCw, MapPin, PlusCircle, CheckCircle, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import './Chatbot.css'
import chatbotService from '../services/chatbotService'

const Chatbot = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isServiceAvailable, setIsServiceAvailable] = useState(true)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [currentTitle, setCurrentTitle] = useState('New Chat')
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [showRoadmapModal, setShowRoadmapModal] = useState(false)
  const [currentRoadmap, setCurrentRoadmap] = useState(null)
  const [userId] = useState(() => {
    // Use localStorage to persist userId across sessions
    const storedUserId = localStorage.getItem('chatbot_user_id')
    if (storedUserId) {
      return storedUserId
    }
    const newUserId = 'user_' + Date.now()
    localStorage.setItem('chatbot_user_id', newUserId)
    return newUserId
  })
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const suggestedPrompts = [
    {
      id: 1,
      title: 'Career Guidance',
      description: 'Get personalized advice for your career path',
      color: 'var(--primary-500)',
      message: 'Help me plan my career path in technology'
    },
    {
      id: 2,
      title: 'Skill Assessment',
      description: 'Evaluate your current skills and identify gaps',
      color: 'var(--warning-500)',
      message: 'How can I assess my programming skills?'
    },
    {
      id: 3,
      title: 'Project Ideas',
      description: 'Discover project ideas based on your interests',
      color: 'var(--success-500)',
      message: 'Suggest some project ideas for my portfolio'
    },
    {
      id: 4,
      title: 'Create Roadmap',
      description: 'Generate a personalized learning roadmap',
      color: 'var(--info-500)',
      message: 'Create a roadmap for becoming a full-stack developer'
    },
  ]

  // Check service health and load chat history on component mount
  useEffect(() => {
    checkServiceHealth()
    loadChatHistory()
    loadSavedRoadmaps()
  }, [userId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkServiceHealth = async () => {
    const isHealthy = await chatbotService.checkHealth()
    setIsServiceAvailable(isHealthy)
  }

  const loadChatHistory = async () => {
    try {
      console.log('Loading chat history for user:', userId)
      const chats = await chatbotService.getUserChats(userId)
      console.log('Loaded chats:', chats)
      setChatHistory(chats)
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const loadSavedRoadmaps = async () => {
    try {
      console.log('Loading saved roadmaps for user:', userId)
      const roadmaps = await chatbotService.getUserRoadmaps(userId)
      console.log('Loaded roadmaps:', roadmaps)
      setSavedRoadmaps(roadmaps)
    } catch (error) {
      console.error('Error loading saved roadmaps:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createNewChat = async () => {
    try {
      console.log('Creating new chat for user:', userId)
      const newChat = await chatbotService.createNewChat(userId)
      console.log('Created new chat:', newChat)
      setCurrentChatId(newChat.chat_id)
      setCurrentTitle(newChat.title)
      setMessages([])
      setEditingTitle(false)
      await loadChatHistory()
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  const loadChat = async (chatId) => {
    try {
      const chatData = await chatbotService.getChatMessages(userId, chatId)
      setCurrentChatId(chatId)
      setCurrentTitle(chatData.title)
      setMessages(chatData.messages.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        suggestions: msg.metadata?.suggestions || [],
        confidence: msg.metadata?.confidence
      })))
      setEditingTitle(false)
    } catch (error) {
      console.error('Error loading chat:', error)
    }
  }

  const deleteChat = async (chatId) => {
    try {
      console.log('Deleting chat:', chatId)
      await chatbotService.deleteChat(userId, chatId)
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setMessages([])
        setCurrentTitle('New Chat')
      }
      await loadChatHistory()
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const updateChatTitle = async (newTitle) => {
    if (!currentChatId || !newTitle.trim()) return
    
    try {
      console.log('Updating chat title:', newTitle.trim())
      await chatbotService.updateChatTitle(userId, currentChatId, newTitle.trim())
      setCurrentTitle(newTitle.trim())
      setEditingTitle(false)
      await loadChatHistory()
    } catch (error) {
      console.error('Error updating chat title:', error)
    }
  }

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await chatbotService.sendMessage(messageText, userId, currentChatId)
      
      // Update current chat ID if this is a new chat
      if (!currentChatId && response.chat_id) {
        setCurrentChatId(response.chat_id)
        await loadChatHistory()
      }

      const botMessage = {
        id: response.message_id,
        type: 'bot',
        content: response.response,
        suggestions: response.suggestions || [],
        confidence: response.confidence,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = () => {
    sendMessage(inputMessage)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePromptClick = (prompt) => {
    sendMessage(prompt.message)
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
  }

  const handleAddRoadmapToSaved = async (roadmap) => {
    try {
      console.log('Adding roadmap to saved:', roadmap)
      // The roadmap is already saved in MongoDB by the roadmap API
      // We just need to refresh our local list
      await loadSavedRoadmaps()
      setShowRoadmapModal(false)
      setCurrentRoadmap(null)
    } catch (error) {
      console.error('Error adding roadmap to saved:', error)
    }
  }

  const handleShowRoadmapModal = (roadmap) => {
    setCurrentRoadmap(roadmap)
    setShowRoadmapModal(true)
  }

  const handleCloseRoadmapModal = () => {
    setShowRoadmapModal(false)
    setCurrentRoadmap(null)
  }

  const handleDeleteRoadmap = async (roadmapId) => {
    try {
      await chatbotService.deleteRoadmap(roadmapId, userId)
      await loadSavedRoadmaps()
    } catch (error) {
      console.error('Error deleting roadmap:', error)
    }
  }

  return (
    <div className="chatbot-page">
      {/* Sidebar */}
      <motion.div 
        className={`chatbot-sidebar ${showSidebar ? 'open' : 'closed'}`}
        initial={{ x: -300 }}
        animate={{ x: showSidebar ? 0 : -300 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            <Plus size={20} />
            New Chat
          </button>
          <button 
            className="sidebar-toggle"
            onClick={() => setShowSidebar(!showSidebar)}
            title="Toggle Sidebar"
          >
            <MessageSquare size={20} />
          </button>
          <button 
            className="sidebar-toggle"
            onClick={loadChatHistory}
            title="Refresh Chat History"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        <div className="chat-history">
          {console.log('Rendering chat history:', chatHistory)}
          {chatHistory.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--neutral-500)' }}>
              <MessageCircle size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p>No previous chats</p>
              <p style={{ fontSize: '0.8rem' }}>Start a new conversation!</p>
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div 
                key={chat.chat_id}
                className={`chat-item ${currentChatId === chat.chat_id ? 'active' : ''}`}
                onClick={() => loadChat(chat.chat_id)}
              >
                <div className="chat-item-content">
                  <span className="chat-title">{chat.title}</span>
                  <span className="chat-date">
                    {new Date(chat.last_message_at).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChat(chat.chat_id)
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="chatbot-main">
        {/* Chat Header */}
        <div className="chat-header">
          <button 
            className="sidebar-toggle-mobile"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <MessageSquare size={20} />
          </button>
          
          {editingTitle ? (
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              onBlur={() => updateChatTitle(currentTitle)}
              onKeyPress={(e) => e.key === 'Enter' && updateChatTitle(currentTitle)}
              className="title-input"
              autoFocus
            />
          ) : (
            <div className="chat-title-section">
              <h1>{currentTitle}</h1>
              {currentChatId && (
                <button 
                  className="edit-title-btn"
                  onClick={() => setEditingTitle(true)}
                >
                  <Edit3 size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="chat-container">
          {messages.length === 0 ? (
            <>
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
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <h4>{prompt.title}</h4>
                      <p>{prompt.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          ) : (
            <div className="chat-messages">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`message ${message.type}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-avatar">
                      {message.type === 'user' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {message.content}
                      </div>
                      {message.confidence && (
                        <div className="confidence-indicator">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                      {message.metadata?.roadmap && (
                        <div className="roadmap-preview">
                          <div className="roadmap-header">
                            <MapPin size={16} />
                            <span>Generated Roadmap</span>
                          </div>
                          <div className="roadmap-content">
                            <h4>{message.metadata.roadmap.title}</h4>
                            <p><strong>Domain:</strong> {message.metadata.roadmap.domain}</p>
                            <div className="roadmap-steps">
                              {message.metadata.roadmap.steps.slice(0, 3).map((step, index) => (
                                <div key={index} className="roadmap-step">
                                  <strong>{index + 1}. {step.category}</strong>
                                  <ul>
                                    {step.skills.slice(0, 2).map((skill, skillIndex) => (
                                      <li key={skillIndex}>{skill}</li>
                                    ))}
                                    {step.skills.length > 2 && <li>...and {step.skills.length - 2} more</li>}
                                  </ul>
                                </div>
                              ))}
                              {message.metadata.roadmap.steps.length > 3 && (
                                <p>...and {message.metadata.roadmap.steps.length - 3} more steps</p>
                              )}
                            </div>
                            <div className="roadmap-actions">
                              <button 
                                className="roadmap-action-btn primary"
                                onClick={() => handleShowRoadmapModal(message.metadata.roadmap)}
                              >
                                <PlusCircle size={16} />
                                Add to My Roadmaps
                              </button>
                              <button 
                                className="roadmap-action-btn secondary"
                                onClick={() => handleShowRoadmapModal(message.metadata.roadmap)}
                              >
                                View Full Roadmap
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="message-suggestions">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              className="suggestion-chip"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  className="message bot"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Chat Input */}
          <motion.div 
            className="chat-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="input-container">
              <input 
                ref={inputRef}
                type="text" 
                placeholder={isServiceAvailable ? "Ask me anything..." : "Service unavailable - please try again later"}
                className="chat-input-field"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isServiceAvailable || isLoading}
              />
              <button 
                className="send-button"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !isServiceAvailable}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Roadmap Modal */}
      {showRoadmapModal && currentRoadmap && (
        <motion.div 
          className="roadmap-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseRoadmapModal}
        >
          <motion.div 
            className="roadmap-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="roadmap-modal-header">
              <div className="roadmap-modal-title">
                <MapPin size={24} />
                <h2>{currentRoadmap.title}</h2>
              </div>
              <button 
                className="roadmap-modal-close"
                onClick={handleCloseRoadmapModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="roadmap-modal-content">
              <div className="roadmap-info">
                <p><strong>Domain:</strong> {currentRoadmap.domain}</p>
                <p><strong>Goal:</strong> {currentRoadmap.goal}</p>
              </div>
              
              <div className="roadmap-steps-full">
                <h3>Learning Steps</h3>
                {currentRoadmap.steps.map((step, index) => (
                  <div key={index} className="roadmap-step-full">
                    <div className="step-header">
                      <span className="step-number">{index + 1}</span>
                      <h4>{step.category}</h4>
                    </div>
                    <ul className="step-skills">
                      {step.skills.map((skill, skillIndex) => (
                        <li key={skillIndex}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="roadmap-modal-actions">
              <button 
                className="roadmap-modal-btn primary"
                onClick={() => handleAddRoadmapToSaved(currentRoadmap)}
              >
                <CheckCircle size={16} />
                Add to My Roadmaps
              </button>
              <button 
                className="roadmap-modal-btn secondary"
                onClick={handleCloseRoadmapModal}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Chatbot 