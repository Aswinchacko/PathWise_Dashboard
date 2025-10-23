# PathWise Dashboard Frontend

React frontend for the PathWise career development platform with modern UI and interactive features.

## Features

- **Modern UI Design** - Clean, responsive interface with Framer Motion animations
- **Interactive Dashboard** - Progress tracking, goals, and learning metrics
- **Career Roadmap** - Visual career path planning and progression
- **Project Recommendations** - Curated project suggestions based on skills
- **Mentor Network** - Connect with industry professionals
- **Job Opportunities** - Browse and apply to relevant positions
- **AI Chatbot** - Get career guidance and answers
- **Resource Library** - Access learning materials and courses
- **Community Features** - Connect with fellow learners
- **Settings Management** - Customize your experience

## Prerequisites

- Node.js (v14 or higher)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   # Windows
   setup_env.bat
   
   # Or manually copy and edit
   copy env.example .env
   # Edit .env with your API keys
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

The application can be configured with the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (if using external APIs) | http://localhost:8000 |

## File Structure

```
src/
├── components/
│   └── Layout/               # Layout components
├── pages/
│   ├── Dashboard.jsx         # Main dashboard
│   ├── Roadmap.jsx           # Career roadmap
│   ├── Projects.jsx          # Project recommendations
│   ├── Mentors.jsx           # Mentor network
│   ├── Jobs.jsx              # Job opportunities
│   ├── Chatbot.jsx           # AI assistant
│   ├── Resources.jsx         # Learning resources
│   ├── Community.jsx         # Community features
│   └── Settings.jsx          # User settings
└── App.jsx                   # Main app with routing
```

## Key Components

### Dashboard
- Progress tracking and analytics
- Learning streak and achievements
- Current topic and upcoming content
- Resume score and goals

### Roadmap
- Interactive career path visualization
- Skill progression tracking
- Editable nodes and connections

### Projects
- Filtered project recommendations
- Difficulty ratings and descriptions
- Progress tracking for each project

### Mentors
- Mentor profiles with expertise
- Rating system and availability
- Booking and communication features

### Jobs
- Job listings with company info
- Skill requirements and salary data
- Application tracking

### Chatbot
- AI-powered career guidance
- Suggested prompts for better UX
- Real-time conversation interface

### Resources
- Categorized learning materials
- Progress tracking for resources
- Search and filter functionality

### Community
- Discussion forums and threads
- User profiles and engagement
- Knowledge sharing platform

### Settings
- User profile management
- Goal tracking and preferences
- Resume upload and management

## Design System

The application uses a comprehensive design system with:

- **Color Palette**: Primary blue theme with semantic colors
- **Typography**: Inter font family with hierarchical scale
- **Spacing**: Consistent spacing system (0.25rem to 4rem)
- **Components**: Reusable UI components with animations
- **Responsive**: Mobile-first approach with adaptive layouts

## Technologies Used

- **React 19** - Modern React with hooks
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Icon library
- **CSS Custom Properties** - Design token system
- **Vite** - Fast build tool and dev server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading for components
- Optimized animations
- Efficient state management
- Code splitting for better load times

## Accessibility

- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
