# Jobs Page - Quick Start Guide 🚀

## ✅ Files Created

```
dashboard/
├── src/
│   ├── config/
│   │   └── api.js                    ✅ Created
│   ├── services/
│   │   └── jobSearchService.js       ✅ Created
│   ├── utils/
│   │   └── dateFormatter.js          ✅ Created
│   └── pages/
│       └── Jobs.jsx                  ✅ Refactored
│
└── Documentation:
    ├── JOBS_ARCHITECTURE.md          ✅ Full architecture docs
    ├── JOBS_REFACTOR_SUMMARY.md      ✅ Before/after comparison
    ├── JOBS_FLOW_DIAGRAM.txt         ✅ Visual flow diagram
    └── JOBS_QUICK_START.md           ✅ This file
```

---

## 🚀 How to Test

### **1. Start the Frontend**
```bash
cd dashboard
npm install  # If not already done
npm run dev  # or: npm start
```

### **2. Open Browser**
```
http://localhost:5173
```

### **3. Navigate to Jobs Page**
Click on "Jobs" or "Opportunities" in the navigation menu

### **4. Test Auto-Load**
- Jobs should automatically load based on your roadmap
- Should see ~12 job cards
- Each card should have an "Apply Now" link

### **5. Test Search**
Type a query and press Enter or click Search:
- "React Developer"
- "Python Engineer"
- "Data Scientist"
- "Full Stack Developer"

### **6. Verify Hyperlinks**
- Click "Apply Now" on any job card
- Should open LinkedIn/Indeed/Glassdoor in new tab
- Should go directly to the job posting

---

## 🔍 What to Check

### **✅ Visual Checks**
- [ ] Jobs load automatically on page load
- [ ] Loading spinner appears during search
- [ ] Job cards display properly
- [ ] Company logos show (first letter)
- [ ] Location and salary display
- [ ] "Apply Now" buttons are visible
- [ ] AI badge shows "Browser-Based AI Search"
- [ ] Job stats show total and sources

### **✅ Functionality Checks**
- [ ] Search bar accepts input
- [ ] Search button triggers search
- [ ] Enter key triggers search
- [ ] Refresh button reloads jobs
- [ ] Empty search loads roadmap-based jobs
- [ ] Error message shows on API failure
- [ ] Click "Apply Now" opens job URL

### **✅ Console Checks**
Open browser DevTools (F12) and check console for:
- [ ] `🔍 Searching jobs for: [query]`
- [ ] `📊 Serper API results: {...}`
- [ ] `🤖 Groq AI extracted jobs: [...]`
- [ ] No errors (unless APIs fail)

---

## 🐛 Troubleshooting

### **No Jobs Showing**

**Check 1: API Keys**
```javascript
// Open: dashboard/src/config/api.js
// Verify keys are set:
SERPER_API_KEY: 'a8df1a33b6fca0c0a6e794d18980aaa9f5dd02ee'
GROQ_API_KEY: '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'
```

**Check 2: Network Requests**
- Open DevTools → Network tab
- Look for requests to:
  - `google.serper.dev/search`
  - `api.groq.com/openai/v1/chat/completions`
- Check response status (should be 200)

**Check 3: Console Errors**
- Look for `❌` error messages
- Read error details
- Common issues:
  - CORS errors (not an issue with these APIs)
  - 401 Unauthorized (invalid API keys)
  - 429 Too Many Requests (rate limit hit)

### **Search Not Working**

**Solution 1: Clear Cache**
```
Ctrl+Shift+R (hard refresh)
```

**Solution 2: Check Search Query**
- Try simple queries first: "React Developer"
- Avoid special characters
- Don't search empty strings

**Solution 3: Check Console**
- Look for error messages
- Verify API calls are being made

### **Links Not Opening**

**Check 1: Job URL**
- Open DevTools → Console
- Check if jobs have `url` property
- Example: `console.log(jobs[0].url)`

**Check 2: Browser Popup Blocker**
- Allow popups from localhost
- Try Ctrl+Click instead

---

## 📊 API Response Examples

### **Serper API Response**
```json
{
  "organic": [
    {
      "title": "React Developer at Company Name",
      "link": "https://linkedin.com/jobs/...",
      "snippet": "We are looking for a React Developer..."
    }
  ]
}
```

