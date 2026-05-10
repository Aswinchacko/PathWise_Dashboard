import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  MessageCircle,
  Bot,
  User,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  MapPin,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  X,
  BookOpen,
  Save,
  Zap,
  Lightbulb,
  Menu,
  Sparkles,
  Info,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import './Chatbot.css'
import chatbotService from '../services/chatbotService'
import authService from '../services/authService'
import roadmapService from '../services/roadmapService'

function resolveChatbotUserId() {
  const u = authService.getCurrentUser()
  if (u?.id) return String(u.id)
  const stored = localStorage.getItem('chatbot_user_id')
  if (stored) return stored
  const newId = `user_${Date.now()}`
  localStorage.setItem('chatbot_user_id', newId)
  return newId
}

// Simple markdown renderer with fallback
const SafeMarkdown = ({ content }) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [content])

  if (hasError) {
    return <div className="message-text">{content}</div>
  }

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        onError={(error) => {
          console.error('Markdown rendering error:', error)
          setHasError(true)
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

const Chatbot = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isServiceAvailable, setIsServiceAvailable] = useState(true)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [planMode, setPlanMode] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [currentTitle, setCurrentTitle] = useState('New Chat')
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [showRoadmapModal, setShowRoadmapModal] = useState(false)
  const [currentRoadmap, setCurrentRoadmap] = useState(null)
  const [showCreateRoadmapModal, setShowCreateRoadmapModal] = useState(false)
  const [roadmapTitle, setRoadmapTitle] = useState('')
  const [roadmapGoal, setRoadmapGoal] = useState('')
  const [roadmapDomain, setRoadmapDomain] = useState('')
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false)
  const [userId, setUserId] = useState(() => resolveChatbotUserId())
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const roadmapNoticeTimerRef = useRef(null)
  const [roadmapNotice, setRoadmapNotice] = useState(null)

  const ROADMAP_NOTICE_MS = 5000

  const dismissRoadmapNotice = () => {
    if (roadmapNoticeTimerRef.current) {
      clearTimeout(roadmapNoticeTimerRef.current)
      roadmapNoticeTimerRef.current = null
    }
    setRoadmapNotice(null)
  }

  const showRoadmapNotice = (message, variant = 'success') => {
    if (roadmapNoticeTimerRef.current) {
      clearTimeout(roadmapNoticeTimerRef.current)
      roadmapNoticeTimerRef.current = null
    }
    setRoadmapNotice({
      message,
      variant,
      id: Date.now(),
    })
    roadmapNoticeTimerRef.current = setTimeout(() => {
      setRoadmapNotice(null)
      roadmapNoticeTimerRef.current = null
    }, ROADMAP_NOTICE_MS)
  }

  useEffect(() => {
    return () => {
      if (roadmapNoticeTimerRef.current) {
        clearTimeout(roadmapNoticeTimerRef.current)
      }
    }
  }, [])

  // Prefer logged-in user id so chat + roadmaps align with Roadmap page
  useEffect(() => {
    const syncUser = () => setUserId(resolveChatbotUserId())
    syncUser()
    window.addEventListener('focus', syncUser)
    return () => window.removeEventListener('focus', syncUser)
  }, [])

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

  useEffect(() => {
    if (!planMode) return
    setShowRoadmapModal(false)
    setCurrentRoadmap(null)
    setShowCreateRoadmapModal(false)
  }, [planMode])

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
        confidence: msg.metadata?.confidence,
        roadmap_metadata: msg.metadata?.roadmap_metadata
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
        roadmap_metadata: response.roadmap_metadata,
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

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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

  const handleCreateRoadmapFromChat = async () => {
    const u = authService.getCurrentUser()
    if (!u?.id) {
      showRoadmapNotice('Sign in to save a roadmap to your Roadmap page.', 'error')
      return
    }
    if (!roadmapGoal.trim()) {
      showRoadmapNotice('Please enter a learning goal', 'error')
      return
    }
    if (!currentChatId) {
      showRoadmapNotice('Please start a conversation first', 'error')
      return
    }

    setIsCreatingRoadmap(true)
    try {
      await roadmapService.generateRoadmap(
        roadmapGoal.trim(),
        roadmapDomain.trim() || null,
        u.id
      )
      const detail = {
        goal: roadmapGoal.trim(),
        domain: roadmapDomain.trim() || '',
        title: roadmapTitle.trim() || roadmapGoal.trim(),
        name: roadmapTitle.trim() || roadmapGoal.trim(),
      }
      window.dispatchEvent(new CustomEvent('roadmapChanged', { detail }))
      setShowCreateRoadmapModal(false)
      setRoadmapTitle('')
      setRoadmapGoal('')
      setRoadmapDomain('')
      await loadSavedRoadmaps()
      showRoadmapNotice('Roadmap added — open Roadmap to view it.', 'success')
    } catch (error) {
      console.error('Error creating roadmap via generator:', error)
      try {
        const result = await chatbotService.createRoadmapFromChat(
          u.id,
          currentChatId,
          roadmapTitle.trim() || roadmapGoal.trim(),
          roadmapGoal.trim(),
          roadmapDomain.trim() || null
        )
        if (result.success) {
          window.dispatchEvent(
            new CustomEvent('roadmapChanged', { detail: { goal: roadmapGoal.trim() } })
          )
          setShowCreateRoadmapModal(false)
          setRoadmapTitle('')
          setRoadmapGoal('')
          setRoadmapDomain('')
          await loadSavedRoadmaps()
          showRoadmapNotice('Roadmap saved from chat (fallback). Open Roadmap to view.', 'success')
        } else {
          showRoadmapNotice('Failed to create roadmap', 'error')
        }
      } catch (e2) {
        showRoadmapNotice(
          'Failed to create roadmap: ' + (e2.message || error.message),
          'error'
        )
      }
    } finally {
      setIsCreatingRoadmap(false)
    }
  }

  const handleShowCreateRoadmapModal = () => {
    if (!currentChatId) {
      showRoadmapNotice('Please start a conversation first', 'error')
      return
    }
    setRoadmapTitle(currentTitle)
    setRoadmapGoal('')
    setRoadmapDomain('')
    setShowCreateRoadmapModal(true)
  }

  const composerDisabled = !isServiceAvailable || isLoading

  const renderComposer = (variant = 'hero') => (
    <div
      className={`chat-composer-card ${variant === 'sticky' ? 'chat-composer-card--sticky' : ''} ${planMode ? 'chat-composer-card--plan' : ''}`}
    >
      {planMode && (
        <div className="plan-mode-notice" role="status">
          <Info size={18} className="plan-mode-notice-icon" aria-hidden />
          <p>
            Roadmap generation from this chat isn&apos;t available in Plan mode. Turn{' '}
            <strong>Plan</strong> off to create or add roadmaps from the conversation.
          </p>
        </div>
      )}
      <textarea
        ref={inputRef}
        className="chat-composer-textarea"
        rows={variant === 'sticky' ? 2 : 4}
        placeholder={
          isServiceAvailable
            ? 'What do you want to learn or build?'
            : 'Service unavailable — try again later'
        }
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleComposerKeyDown}
        disabled={composerDisabled}
      />
      <div className="composer-toolbar">
        <div className="composer-toolbar-left">
          <button
            type="button"
            className="composer-icon-btn"
            title="New chat"
            onClick={() => {
              createNewChat()
              setShowSidebar(false)
            }}
          >
            <Plus size={20} strokeWidth={2} />
          </button>
          <span className="composer-model-label" title="Assistant">
            <Zap size={16} className="composer-model-icon" aria-hidden />
            PathWise AI
          </span>
        </div>
        <div className="composer-toolbar-right">
          <button
            type="button"
            className={`composer-plan-btn ${planMode ? 'is-on' : ''}`}
            onClick={() => setPlanMode((p) => !p)}
            title="Toggle planning focus"
          >
            <Lightbulb size={16} />
            Plan
          </button>
          <button
            type="button"
            className="composer-send-pill"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || composerDisabled}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Chat now
          </button>
        </div>
      </div>
    </div>
  )

  const handleQuickAddToRoadmap = async (roadmapMetadata) => {
    const u = authService.getCurrentUser()
    if (!u?.id) {
      showRoadmapNotice('Sign in to add this to your Roadmap page.', 'error')
      return
    }
    if (!currentChatId) {
      showRoadmapNotice('Please start a conversation first', 'error')
      return
    }

    const goalText =
      (roadmapMetadata.suggested_goal || '').trim() ||
      roadmapMetadata.suggested_title ||
      'Learning path'

    setIsCreatingRoadmap(true)
    try {
      await roadmapService.generateRoadmap(goalText, null, u.id)
      window.dispatchEvent(
        new CustomEvent('roadmapChanged', {
          detail: {
            goal: goalText,
            domain: roadmapMetadata.suggested_domain || '',
            title: roadmapMetadata.suggested_title || goalText,
            name: roadmapMetadata.suggested_title || goalText,
          },
        })
      )
      await loadSavedRoadmaps()
      showRoadmapNotice(
        `Added to Roadmap: ${roadmapMetadata.suggested_title || goalText}`,
        'success'
      )
    } catch (error) {
      console.error('Error generating roadmap from chat topic:', error)
      try {
        const result = await chatbotService.createRoadmapFromChat(
          u.id,
          currentChatId,
          roadmapMetadata.suggested_title,
          roadmapMetadata.suggested_goal,
          roadmapMetadata.suggested_domain
        )
        if (result.success) {
          window.dispatchEvent(
            new CustomEvent('roadmapChanged', { detail: { goal: goalText } })
          )
          await loadSavedRoadmaps()
          showRoadmapNotice(
            `Roadmap saved from chat: ${roadmapMetadata.suggested_title}`,
            'success'
          )
        } else {
          showRoadmapNotice('Failed to add roadmap. Try the Roadmap page.', 'error')
        }
      } catch (e2) {
        showRoadmapNotice(
          'Failed to add roadmap: ' + (e2.message || error.message),
          'error'
        )
      }
    } finally {
      setIsCreatingRoadmap(false)
    }
  }

  return (
    <div className="chatbot-page chatbot-page--modern">
      {showSidebar && (
        <button
          type="button"
          className="chatbot-sidebar-backdrop"
          aria-label="Close chat history"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <aside className={`chatbot-sidebar ${showSidebar ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            <Plus size={20} />
            New Chat
          </button>
          <button
            className="sidebar-toggle"
            onClick={() => setShowSidebar(false)}
            title="Close"
            type="button"
          >
            <X size={20} />
          </button>
          <button
            className="sidebar-toggle"
            onClick={loadChatHistory}
            title="Refresh Chat History"
            type="button"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="chat-history">
          {chatHistory.length === 0 ? (
            <div className="chat-history-empty">
              <MessageCircle size={32} />
              <p>No previous chats</p>
              <p className="chat-history-empty-hint">Start a new conversation!</p>
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.chat_id}
                className={`chat-item ${currentChatId === chat.chat_id ? 'active' : ''}`}
                onClick={() => {
                  loadChat(chat.chat_id)
                  setShowSidebar(false)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    loadChat(chat.chat_id)
                    setShowSidebar(false)
                  }
                }}
              >
                <div className="chat-item-content">
                  <span className="chat-title">{chat.title}</span>
                  <span className="chat-date">
                    {new Date(chat.last_message_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
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
      </aside>

      <div className="chatbot-main">
        <header className="chat-topbar">
          <button
            type="button"
            className="chat-topbar-menu"
            onClick={() => setShowSidebar(true)}
            title="Chat history"
          >
            <Menu size={22} />
          </button>
          {messages.length > 0 && (
            <div className="chat-topbar-center">
              {editingTitle ? (
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  onBlur={() => updateChatTitle(currentTitle)}
                  onKeyDown={(e) => e.key === 'Enter' && updateChatTitle(currentTitle)}
                  className="title-input title-input--compact"
                  autoFocus
                />
              ) : (
                <div className="chat-title-section chat-title-section--compact">
                  <h1 className="chat-thread-title">{currentTitle}</h1>
                  {currentChatId && (
                    <div className="title-actions">
                      <button
                        type="button"
                        className="edit-title-btn"
                        onClick={() => setEditingTitle(true)}
                        title="Edit Title"
                      >
                        <Edit3 size={16} />
                      </button>
                      {!planMode && (
                        <button
                          type="button"
                          className="create-roadmap-btn"
                          onClick={handleShowCreateRoadmapModal}
                          title="Create Roadmap from Chat"
                        >
                          <BookOpen size={16} />
                          <span className="create-roadmap-label">Roadmap</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="chat-topbar-spacer" />
        </header>

        <div className={`chat-container ${messages.length === 0 ? 'chat-container--hero' : 'chat-container--thread'}`}>
          {messages.length === 0 ? (
            <div className="chat-hero">
              <motion.div
                className="hero-announcement"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Sparkles size={14} aria-hidden />
                Introducing PathWise AI
              </motion.div>
              <motion.h1
                className="hero-headline"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                What will you <em className="hero-accent">learn</em> today?
              </motion.h1>
              <motion.p
                className="hero-sub"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Shape your career and learning path by chatting with AI — roadmaps, skills, and next steps in one place.
              </motion.p>

              <motion.div
                className="hero-composer-block"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
              >
                {renderComposer('hero')}
              </motion.div>
            </div>
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
                        {message.type === 'bot' ? (
                          <SafeMarkdown content={message.content} />
                        ) : (
                          message.content
                        )}
                      </div>
                      {message.confidence && (
                        <div className="confidence-indicator">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                      {!planMode &&
                      message.roadmap_metadata &&
                      message.roadmap_metadata.is_roadmap_request && (
                        <div className="roadmap-suggestion">
                          <div className="roadmap-suggestion-header">
                            <MapPin size={16} />
                            <span>Add this topic to your learning roadmap?</span>
                          </div>
                          <div className="roadmap-suggestion-content">
                            <p><strong>Suggested Title:</strong> {message.roadmap_metadata.suggested_title}</p>
                            <p><strong>Domain:</strong> {message.roadmap_metadata.suggested_domain}</p>
                            <button 
                              className="add-to-roadmap-btn"
                              onClick={() => handleQuickAddToRoadmap(message.roadmap_metadata)}
                              disabled={isCreatingRoadmap}
                            >
                              <PlusCircle size={16} />
                              Add to Roadmap
                            </button>
                          </div>
                        </div>
                      )}
                      {!planMode && message.metadata?.roadmap && (
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

          {messages.length > 0 && (
            <div className="chat-composer-sticky-wrap">{renderComposer('sticky')}</div>
          )}
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

      {/* Create Roadmap Modal */}
      {showCreateRoadmapModal && (
        <motion.div 
          className="roadmap-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCreateRoadmapModal(false)}
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
                <BookOpen size={24} />
                <h2>Create Roadmap from Chat</h2>
              </div>
              <button 
                className="roadmap-modal-close"
                onClick={() => setShowCreateRoadmapModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="roadmap-modal-content">
              <div className="form-group">
                <label htmlFor="roadmap-title">Roadmap Title *</label>
                <input
                  id="roadmap-title"
                  type="text"
                  value={roadmapTitle}
                  onChange={(e) => setRoadmapTitle(e.target.value)}
                  placeholder="e.g., Learn React Development"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="roadmap-goal">Learning Goal *</label>
                <textarea
                  id="roadmap-goal"
                  value={roadmapGoal}
                  onChange={(e) => setRoadmapGoal(e.target.value)}
                  placeholder="Describe what you want to achieve..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="roadmap-domain">Domain (Optional)</label>
                <input
                  id="roadmap-domain"
                  type="text"
                  value={roadmapDomain}
                  onChange={(e) => setRoadmapDomain(e.target.value)}
                  placeholder="e.g., Frontend Development, Data Science"
                  className="form-input"
                />
              </div>
              
              <div className="roadmap-preview">
                <h4>Preview</h4>
                <p><strong>Title:</strong> {roadmapTitle || 'Untitled Roadmap'}</p>
                <p><strong>Goal:</strong> {roadmapGoal || 'No goal specified'}</p>
                <p><strong>Domain:</strong> {roadmapDomain || 'General Learning'}</p>
                <p><strong>Source:</strong> Chat conversation with {messages.length} messages</p>
              </div>
            </div>
            
            <div className="roadmap-modal-actions">
              <button 
                className="roadmap-modal-btn primary"
                onClick={handleCreateRoadmapFromChat}
                disabled={isCreatingRoadmap || !roadmapGoal.trim()}
              >
                {isCreatingRoadmap ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Create Roadmap
                  </>
                )}
              </button>
              <button 
                className="roadmap-modal-btn secondary"
                onClick={() => setShowCreateRoadmapModal(false)}
                disabled={isCreatingRoadmap}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {roadmapNotice && (
          <motion.div
            className="roadmap-notice-overlay"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="roadmap-notice-title"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissRoadmapNotice}
          >
            <motion.div
              key={roadmapNotice.id}
              className={`roadmap-notice-modal roadmap-notice-modal--${roadmapNotice.variant}`}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="roadmap-notice-close"
                onClick={dismissRoadmapNotice}
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
              <div className="roadmap-notice-icon" aria-hidden>
                {roadmapNotice.variant === 'success' ? (
                  <CheckCircle size={44} strokeWidth={1.75} />
                ) : (
                  <AlertCircle size={44} strokeWidth={1.75} />
                )}
              </div>
              <h2 id="roadmap-notice-title" className="roadmap-notice-title">
                {roadmapNotice.variant === 'success' ? 'Roadmap' : 'Notice'}
              </h2>
              <p className="roadmap-notice-message">{roadmapNotice.message}</p>
              {roadmapNotice.variant === 'success' && (
                <Link
                  to="/roadmap"
                  className="roadmap-notice-link"
                  onClick={dismissRoadmapNotice}
                >
                  Open Roadmap
                </Link>
              )}
              <p className="roadmap-notice-hint">Closes in a few seconds…</p>
              <div className="roadmap-notice-timer-wrap">
                <div
                  className="roadmap-notice-timer-bar"
                  style={{ animationDuration: `${ROADMAP_NOTICE_MS}ms` }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Chatbot 