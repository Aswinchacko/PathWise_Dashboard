// API Configuration
// Note: In production, use environment variables or backend proxy
export const API_CONFIG = {
  SERPER_API_KEY: import.meta.env.VITE_SERPER_API_KEY,
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
  SERPER_API_URL: 'https://google.serper.dev/search',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  GROQ_MODEL: 'llama-3.1-8b-instant'
}

export const JOB_SOURCES = {
  LINKEDIN: 'linkedin.com',
  INDEED: 'indeed.com',
  GLASSDOOR: 'glassdoor.com'
}

export const SEARCH_CONFIG = {
  MAX_RESULTS: 20,
  DISPLAY_LIMIT: 12,
  TEMPERATURE: 0.1,
  MAX_TOKENS: 4000
}