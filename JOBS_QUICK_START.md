# 🚀 Jobs Page Quick Start Guide

## Overview
The Jobs page provides AI-powered job search functionality with real-time job listings from multiple sources.

## Features
- **AI Job Search** - Intelligent job matching using Groq AI
- **Multiple Sources** - LinkedIn, Indeed, Glassdoor integration
- **Real-time Results** - Live job data from Serper API
- **Smart Filtering** - AI-powered relevance scoring

## Setup

### 1. Environment Variables
Create a `.env` file in the dashboard directory:
```bash
# API Keys
VITE_SERPER_API_KEY=your_serper_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 2. API Keys Required
- **Serper API**: Get from [serper.dev](https://serper.dev/)
- **Groq API**: Get from [console.groq.com](https://console.groq.com/)

## Usage

### Basic Job Search
1. Navigate to Jobs page
2. Enter job title and location
3. Click "Search Jobs"
4. Browse AI-curated results

### Advanced Search
- Use filters for experience level
- Filter by job type (full-time, part-time, etc.)
- Sort by relevance or date

## API Integration

### Job Search Flow
```
User Input → Serper API → Job Data → Groq AI → Filtered Results
```

### Key Components
- `src/pages/Jobs.jsx` - Main jobs page
- `src/services/jobService.js` - Job search logic
- `src/config/api.js` - API configuration

## 🐛 Troubleshooting

### **No Jobs Showing**

**Check 1: API Keys**
```javascript
// Open: dashboard/src/config/api.js
// Verify keys are set via environment variables:
SERPER_API_KEY: import.meta.env.VITE_SERPER_API_KEY
GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY
```

**Check 2: Network Requests**
- Open DevTools → Network tab
- Look for requests to:
  - `google.serper.dev/search`
  - `api.groq.com/openai/v1/chat/completions`

**Check 3: Console Errors**
- Check for CORS issues
- Verify API key format
- Check rate limiting

### **Slow Performance**
- Reduce `MAX_RESULTS` in config
- Implement caching
- Use pagination

### **API Errors**
- Verify API keys are valid
- Check API quotas
- Monitor rate limits

## Development

### Testing
```bash
# Test job search
npm run test:jobs

# Test API integration
npm run test:api
```

### Adding New Job Sources
1. Update `JOB_SOURCES` in `api.js`
2. Modify search logic in `jobService.js`
3. Update UI filters in `Jobs.jsx`

## Production Notes
- Use environment variables for all API keys
- Implement proper error handling
- Add rate limiting
- Monitor API usage
- Cache results when possible