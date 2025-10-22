# Jobs Page Architecture

## 📁 File Structure

```
dashboard/src/
├── config/
│   └── api.js                    # API configuration & constants
├── services/
│   └── jobSearchService.js       # Job search business logic
├── utils/
│   └── dateFormatter.js          # Date formatting utility
└── pages/
    └── Jobs.jsx                  # UI Component (clean & focused)
```

---

## 🏗️ Architecture Overview

### **Separation of Concerns**

| Layer | Purpose | Files |
|-------|---------|-------|
| **Config** | API keys, endpoints, constants | `config/api.js` |
| **Service** | Business logic, API calls | `services/jobSearchService.js` |
| **Utils** | Reusable helper functions | `utils/dateFormatter.js` |
| **UI** | React components, user interaction | `pages/Jobs.jsx` |

---

## 📄 File Descriptions

### **1. `config/api.js`**
**Purpose:** Centralized configuration for all API-related constants

```javascript
- API_CONFIG: API keys and endpoints
- JOB_SOURCES: Supported job platforms
- SEARCH_CONFIG: Search parameters
```

**Why?**
- Single source of truth for API configuration
- Easy to update API keys
- Simple to switch between dev/prod environments

---

### **2. `services/jobSearchService.js`**
**Purpose:** All job search business logic and API interactions

**Functions:**
- `searchJobsWithSerper(query)` - Search Google for jobs
- `extractJobsWithGroq(searchResults)` - Extract structured data with AI
- `transformJobsForDisplay(jobs)` - Format jobs for UI
- `getUserRoadmap()` - Get user's roadmap from localStorage
- `searchJobs(query)` - Main search function (orchestrates everything)

**Why?**
- Keeps API logic separate from UI
- Reusable across multiple components
- Easy to test business logic
- Clean error handling
- Fallback mechanisms built-in

---

### **3. `utils/dateFormatter.js`**
**Purpose:** Date formatting utilities

**Functions:**
- `formatDate(dateString)` - Convert date to relative format

**Why?**
- Reusable utility function
- Single responsibility principle
- Can be used across the app

---

### **4. `pages/Jobs.jsx`**
**Purpose:** UI component - handles only user interaction and display

**Responsibilities:**
- Render UI elements
- Manage component state
- Handle user interactions
- Call service functions

**Clean Component:**
- No API calls directly in component
- No complex business logic
- Easy to read and maintain
- Focused on presentation

---

## 🔄 Data Flow

```
User Action (Search/Load)
    ↓
Jobs.jsx (UI Handler)
    ↓
jobSearchService.js
    ↓
┌─────────────────────┐
│ 1. searchJobsWithSerper()
│    ↓
│    Serper API → Google Search Results
│
│ 2. extractJobsWithGroq()
│    ↓
│    Groq AI → Structured Job Data
│
│ 3. transformJobsForDisplay()
│    ↓
│    Formatted Job Objects
└─────────────────────┘
    ↓
Jobs.jsx (Update State & Display)
    ↓
User sees job cards with hyperlinks
```

---

## 🎯 Benefits of This Structure

### **1. Maintainability**
- Easy to find and fix bugs
- Clear separation of concerns
- Well-documented code

### **2. Scalability**
- Add new job sources easily
- Switch APIs without touching UI
- Extend functionality without breaking existing code

### **3. Testability**
- Service functions can be unit tested
- Mock API calls easily
- Test business logic independently

### **4. Reusability**
- Service functions can be used in other components
- Utilities are app-wide
- Configuration is centralized

### **5. Readability**
- Clean, focused component code
- Self-documenting function names
- Logical file organization

---

## 🔧 How to Modify

### **Add a New Job Source**
1. Update `config/api.js`:
   ```javascript
   JOB_SOURCES: {
     NEW_SOURCE: 'newjobsite.com'
   }
   ```

2. Update search query in `jobSearchService.js`:
   ```javascript
   const searchQuery = `${query} jobs site:${JOB_SOURCES.NEW_SOURCE}`
   ```

### **Change API Keys**
Edit `config/api.js`:
```javascript
export const API_CONFIG = {
  SERPER_API_KEY: 'new_key_here',
  GROQ_API_KEY: 'new_key_here'
}
```

### **Add New Search Filters**
1. Update `SEARCH_CONFIG` in `config/api.js`
2. Modify `searchJobsWithSerper()` in `jobSearchService.js`
3. Add UI controls in `Jobs.jsx`

---

## 🚀 API Flow Details

### **Serper API (Google Search)**
```javascript
POST https://google.serper.dev/search
Headers: { 'X-API-KEY': SERPER_API_KEY }
Body: {
  q: "React Developer jobs site:linkedin.com OR site:indeed.com",
  num: 20
}
```

### **Groq AI (Data Extraction)**
```javascript
POST https://api.groq.com/openai/v1/chat/completions
Headers: { 'Authorization': 'Bearer GROQ_API_KEY' }
Body: {
  model: 'mixtral-8x7b-32768',
  messages: [
    { role: 'system', content: 'You are a job data extractor...' },
    { role: 'user', content: 'Extract job data from...' }
  ]
}
```

---

## 🛡️ Error Handling

### **Service Layer**
- Try-catch blocks in all async functions
- Fallback data when AI extraction fails
- Detailed console logging for debugging

### **UI Layer**
- Loading states during API calls
- Error messages for failed requests
- Graceful degradation (shows fallback jobs)

---

## 📝 Best Practices Used

✅ **Separation of Concerns** - Each file has a single responsibility  
✅ **DRY Principle** - No code duplication  
✅ **Error Handling** - Comprehensive error management  
✅ **Fallback Mechanisms** - Graceful degradation  
✅ **Documentation** - Clear comments and JSDoc  
✅ **Naming Conventions** - Self-documenting code  
✅ **Modular Design** - Easy to extend and modify  

---

## 🔐 Security Notes

⚠️ **Current Setup (Development):**
- API keys are in `config/api.js`
- Keys are exposed in browser

⚠️ **For Production:**
- Move keys to backend proxy
- Use environment variables
- Implement rate limiting
- Add request validation

---

## 📊 Component State Management

```javascript
const [jobs, setJobs] = useState([])           // Job list
const [loading, setLoading] = useState(false)  // Loading state
const [searchQuery, setSearchQuery] = useState('') // Search input
const [error, setError] = useState(null)       // Error messages
const [jobStats, setJobStats] = useState({     // Statistics
  total: 0,
  sources: [],
  aiMatched: false
})
```

---

## 🎨 UI Components Structure

```
Jobs.jsx
├── Header (Title + Refresh Button)
├── Search Bar (Input + Search Button)
├── Stats Display (Total, Sources)
├── Error Display (if any)
├── Loading Spinner
└── Jobs Grid
    └── Job Cards (with Apply Now links)
```

---

## 🧪 Testing Strategy

### **Unit Tests (Service Layer)**
```javascript
- searchJobsWithSerper() with mock data
- extractJobsWithGroq() with various inputs
- transformJobsForDisplay() with edge cases
- getUserRoadmap() with different localStorage states
```

### **Integration Tests**
```javascript
- Full search flow (Serper → Groq → Display)
- Error handling scenarios
- Fallback mechanisms
```

### **E2E Tests (UI)**
```javascript
- Search functionality
- Job card rendering
- Apply Now link clicks
```

---

## 📚 Resources

- **Serper API Docs:** https://serper.dev/docs
- **Groq API Docs:** https://console.groq.com/docs
- **React Best Practices:** https://react.dev/learn

---

**Built with ❤️ for PathWise**

