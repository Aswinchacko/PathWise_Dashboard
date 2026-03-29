import { API_CONFIG, JOB_SOURCES, SEARCH_CONFIG } from '../config/api'

/**
 * Natural-language prefixes users type around a real role (strip for job search).
 */
const AIM_PREFIX_PATTERNS = [
  /^\s*create\s+a\s+roadmap\s+for\s+(?:me\s+to\s+)?(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*create\s+a\s+roadmap\s+for\s+/i,
  /^\s*create\s+roadmap\s+for\s+/i,
  /^\s*roadmap\s+for\s+(?:becoming\s+|be\s+)?(?:a\s+|an\s+)?/i,
  /^\s*roadmap\s+to\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*my\s+goal\s+is\s+to\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*i\s+want\s+to\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*i\s+am\s+interested\s+in\s+(?:becoming|being)\s+(?:a|an)\s+/i,
  /^\s*i\s+want\s+to\s+work\s+as\s+(?:a|an)\s+/i,
  /^\s*i\s+want\s+to\s+learn\s+/i,
  /^\s*learn\s+to\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*learn\s+how\s+to\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*(?:become|becoming)\s+(?:a|an)\s+/i,
  /^\s*path\s+to\s+(?:becoming|being)\s+(?:a|an)\s+/i,
  /^\s*how\s+to\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*transition\s+(?:into|to)\s+(?:being\s+)?(?:a|an)\s+/i,
  /^\s*get\s+a\s+job\s+as\s+(?:a|an)\s+/i,
  /^\s*break\s+into\s+/i,
  /^\s*pursue\s+(?:a\s+)?career\s+as\s+(?:a|an)\s+/i,
  /^\s*aiming\s+to\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*looking\s+to\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*start\s+(?:my\s+)?career\s+as\s+(?:a|an)\s+/i,
  /^\s*prepare\s+for\s+(?:a|an)\s+/i,
  /^\s*train\s+(?:to\s+)?(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*help\s+me\s+(?:become|be)\s+(?:a|an)\s+/i,
  /^\s*goal\s*:\s*/i,
  /^\s*career\s+goal\s*:\s*/i,
]

/** Match a concise tech role phrase inside a longer sentence */
const ROLE_PHRASE_RE =
  /\b((?:senior|junior|staff|principal|lead|mid[\s-]level|entry[\s-]level)\s+){0,1}(?:full[\s-]stack|front[\s-]?end|back[\s-]?end|mobile|android|ios|web|cloud|data|ml|ai|machine\s+learning|devops|site\s+reliability|\w+[\s\-+.]*\s+){0,3}(?:developers?|engineers?|architects?|scientists?|analysts?|designers?|programmers?|administrators?|specialists?|devops|sre|managers?)\b/gi

const STACK_ONLY_RE =
  /^(react|vue|angular|svelte|next\.?js|nuxt|node\.?js|express|python|django|flask|java|spring|kotlin|swift|rust|go(?:lang)?|ruby|rails|php|laravel|\.net|c#|csharp|graphql|terraform|kubernetes|docker|aws|azure|gcp)$/i

/** True if text looks like a job title / role (not a vague sentence). */
const looksLikeRolePhrase = (s) =>
  Boolean(
    s &&
      /\b(developer|engineer|architect|scientist|analyst|designer|programmer|devops|sre|specialist|administrator|manager|consultant|admin|tech\s+lead)\b/i.test(
        s
      )
  )

/**
 * Turn domain labels like "Full Stack Development" into job-board style text.
 */
export const domainToJobRolePhrase = (domain) => {
  if (!domain || typeof domain !== 'string') return ''
  let t = domain.trim().replace(/\s+/g, ' ')
  t = t.replace(/\bdata\s+science\b/gi, 'Data Science')
  t = t.replace(/\bmachine\s+learning\b/gi, 'Machine Learning')
  t = t.replace(/\bdevelopment\b/gi, 'Developer')
  t = t.replace(/\bengineering\b/gi, 'Engineer')
  t = t.replace(/\banalytics\b/gi, 'Analytics')
  return t.trim()
}

/**
 * Reduce a free-form career "aim" to keywords that work for job search / scraping.
 * @param {string} raw — e.g. "Create a roadmap for becoming a full-stack developer"
 * @returns {string} — e.g. "full-stack developer"
 */
export const extractTechnicalRoleFromAim = (raw) => {
  if (!raw || typeof raw !== 'string') return ''
  ROLE_PHRASE_RE.lastIndex = 0
  let s = raw.trim().replace(/\s+/g, ' ')
  s = s.replace(/^["']|["']$/g, '').trim()
  s = s.replace(/[.!?]+$/g, '').trim()

  let prev = ''
  for (let i = 0; i < 24 && s !== prev; i++) {
    prev = s
    for (const re of AIM_PREFIX_PATTERNS) {
      s = s.replace(re, '').trim()
    }
  }

  s = s.replace(/^(a|an|the)\s+/i, '').trim()

  if (s.length > 48 || s.split(/\s+/).length > 8) {
    ROLE_PHRASE_RE.lastIndex = 0
    let best = ''
    let m
    while ((m = ROLE_PHRASE_RE.exec(s)) !== null) {
      const chunk = m[0].trim().replace(/^(a|an|the)\s+/i, '')
      if (chunk.length >= best.length) best = chunk
    }
    if (best) s = best
  }

  s = s.replace(/^(a|an|the)\s+/i, '').trim()

  if (STACK_ONLY_RE.test(s)) {
    return `${s} Developer`.replace(/\s+/g, ' ')
  }

  return s
}

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
export const extractJobsWithGroq = async (searchResults, careerContext = null) => {
  try {
    const organicResults = searchResults.organic?.slice(0, SEARCH_CONFIG.DISPLAY_LIMIT) || []
    
    if (organicResults.length === 0) {
      return []
    }

    const prompt = createJobExtractionPrompt(organicResults, careerContext)
    
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
 * @param {object} results - Serper organic results payload
 * @param {{ goal?: string, domain?: string, goalFull?: string } | null} careerContext - user's roadmap focus
 */
const createJobExtractionPrompt = (results, careerContext = null) => {
  const shortGoal = careerContext?.goal
  const longAim = careerContext?.goalFull
  const focus =
    shortGoal || careerContext?.domain
      ? `\n\nCareer focus: Search targets "${shortGoal || 'their goal'}"${
          longAim && longAim !== shortGoal ? ` (from aim: ${longAim.slice(0, 200)})` : ''
        }${
          careerContext.domain ? ` in domain "${careerContext.domain}"` : ''
        }. Prefer roles that clearly align; omit unrelated listings when possible.`
      : ''

  return `Extract job information from these search results and return ONLY a valid JSON array (no markdown, no extra text):
${focus}

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
 * Full roadmap context for job search (aligned with Roadmap.jsx localStorage shape).
 * `goalFull` is the raw aim; `goal` / `searchQuery` are shortened for scraping.
 */
export const getRoadmapJobContext = () => {
  try {
    let goalFull = ''
    let domain = ''

    const selectedRaw = localStorage.getItem('selectedRoadmap')
    if (selectedRaw) {
      const r = JSON.parse(selectedRaw)
      goalFull = String(r.goal || r.title || r.name || '').trim()
      domain = String(r.domain || '').trim()
    }

    if (!goalFull) {
      const cgRaw = localStorage.getItem('current_goal')
      if (cgRaw) {
        const g = JSON.parse(cgRaw)
        goalFull = String(g.goal || '').trim()
        if (!domain) domain = String(g.domain || '').trim()
      }
    }

    const fromAim = extractTechnicalRoleFromAim(goalFull)
    const fromDomain = domainToJobRolePhrase(domain)
    let roleTerms =
      fromAim.length >= 3
        ? fromAim
        : fromDomain || fromAim || 'software developer'
    if (roleTerms.length < 3) roleTerms = fromDomain || 'software developer'
    if (
      fromDomain &&
      fromAim.length >= 3 &&
      !looksLikeRolePhrase(fromAim) &&
      looksLikeRolePhrase(fromDomain)
    ) {
      roleTerms = fromDomain
    }

    const searchQuery = roleTerms

    return {
      goalFull,
      goal: roleTerms,
      domain,
      searchQuery,
      hasRoadmap: Boolean(goalFull)
    }
  } catch (error) {
    console.error('Error reading roadmap for jobs:', error)
    return {
      goalFull: '',
      goal: 'software developer',
      domain: '',
      searchQuery: 'software developer',
      hasRoadmap: false
    }
  }
}

/**
 * @deprecated Prefer getRoadmapJobContext().searchQuery — kept for any external imports.
 */
export const getUserRoadmap = () => getRoadmapJobContext().searchQuery

/**
 * Main job search function
 * @param {string} query - Search terms (job title / role)
 * @param {{ goal?: string, domain?: string } | null} careerContext - optional roadmap hint for AI filtering
 */
export const searchJobs = async (query, careerContext = null) => {
  try {
    const q = (query && String(query).trim()) || getRoadmapJobContext().searchQuery
    console.log('🔍 Searching jobs for:', q, careerContext ? `(roadmap: ${careerContext.goal})` : '')
    
    // Step 1: Search Google for jobs
    const searchResults = await searchJobsWithSerper(q)
    
    // Step 2: Extract structured job data with Groq AI
    const extractedJobs = await extractJobsWithGroq(searchResults, careerContext)
    
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

