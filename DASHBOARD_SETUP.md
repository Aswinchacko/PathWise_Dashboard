# PathWise Dashboard Setup

## 🚀 Features

The PathWise Dashboard provides a professional, real-time view of your career guidance platform with:

- **Real-time Statistics**: Live data from all services
- **System Monitoring**: Health checks for all APIs
- **Recent Activity**: User actions and roadmap generation
- **Quick Actions**: Direct access to main features
- **Professional UI**: Clean, modern design with loading states

## 📊 Data Sources

The dashboard connects to all PathWise services:

1. **Roadmap API** (Port 8000)
   - Roadmap generation statistics
   - User-generated roadmaps count
   - Domain distribution

2. **Chatbot Service** (Port 8001)
   - Chat session statistics
   - AI conversation metrics

3. **Resume Parser** (Port 8002)
   - Resume processing statistics
   - Document analysis metrics

4. **Auth Backend** (Port 5000)
   - User statistics
   - Authentication metrics

## 🔧 Setup

### Prerequisites
- All PathWise services running
- MongoDB database accessible
- Node.js and npm installed

### Installation

1. **Install Dependencies**
   ```bash
   cd dashboard
   npm install
   ```

2. **Start the Dashboard**
   ```bash
   npm run dev
   ```

3. **Access Dashboard**
   - Open http://localhost:5173
   - Navigate to the Dashboard page

## 🎯 Dashboard Components

### Statistics Cards
- **Total Users**: Active users across the platform
- **Roadmaps Generated**: Career paths created
- **Chat Sessions**: AI conversations held
- **Resumes Processed**: Documents analyzed

### Quick Actions
- **Generate Roadmap**: Create personalized career paths
- **AI Chatbot**: Start career guidance conversations
- **Parse Resume**: Upload and analyze resumes
- **Analytics**: View detailed insights

### Recent Activity
- Real-time feed of user actions
- Roadmap generation events
- Chat session starts
- Resume uploads

### System Status
- Health monitoring for all services
- Uptime tracking
- Service availability indicators

## 🔄 Data Refresh

- **Auto-refresh**: Every 5 minutes
- **Manual refresh**: Click refresh button
- **Cache**: 5-minute cache for performance
- **Error handling**: Graceful fallbacks

## 🎨 UI Features

- **Loading States**: Skeleton loaders during data fetch
- **Error Indicators**: Visual alerts for service issues
- **Responsive Design**: Works on all screen sizes
- **Professional Styling**: Clean, modern interface

## 🛠️ Development

### Service Configuration
Update API endpoints in `src/services/dashboardService.js`:

```javascript
const API_BASE_URLS = {
  roadmap: 'http://localhost:8000/api/roadmap',
  chatbot: 'http://localhost:8001/api/chatbot',
  resume: 'http://localhost:8002/api/resume',
  auth: 'http://localhost:5000/api/auth'
}
```

### Adding New Metrics
1. Add new method to `dashboardService.js`
2. Update dashboard component to display data
3. Add loading states and error handling

## 📈 Performance

- **Caching**: 5-minute cache for API calls
- **Parallel Requests**: Multiple API calls simultaneously
- **Error Resilience**: Continues working if some services fail
- **Loading States**: Smooth user experience

## 🔍 Troubleshooting

### Common Issues

1. **No Data Loading**
   - Check if all services are running
   - Verify API endpoints are correct
   - Check browser console for errors

2. **System Status Offline**
   - Ensure all services have health endpoints
   - Check network connectivity
   - Verify service ports

3. **Slow Loading**
   - Check MongoDB connection
   - Verify API response times
   - Check network latency

### Debug Mode
Enable debug logging by opening browser console to see detailed API calls and responses.

## 🎉 Success!

Your PathWise Dashboard is now connected to real data and provides professional monitoring of your career guidance platform!


