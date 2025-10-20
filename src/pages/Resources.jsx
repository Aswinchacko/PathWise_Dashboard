import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Lightbulb, 
  FileText, 
  ExternalLink, 
  Search, 
  Filter, 
  Clock, 
  Star,
  BookOpen,
  Code,
  Layers,
  Palette,
  TestTube,
  Rocket,
  Server,
  Database,
  Shield,
  Settings,
  Cloud,
  Smartphone,
  BarChart,
  Brain,
  Cpu,
  Plus,
  Link,
  Zap,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react'
import resourcesService from '../services/resourcesService'
import './Resources.css'

const Resources = () => {
  const [domains, setDomains] = useState([])
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [resources, setResources] = useState([])
  const [filteredResources, setFilteredResources] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [scrapingStatus, setScrapingStatus] = useState(null)
  const [showScrapingModal, setShowScrapingModal] = useState(false)
  const [scrapingQuery, setScrapingQuery] = useState('')
  const [scrapingUrl, setScrapingUrl] = useState('')
  const [includeScrapedResources, setIncludeScrapedResources] = useState(true)
  const [scrapingSources, setScrapingSources] = useState([])
  const [activeTab, setActiveTab] = useState('browse') // 'browse' or 'scrape'

  const resourceTypes = ['All', 'Tutorial', 'Course', 'Documentation', 'Interactive', 'Book', 'Guide', 'Project', 'Video', 'Article']
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const typeIcons = {
    'Tutorial': BookOpen,
    'Course': Layers,
    'Documentation': FileText,
    'Interactive': Code,
    'Book': BookOpen,
    'Guide': FileText,
    'Project': Rocket,
    'Video': Smartphone,
    'Article': FileText
  }

  const difficultyColors = {
    'Beginner': 'var(--success-500)',
    'Intermediate': 'var(--warning-500)',
    'Advanced': 'var(--error-500)'
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, selectedType, selectedDifficulty, selectedDomain, includeScrapedResources])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Load domains
      const domainsData = await resourcesService.getAvailableDomains()
      setDomains(domainsData)
      
      // Load all resources (local + scraped if enabled)
      const allResources = includeScrapedResources 
        ? await resourcesService.getAllResourcesCombined(true)
        : await Promise.resolve(resourcesService.getAllResources())
      setResources(allResources)
      
      // Load stats
      const resourceStats = await resourcesService.getResourceStats()
      setStats(resourceStats)

      // Load scraping sources
      const sources = await resourcesService.getScrapingSources()
      setScrapingSources(sources)
    } catch (error) {
      console.error('Error loading resources:', error)
      // Set fallback data if API fails
      setResources(resourcesService.getAllResources())
      setStats({ 
        totalResources: resourcesService.getAllResources().length,
        byType: {},
        byDifficulty: {}
      })
      setScrapingSources([])
    } finally {
      setLoading(false)
    }
  }

  const handleDomainSelect = async (domain) => {
    setSelectedDomain(domain)
    try {
      if (includeScrapedResources) {
        // Get both local and scraped resources for the domain
        const [localResources, scrapedResources] = await Promise.all([
          resourcesService.getResourcesForDomain(domain),
          resourcesService.getScrapedResourcesByDomain(domain)
        ])
        
        // Combine and deduplicate
        const combined = [...localResources]
        const seenUrls = new Set(localResources.map(r => r.url))
        
        scrapedResources.forEach(resource => {
          if (!seenUrls.has(resource.url)) {
            combined.push({
              ...resource,
              id: resource.id || resource._id,
              color: resource.color || resourcesService.getColorForType(resource.type)
            })
          }
        })
        
        setResources(combined)
      } else {
        const domainResources = await resourcesService.getResourcesForDomain(domain)
        setResources(domainResources)
      }
    } catch (error) {
      console.error('Error loading domain resources:', error)
    }
  }

  // Scraping functions
  const handleScrapeQuery = async () => {
    if (!scrapingQuery.trim()) return
    
    setScrapingStatus({ type: 'loading', message: 'Scraping resources...' })
    
    try {
      const result = await resourcesService.scrapeResourcesForQuery(
        scrapingQuery, 
        selectedDomain, 
        { maxResults: 50 }
      )
      
      if (result.success) {
        setScrapingStatus({ 
          type: 'success', 
          message: `Successfully scraped ${result.data.resourcesFound} resources!` 
        })
        
        // Refresh resources to show new scraped data
        await loadInitialData()
        
        // Clear the query
        setScrapingQuery('')
      } else {
        setScrapingStatus({ 
          type: 'error', 
          message: result.error || 'Scraping failed' 
        })
      }
    } catch (error) {
      setScrapingStatus({ 
        type: 'error', 
        message: 'Network error during scraping' 
      })
    }
    
    // Clear status after 5 seconds
    setTimeout(() => setScrapingStatus(null), 5000)
  }

  const handleScrapeUrl = async () => {
    if (!scrapingUrl.trim()) return
    
    setScrapingStatus({ type: 'loading', message: 'Scraping URL...' })
    
    try {
      const result = await resourcesService.scrapeSpecificUrl(
        scrapingUrl, 
        selectedDomain, 
        scrapingQuery || 'General'
      )
      
      if (result.success) {
        setScrapingStatus({ 
          type: 'success', 
          message: 'Successfully scraped URL!' 
        })
        
        // Refresh resources
        await loadInitialData()
        
        // Clear the URL
        setScrapingUrl('')
      } else {
        setScrapingStatus({ 
          type: 'error', 
          message: result.error || 'URL scraping failed' 
        })
      }
    } catch (error) {
      setScrapingStatus({ 
        type: 'error', 
        message: 'Network error during URL scraping' 
      })
    }
    
    // Clear status after 5 seconds
    setTimeout(() => setScrapingStatus(null), 5000)
  }

  const toggleScrapedResources = async () => {
    const newValue = !includeScrapedResources
    setIncludeScrapedResources(newValue)
    // Reload resources with new setting
    if (newValue) {
      // When enabling scraped resources, reload data
      await loadInitialData()
    } else {
      // When disabling, just use local resources
      setResources(resourcesService.getAllResources())
    }
  }

  const filterResources = async () => {
    let filtered = [...resources]

    // Apply search filter
    if (searchQuery && includeScrapedResources) {
      try {
        // Search both local and scraped resources
        const [localResults, scrapedResults] = await Promise.all([
          Promise.resolve(resourcesService.searchResources(searchQuery, selectedDomain)),
          resourcesService.searchScrapedResources(searchQuery, { 
            domain: selectedDomain,
            limit: 100 
          })
        ])
        
        // Combine results
        const combined = [...localResults]
        const seenUrls = new Set(localResults.map(r => r.url))
        
        scrapedResults.forEach(resource => {
          if (!seenUrls.has(resource.url)) {
            combined.push({
              ...resource,
              id: resource.id || resource._id,
              color: resource.color || resourcesService.getColorForType(resource.type)
            })
          }
        })
        
        filtered = combined
      } catch (error) {
        console.error('Search error:', error)
        // Fallback to local search
        filtered = resourcesService.searchResources(searchQuery, selectedDomain)
      }
    } else if (searchQuery) {
      filtered = resourcesService.searchResources(searchQuery, selectedDomain)
    }

    // Apply type filter
    if (selectedType !== 'All') {
      filtered = filtered.filter(resource => resource.type === selectedType)
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(resource => resource.difficulty === selectedDifficulty)
    }

    setFilteredResources(filtered)
  }

  const handleResourceClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="resources-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading resources...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="resources-page">
      <motion.div 
        className="resources-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="header-left">
            <h1>Learning Resources</h1>
            <p>Discover curated learning materials and resources with AI-powered web scraping</p>
            {stats && (
              <div className="stats">
                <span className="stat">
                  <FileText size={20} />
                  {stats.totalResources || stats.total || 0} Resources
                </span>
                <span className="stat">
                  <Layers size={20} />
                  {Object.keys(stats.byType || {}).length} Types
                </span>
                <span className="stat">
                  <Star size={20} />
                  {Object.keys(stats.byDifficulty || {}).length} Levels
                </span>
                {stats.recentlyScraped && (
                  <span className="stat">
                    <Zap size={20} />
                    {stats.recentlyScraped} Recent
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button 
              className={`toggle-btn ${includeScrapedResources ? 'active' : ''}`}
              onClick={toggleScrapedResources}
              title="Include scraped resources"
            >
              <Database size={18} />
              Scraped Data
            </button>
            <button className="theme-toggle-btn">
              <Lightbulb size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters Row */}
      <motion.div 
        className="search-filters-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Search Bar */}
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Filter Controls */}
        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {resourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <Star size={16} />
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div 
        className="tabs-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <Search size={18} />
            Browse Resources
          </button>
          <button 
            className={`tab-btn ${activeTab === 'scrape' ? 'active' : ''}`}
            onClick={() => setActiveTab('scrape')}
          >
            <Zap size={18} />
            Web Scraping
          </button>
        </div>
      </motion.div>

      {/* Web Scraping Section */}
      {activeTab === 'scrape' && (
        <motion.div 
          className="scraping-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="scraping-container">
            <div className="scraping-header">
              <h3>🤖 AI-Powered Web Scraping</h3>
              <p>Automatically discover and collect learning resources from across the web</p>
            </div>
            
            <div className="scraping-forms">
              {/* Query Scraping */}
              <div className="scraping-form">
                <h4>
                  <Search size={18} />
                  Scrape by Topic
                </h4>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter topic (e.g., 'React hooks', 'Python machine learning')"
                    value={scrapingQuery}
                    onChange={(e) => setScrapingQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScrapeQuery()}
                  />
                  <button 
                    className="scrape-btn"
                    onClick={handleScrapeQuery}
                    disabled={!scrapingQuery.trim() || scrapingStatus?.type === 'loading'}
                  >
                    {scrapingStatus?.type === 'loading' ? (
                      <Loader size={18} className="spinning" />
                    ) : (
                      <Zap size={18} />
                    )}
                    Scrape Resources
                  </button>
                </div>
              </div>

              {/* URL Scraping */}
              <div className="scraping-form">
                <h4>
                  <Link size={18} />
                  Scrape Specific URL
                </h4>
                <div className="form-group">
                  <input
                    type="url"
                    placeholder="Enter URL to scrape (e.g., https://example.com/tutorial)"
                    value={scrapingUrl}
                    onChange={(e) => setScrapingUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScrapeUrl()}
                  />
                  <button 
                    className="scrape-btn"
                    onClick={handleScrapeUrl}
                    disabled={!scrapingUrl.trim() || scrapingStatus?.type === 'loading'}
                  >
                    {scrapingStatus?.type === 'loading' ? (
                      <Loader size={18} className="spinning" />
                    ) : (
                      <Download size={18} />
                    )}
                    Scrape URL
                  </button>
                </div>
              </div>
            </div>

            {/* Scraping Status */}
            {scrapingStatus && (
              <motion.div 
                className={`scraping-status ${scrapingStatus.type}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {scrapingStatus.type === 'loading' && <Loader size={18} className="spinning" />}
                {scrapingStatus.type === 'success' && <CheckCircle size={18} />}
                {scrapingStatus.type === 'error' && <AlertCircle size={18} />}
                <span>{scrapingStatus.message}</span>
              </motion.div>
            )}

            {/* Scraping Sources */}
            {scrapingSources.length > 0 && (
              <div className="scraping-sources">
                <h4>Available Sources</h4>
                <div className="sources-grid">
                  {scrapingSources.map((source, index) => (
                    <div key={source.name} className="source-card">
                      <div className="source-info">
                        <strong>{source.name}</strong>
                        <p>{source.description}</p>
                      </div>
                      <div className="source-types">
                        {source.types.map(type => (
                          <span key={type} className="type-tag">{type}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Browse by Domain Row - Only show in browse mode */}
      {activeTab === 'browse' && (
        <motion.div 
          className="domains-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
        <h3>Browse by Domain</h3>
        <div className="domains-grid">
          <motion.button
            className={`domain-btn ${!selectedDomain ? 'active' : ''}`}
            onClick={() => {
              setSelectedDomain(null)
              loadInitialData()
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            All
          </motion.button>
          {domains.map((domain, index) => (
            <motion.button
              key={domain}
              className={`domain-btn ${selectedDomain === domain ? 'active' : ''}`}
              onClick={() => handleDomainSelect(domain)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {domain}
            </motion.button>
          ))}
        </div>
        </motion.div>
      )}

      {/* Resources Grid */}
      <motion.div 
        className="resources-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="section-header">
          <h3>
            {selectedDomain ? `${selectedDomain} Resources` : 'All Resources'}
            <span className="count">({filteredResources.length})</span>
          </h3>
        </div>

        {filteredResources.length === 0 ? (
          <div className="no-resources">
            <FileText size={48} />
            <h4>No resources found</h4>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
      <div className="resources-grid">
            {filteredResources.map((resource, index) => {
              const IconComponent = typeIcons[resource.type] || FileText
              return (
          <motion.div
            key={resource.id}
            className="resource-card"
            style={{ '--resource-color': resource.color }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
          >
            <div className="resource-icon">
                    <IconComponent size={24} />
            </div>
            <div className="resource-content">
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <div className="resource-meta">
                      <div className="meta-tags">
                        <span 
                          className="resource-type"
                          style={{ backgroundColor: resource.color + '20', color: resource.color }}
                        >
                          {resource.type}
                        </span>
                        <span 
                          className="difficulty"
                          style={{ color: difficultyColors[resource.difficulty] }}
                        >
                          {resource.difficulty}
                        </span>
                        <span className="duration">
                          <Clock size={14} />
                          {resource.duration}
                        </span>
                      </div>
                      <button 
                        className="access-btn"
                        onClick={() => handleResourceClick(resource.url)}
                      >
                  <ExternalLink size={16} />
                  Access
                </button>
              </div>
            </div>
          </motion.div>
              )
            })}
      </div>
        )}
      </motion.div>
    </div>
  )
}

export default Resources 