### **Groq AI Response**
```json
[
  {
    "title": "React Developer",
    "company": "Company Name",
    "location": "Remote",
    "salary": "$100k - $150k",
    "url": "https://linkedin.com/jobs/...",
    "description": "Full description...",
    "requirements": ["React", "TypeScript", "Node.js"],
    "source": "linkedin"
  }
]
```

### **Service Response**
```json
{
  "success": true,
  "jobs": [...],
  "total": 12,
  "sources": ["Google", "LinkedIn", "Indeed", "Glassdoor"],
  "aiMatched": true
}
```

---

## 🎯 Expected Behavior

### **On Page Load:**
1. Gets user's roadmap from localStorage
2. Searches for jobs related to roadmap
3. Displays ~12 job cards
4. Shows stats (total, sources)
5. Displays AI badge

### **On Search:**
1. User types query and clicks Search
2. Loading spinner appears
3. Serper API fetches Google results
4. Groq AI extracts structured data
5. Jobs displayed with hyperlinks
6. Stats updated

### **On Error:**
1. Error message displayed
2. Detailed error in console
3. Suggestions shown to user

---

## 🔄 Common Search Queries to Test

```
✅ "React Developer"
✅ "Python Engineer"
✅ "Data Scientist"
✅ "Full Stack Developer"
✅ "Machine Learning Engineer"
✅ "DevOps Engineer"
✅ "UI/UX Designer"
✅ "Product Manager"
✅ "Software Engineer"
✅ "Frontend Developer"
```

---

## 📝 Code Structure Quick Reference

### **Jobs.jsx (UI Component)**
```javascript
// State management
const [jobs, setJobs] = useState([])
const [loading, setLoading] = useState(false)

// Handlers
const handleFetchUserJobs = async () => {
  const result = await searchJobs(query)
  setJobs(result.jobs)
}

const handleSearchJobs = async () => {
  const result = await searchJobs(searchQuery)
  setJobs(result.jobs)
}
```

### **jobSearchService.js (Business Logic)**
```javascript
// Main function
export const searchJobs = async (query) => {
  const searchResults = await searchJobsWithSerper(query)
  const extractedJobs = await extractJobsWithGroq(searchResults)
  const transformedJobs = transformJobsForDisplay(extractedJobs)
  return { success: true, jobs: transformedJobs, ... }
}
```

### **api.js (Configuration)**
```javascript
export const API_CONFIG = {
  SERPER_API_KEY: '...',
  GROQ_API_KEY: '...'
}
```

---

## 🎨 UI Elements

### **Header**
- Title: "OPPORTUNITIES (Career Hub)"
- Subtitle: "Real-time jobs from LinkedIn, Indeed, Glassdoor..."
- AI Badge: "Browser-Based AI Search"
- Refresh Button

### **Search Bar**
- Input field with placeholder
- Search button
- Loads ~12 results per search

### **Job Cards**
- Company logo (first letter)
- Job title
- Company name
- Location (+ Remote tag if applicable)
- Salary
- Source (via LinkedIn/Indeed/Glassdoor)
- Skills tags (if available)
- "Apply Now" button with link

### **Stats**
- Total jobs found
- Sources used

---

## ✅ Success Criteria

### **All tests pass if:**
1. ✅ Jobs load automatically
2. ✅ Search works correctly
3. ✅ Job cards display properly
4. ✅ "Apply Now" links work
5. ✅ No console errors
6. ✅ Loading states work
7. ✅ Error handling works
8. ✅ Stats display correctly

---

## 📚 Documentation Files

Read these for more details:
1. **JOBS_ARCHITECTURE.md** - Full system design
2. **JOBS_REFACTOR_SUMMARY.md** - What changed
3. **JOBS_FLOW_DIAGRAM.txt** - Visual flow
4. **This file** - Quick start guide

---

## 🆘 Need Help?

Check console for:
- `🔍` Search logs
- `📊` API response logs
- `🤖` AI extraction logs
- `❌` Error messages

If issues persist:
1. Check API keys in `config/api.js`
2. Verify network requests in DevTools
3. Check browser console for errors
4. Try different search queries
5. Hard refresh (Ctrl+Shift+R)

---

**Happy Testing! 🎉**

The jobs page now fetches real-time jobs from the browser using Serper API and Groq AI, with clean, maintainable architecture!

