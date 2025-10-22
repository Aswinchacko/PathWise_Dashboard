# Jobs Page - Quick Reference Cheatsheet 📋

## 🗂️ File Locations

```bash
dashboard/src/
├── config/api.js              # API keys & config
├── services/jobSearchService.js  # Job search logic
├── utils/dateFormatter.js     # Date utilities
└── pages/Jobs.jsx             # UI component
```

## 🔧 Key Functions

### **jobSearchService.js**
```javascript
searchJobs(query)              // Main search function
searchJobsWithSerper(query)    // Google search via Serper
extractJobsWithGroq(results)   // AI extraction via Groq
transformJobsForDisplay(jobs)  // Format for UI
getUserRoadmap()               // Get user's roadmap
```

### **Jobs.jsx**
```javascript
handleFetchUserJobs()          // Auto-load jobs
handleSearchJobs()             // Search with query
handleKeyPress()               // Enter key handler
```

## 🎯 Quick Test Commands

```bash
# Start frontend
cd dashboard
npm run dev

# Open browser
http://localhost:5173/jobs

# Test searches
"React Developer"
"Python Engineer"
"Data Scientist"
```

## 📊 API Endpoints

```javascript
// Serper API
POST https://google.serper.dev/search
Headers: { 'X-API-KEY': SERPER_API_KEY }

// Groq AI
POST https://api.groq.com/openai/v1/chat/completions
Headers: { 'Authorization': 'Bearer GROQ_API_KEY' }
```

## 🔍 Debug Console Logs

```javascript
🔍 Searching jobs for: [query]    // Search initiated
📊 Serper API results: {...}       // Google results
🤖 Groq AI extracted jobs: [...]   // AI extraction
❌ Error: [message]                // Errors
```

## ✅ Success Checklist

- [ ] Jobs auto-load on page mount
- [ ] Search returns results
- [ ] "Apply Now" links work
- [ ] No console errors
- [ ] Loading states work
- [ ] Stats display correctly

## 🐛 Quick Fixes

**No jobs showing?**
→ Check API keys in `config/api.js`

**Search not working?**
→ Check browser console for errors

**Links not opening?**
→ Verify job URLs in console

## 📚 Documentation

| File | What's Inside |
|------|---------------|
| `JOBS_ARCHITECTURE.md` | Full system design |
| `JOBS_REFACTOR_SUMMARY.md` | Before/after comparison |
| `JOBS_FLOW_DIAGRAM.txt` | Visual diagrams |
| `JOBS_QUICK_START.md` | Testing guide |
| `JOBS_RESTRUCTURE_COMPLETE.md` | Complete summary |
| `JOBS_CHEATSHEET.md` | This quick reference |

## 🚀 Quick Deploy Checklist

- [ ] Test locally first
- [ ] Verify API keys work
- [ ] Check all hyperlinks
- [ ] Test error handling
- [ ] Review console logs
- [ ] Document any issues

---

**Need more details? Read the full docs! 📖**

