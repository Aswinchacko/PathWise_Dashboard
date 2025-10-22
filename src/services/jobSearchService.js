import { API_CONFIG, JOB_SOURCES, SEARCH_CONFIG } from '../config/api'

/**
 * Search for jobs using Serper API (Google Search)
 */
export const searchJobsWithSerper = async (query) => {
  try {
    const searchQuery = `${query} jobs site:${JOB_SOURCES.LINKEDIN} OR site:${JOB_SOURCES.INDEED} OR site:${JOB_SOURCES.GLASSDOOR}`
    
    const response = await fetch(API_CONFIG.SERPER_API_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': API_CONFIG.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: searchQuery,
        num: SEARCH_CONFIG.MAX_RESULTS
      })
    })

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('📊 Serper API results:', data)
    
    return data
  } catch (error) {
    console.error('❌ Serper API error:', error)
    throw error
  }
}

/**
 * Extract structured job data using Groq AI
 */
export const extractJobsWithGroq = async (searchResults) => {
  try {
    const organicResults = searchResults.organic?.slice(0, SEARCH_CONFIG.DISPLAY_LIMIT) || []
    
    if (organicResults.length === 0) {
      return []
    }

    const prompt = createJobExtractionPrompt(organicResults)
    
    const response = await fetch(API_CONFIG.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: API_CONFIG.GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a job data extractor. Return ONLY valid JSON arrays, no markdown, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: SEARCH_CONFIG.TEMPERATURE,
        max_tokens: SEARCH_CONFIG.MAX_TOKENS
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || '[]'
    
    // Clean up response - remove markdown code blocks if present
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    const extractedJobs = JSON.parse(cleanContent)
    console.log('🤖 Groq AI extracted jobs:', extractedJobs)
    
    return extractedJobs
  } catch (error) {
    console.error('❌ Groq API error:', error)
    // Return fallback parsed jobs from search results
    return createFallbackJobs(searchResults)
  }
}

/**
 * Create extraction prompt for Groq AI
 */
const createJobExtractionPrompt = (results) => {
  return `Extract job information from these search results and return ONLY a valid JSON array (no markdown, no extra text):

${JSON.stringify(results, null, 2)}

Return format (ONLY JSON, nothing else):
[
  {
    "title": "job title",
    "company": "company name",
    "location": "location or Remote",
    "salary": "salary range or Competitive",
    "url": "job posting url",
    "description": "brief description",
    "requirements": ["skill1", "skill2", "skill3"],
    "source": "linkedin/indeed/glassdoor"
  }
]`
}

/**
 * Create fallback jobs when Groq AI fails
 */
const createFallbackJobs = (searchResults) => {
  const organicResults = searchResults.organic?.slice(0, SEARCH_CONFIG.DISPLAY_LIMIT) || []
  
  return organicResults.map((result, index) => {
    const url = result.link || ''
    const source = getSourceFromUrl(url)
    
    return {
      id: index,
      title: result.title || 'Job Opportunity',
      company: extractCompanyFromTitle(result.title) || source,
      location: 'Remote/Onsite',
      salary: 'Competitive',
      url: url,
      description: result.snippet || '',
      requirements: [],
      source: source
    }
  })
}

/**
 * Determine job source from URL
 */
const getSourceFromUrl = (url) => {
  if (url.includes('linkedin')) return 'LinkedIn'
  if (url.includes('indeed')) return 'Indeed'
  if (url.includes('glassdoor')) return 'Glassdoor'
  return 'Google'
}

/**
 * Try to extract company name from job title
 */
const extractCompanyFromTitle = (title) => {
  if (!title) return null
  
  // Try to extract company name from patterns like "Company - Job Title" or "Job Title at Company"
  const patterns = [
    /at\s+([^-|]+)$/i,
    /^([^-|]+?)\s*[-|]/,
  ]
  
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return null
}

/**
 * Transform extracted jobs for display
 */
export const transformJobsForDisplay = (extractedJobs) => {
  return extractedJobs.map((job, index) => ({
    id: job.id || index,
    title: job.title,
    company: job.company,
    location: job.location || 'Remote/Onsite',
    salary: job.salary || 'Competitive',
    date: 'Recently',
    unlocked: true,
    description: job.description || '',
    logo: job.company ? job.company[0].toUpperCase() : '?',
    url: job.url,
    remote: job.location?.toLowerCase().includes('remote'),
    matchScore: job.matchScore || null,
    matchReason: job.matchReason || null,
    requirements: job.requirements || [],
    source: job.source || 'Google'
  }))
}

/**
 * Get user's roadmap from localStorage
 */
export const getUserRoadmap = () => {
  try {
    const roadmap = JSON.parse(localStorage.getItem('selectedRoadmap') || '{}')
    return roadmap.title || roadmap.name || ''
  } catch (error) {
    console.error('Error reading roadmap:', error)
    return ''
  }
}

/**
 * Main job search function
 */
export const searchJobs = async (query) => {
  try {
    console.log('🔍 Searching jobs for:', query)
    
    // Step 1: Search Google for jobs
    const searchResults = await searchJobsWithSerper(query)
    
    // Step 2: Extract structured job data with Groq AI
    const extractedJobs = await extractJobsWithGroq(searchResults)
    
    // Step 3: Transform for display
    const transformedJobs = transformJobsForDisplay(extractedJobs)
    
    return {
      success: true,
      jobs: transformedJobs,
      total: transformedJobs.length,
      sources: ['Google', 'LinkedIn', 'Indeed', 'Glassdoor'],
      aiMatched: true
    }
  } catch (error) {
    console.error('❌ Job search error:', error)
    throw error
  }
}

