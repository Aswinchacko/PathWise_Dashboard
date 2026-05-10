import axios from 'axios';
import { getPublicApiOrigin } from '../config/apiBase';

/** Single nginx origin; optional override only if resources are hosted elsewhere. */
const ORIGIN = import.meta.env.VITE_RESOURCES_PUBLIC_URL
  ? String(import.meta.env.VITE_RESOURCES_PUBLIC_URL).replace(/\/$/, '')
  : getPublicApiOrigin();

// Create axios instance for main API (roadmap paths)
const api = axios.create({
  baseURL: ORIGIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resources + scraping share the same gateway in Docker
const resourcesApi = axios.create({
  baseURL: ORIGIN,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for scraping operations
});

class ResourcesService {
  // Resource database - maps skills to learning resources
  resourceDatabase = {
    // Frontend Development Resources
    'HTML5 semantic tags': [
      {
        id: 'html-semantic-1',
        title: 'HTML5 Semantic Elements - MDN',
        description: 'Complete guide to semantic HTML elements and their proper usage',
        type: 'Documentation',
        difficulty: 'Beginner',
        duration: '30 min',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element#semantic_elements',
        color: 'var(--primary-500)'
      },
      {
        id: 'html-semantic-2',
        title: 'HTML5 Semantic Elements Tutorial',
        description: 'Interactive tutorial on semantic HTML with examples',
        type: 'Tutorial',
        difficulty: 'Beginner',
        duration: '1 hour',
        url: 'https://www.w3schools.com/html/html5_semantic_elements.asp',
        color: 'var(--success-500)'
      }
    ],
    'CSS Grid': [
      {
        id: 'css-grid-1',
        title: 'CSS Grid Layout - MDN',
        description: 'Complete CSS Grid reference and tutorials',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout',
        color: 'var(--primary-500)'
      },
      {
        id: 'css-grid-2',
        title: 'CSS Grid Garden',
        description: 'Interactive game to learn CSS Grid',
        type: 'Interactive',
        difficulty: 'Beginner',
        duration: '45 min',
        url: 'https://cssgridgarden.com/',
        color: 'var(--warning-500)'
      },
      {
        id: 'css-grid-3',
        title: 'CSS Grid Complete Guide',
        description: 'Comprehensive CSS Grid tutorial with examples',
        type: 'Tutorial',
        difficulty: 'Intermediate',
        duration: '3 hours',
        url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
        color: 'var(--info-500)'
      }
    ],
    'CSS Flexbox': [
      {
        id: 'flexbox-1',
        title: 'CSS Flexbox - MDN',
        description: 'Complete Flexbox reference and tutorials',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout',
        color: 'var(--primary-500)'
      },
      {
        id: 'flexbox-2',
        title: 'Flexbox Froggy',
        description: 'Interactive game to learn CSS Flexbox',
        type: 'Interactive',
        difficulty: 'Beginner',
        duration: '30 min',
        url: 'https://flexboxfroggy.com/',
        color: 'var(--warning-500)'
      }
    ],
    'Responsive design': [
      {
        id: 'responsive-1',
        title: 'Responsive Web Design - freeCodeCamp',
        description: 'Complete responsive design course with projects',
        type: 'Course',
        difficulty: 'Beginner',
        duration: '10 hours',
        url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
        color: 'var(--success-500)'
      },
      {
        id: 'responsive-2',
        title: 'Responsive Design Patterns',
        description: 'Common responsive design patterns and best practices',
        type: 'Guide',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'https://bradfrost.com/blog/web/responsive-design-patterns/',
        color: 'var(--info-500)'
      }
    ],
    'JavaScript Core': [
      {
        id: 'js-core-1',
        title: 'JavaScript.info',
        description: 'Modern JavaScript tutorial from basics to advanced',
        type: 'Tutorial',
        difficulty: 'Beginner',
        duration: '20 hours',
        url: 'https://javascript.info/',
        color: 'var(--warning-500)'
      },
      {
        id: 'js-core-2',
        title: 'Eloquent JavaScript',
        description: 'Comprehensive JavaScript book with exercises',
        type: 'Book',
        difficulty: 'Intermediate',
        duration: '15 hours',
        url: 'https://eloquentjavascript.net/',
        color: 'var(--primary-500)'
      }
    ],
    'React': [
      {
        id: 'react-1',
        title: 'React Official Tutorial',
        description: 'Official React tutorial with hands-on examples',
        type: 'Tutorial',
        difficulty: 'Beginner',
        duration: '3 hours',
        url: 'https://react.dev/learn',
        color: 'var(--primary-500)'
      },
      {
        id: 'react-2',
        title: 'React Course - freeCodeCamp',
        description: 'Complete React course with projects',
        type: 'Course',
        difficulty: 'Intermediate',
        duration: '8 hours',
        url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/',
        color: 'var(--success-500)'
      }
    ],
    'Node.js': [
      {
        id: 'node-1',
        title: 'Node.js Official Docs',
        description: 'Complete Node.js documentation and guides',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '5 hours',
        url: 'https://nodejs.org/en/docs/',
        color: 'var(--primary-500)'
      },
      {
        id: 'node-2',
        title: 'Node.js Course - freeCodeCamp',
        description: 'Backend development with Node.js',
        type: 'Course',
        difficulty: 'Intermediate',
        duration: '6 hours',
        url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/',
        color: 'var(--success-500)'
      }
    ],
    'Python': [
      {
        id: 'python-1',
        title: 'Python.org Tutorial',
        description: 'Official Python tutorial',
        type: 'Tutorial',
        difficulty: 'Beginner',
        duration: '10 hours',
        url: 'https://docs.python.org/3/tutorial/',
        color: 'var(--primary-500)'
      },
      {
        id: 'python-2',
        title: 'Python for Everybody - Coursera',
        description: 'Complete Python programming course',
        type: 'Course',
        difficulty: 'Beginner',
        duration: '20 hours',
        url: 'https://www.coursera.org/specializations/python',
        color: 'var(--success-500)'
      }
    ],
    'Machine Learning': [
      {
        id: 'ml-1',
        title: 'Machine Learning Course - Andrew Ng',
        description: 'Stanford Machine Learning course on Coursera',
        type: 'Course',
        difficulty: 'Intermediate',
        duration: '40 hours',
        url: 'https://www.coursera.org/learn/machine-learning',
        color: 'var(--success-500)'
      },
      {
        id: 'ml-2',
        title: 'Scikit-learn Documentation',
        description: 'Complete scikit-learn documentation and tutorials',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '8 hours',
        url: 'https://scikit-learn.org/stable/',
        color: 'var(--primary-500)'
      }
    ],
    'Docker': [
      {
        id: 'docker-1',
        title: 'Docker Official Tutorial',
        description: 'Get started with Docker basics',
        type: 'Tutorial',
        difficulty: 'Beginner',
        duration: '2 hours',
        url: 'https://docs.docker.com/get-started/',
        color: 'var(--primary-500)'
      },
      {
        id: 'docker-2',
        title: 'Docker Playground',
        description: 'Interactive Docker learning environment',
        type: 'Interactive',
        difficulty: 'Beginner',
        duration: '1 hour',
        url: 'https://labs.play-with-docker.com/',
        color: 'var(--warning-500)'
      }
    ],
    'Accessibility basics (WCAG)': [
      {
        id: 'a11y-1',
        title: 'Web Accessibility Guidelines - MDN',
        description: 'Complete guide to web accessibility best practices',
        type: 'Documentation',
        difficulty: 'Beginner',
        duration: '3 hours',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility',
        color: 'var(--primary-500)'
      },
      {
        id: 'a11y-2',
        title: 'WebAIM Accessibility Course',
        description: 'Comprehensive accessibility training course',
        type: 'Course',
        difficulty: 'Intermediate',
        duration: '8 hours',
        url: 'https://webaim.org/',
        color: 'var(--success-500)'
      }
    ],
    'CSS Box model': [
      {
        id: 'box-model-1',
        title: 'CSS Box Model - MDN',
        description: 'Understanding the CSS box model',
        type: 'Documentation',
        difficulty: 'Beginner',
        duration: '1 hour',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model',
        color: 'var(--primary-500)'
      },
      {
        id: 'box-model-2',
        title: 'CSS Box Model Interactive',
        description: 'Interactive box model visualization',
        type: 'Interactive',
        difficulty: 'Beginner',
        duration: '30 min',
        url: 'https://www.w3schools.com/css/css_boxmodel.asp',
        color: 'var(--warning-500)'
      }
    ],
    'Async JS: Promises/async-await': [
      {
        id: 'async-1',
        title: 'JavaScript Promises - MDN',
        description: 'Complete guide to JavaScript Promises',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
        color: 'var(--primary-500)'
      },
      {
        id: 'async-2',
        title: 'Async JavaScript Course',
        description: 'Complete async JavaScript course with projects',
        type: 'Course',
        difficulty: 'Intermediate',
        duration: '6 hours',
        url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
        color: 'var(--success-500)'
      }
    ],
    'Closures & scope': [
      {
        id: 'closures-1',
        title: 'JavaScript Closures - MDN',
        description: 'Understanding JavaScript closures and scope',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures',
        color: 'var(--primary-500)'
      },
      {
        id: 'closures-2',
        title: 'JavaScript Scope Tutorial',
        description: 'Deep dive into JavaScript scope and closures',
        type: 'Tutorial',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://javascript.info/closure',
        color: 'var(--warning-500)'
      }
    ],
    'ES6+: let/const, arrow functions': [
      {
        id: 'es6-1',
        title: 'ES6+ Features - MDN',
        description: 'Complete guide to modern JavaScript features',
        type: 'Documentation',
        difficulty: 'Beginner',
        duration: '3 hours',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        color: 'var(--primary-500)'
      },
      {
        id: 'es6-2',
        title: 'ES6 Course - freeCodeCamp',
        description: 'Modern JavaScript ES6+ course',
        type: 'Course',
        difficulty: 'Beginner',
        duration: '4 hours',
        url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
        color: 'var(--success-500)'
      }
    ],
    'DOM manipulation': [
      {
        id: 'dom-1',
        title: 'DOM Manipulation - MDN',
        description: 'Complete guide to DOM manipulation',
        type: 'Documentation',
        difficulty: 'Beginner',
        duration: '2 hours',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model',
        color: 'var(--primary-500)'
      },
      {
        id: 'dom-2',
        title: 'DOM Events Tutorial',
        description: 'Understanding DOM events and manipulation',
        type: 'Tutorial',
        difficulty: 'Beginner',
        duration: '1 hour',
        url: 'https://javascript.info/dom-navigation',
        color: 'var(--warning-500)'
      }
    ],
    'Event loop & call stack': [
      {
        id: 'eventloop-1',
        title: 'JavaScript Event Loop - MDN',
        description: 'Understanding JavaScript event loop and call stack',
        type: 'Documentation',
        difficulty: 'Advanced',
        duration: '2 hours',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop',
        color: 'var(--primary-500)'
      },
      {
        id: 'eventloop-2',
        title: 'JavaScript Visualizer',
        description: 'Interactive JavaScript execution visualizer',
        type: 'Interactive',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'http://latentflip.com/loupe/',
        color: 'var(--warning-500)'
      }
    ],
    'Performance optimization (memo, lazy)': [
      {
        id: 'perf-1',
        title: 'React Performance - Official Docs',
        description: 'React performance optimization guide',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://react.dev/learn/render-and-commit',
        color: 'var(--primary-500)'
      },
      {
        id: 'perf-2',
        title: 'Web Performance Course',
        description: 'Complete web performance optimization course',
        type: 'Course',
        difficulty: 'Intermediate',
        duration: '5 hours',
        url: 'https://www.udacity.com/course/web-performance--ud884',
        color: 'var(--success-500)'
      }
    ],
    'State management: Context/Redux': [
      {
        id: 'state-1',
        title: 'React Context - Official Docs',
        description: 'React Context API documentation',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'https://react.dev/learn/passing-data-deeply-with-context',
        color: 'var(--primary-500)'
      },
      {
        id: 'state-2',
        title: 'Redux Toolkit Tutorial',
        description: 'Modern Redux with Redux Toolkit',
        type: 'Tutorial',
        difficulty: 'Intermediate',
        duration: '3 hours',
        url: 'https://redux.js.org/tutorials/quick-start',
        color: 'var(--warning-500)'
      }
    ],
    'JSX, components, hooks': [
      {
        id: 'react-basics-1',
        title: 'React Components - Official Docs',
        description: 'React components and JSX guide',
        type: 'Documentation',
        difficulty: 'Beginner',
        duration: '2 hours',
        url: 'https://react.dev/learn/your-first-component',
        color: 'var(--primary-500)'
      },
      {
        id: 'react-basics-2',
        title: 'React Hooks Tutorial',
        description: 'Complete React Hooks guide',
        type: 'Tutorial',
        difficulty: 'Beginner',
        duration: '2 hours',
        url: 'https://react.dev/learn/state-a-components-memory',
        color: 'var(--warning-500)'
      }
    ],
    'Tailwind / utility CSS': [
      {
        id: 'tailwind-1',
        title: 'Tailwind CSS Documentation',
        description: 'Complete Tailwind CSS documentation',
        type: 'Documentation',
        difficulty: 'Beginner',
        duration: '2 hours',
        url: 'https://tailwindcss.com/docs',
        color: 'var(--primary-500)'
      },
      {
        id: 'tailwind-2',
        title: 'Tailwind CSS Course',
        description: 'Learn Tailwind CSS from scratch',
        type: 'Course',
        difficulty: 'Beginner',
        duration: '3 hours',
        url: 'https://www.youtube.com/watch?v=4wGmylafgM4',
        color: 'var(--success-500)'
      }
    ],
    'CSS-in-JS': [
      {
        id: 'css-in-js-1',
        title: 'CSS-in-JS Guide',
        description: 'Complete guide to CSS-in-JS libraries',
        type: 'Guide',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://cssinjs.org/',
        color: 'var(--info-500)'
      },
      {
        id: 'css-in-js-2',
        title: 'Styled Components Tutorial',
        description: 'Learn styled-components library',
        type: 'Tutorial',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'https://styled-components.com/docs',
        color: 'var(--warning-500)'
      }
    ],
    'Jest & React Testing Library': [
      {
        id: 'testing-1',
        title: 'Jest Documentation',
        description: 'Complete Jest testing framework guide',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '3 hours',
        url: 'https://jestjs.io/docs/getting-started',
        color: 'var(--primary-500)'
      },
      {
        id: 'testing-2',
        title: 'React Testing Library Guide',
        description: 'Testing React components with RTL',
        type: 'Guide',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://testing-library.com/docs/react-testing-library/intro/',
        color: 'var(--success-500)'
      }
    ],
    'Webpack/Vite basics': [
      {
        id: 'bundler-1',
        title: 'Webpack Documentation',
        description: 'Complete Webpack bundler guide',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '4 hours',
        url: 'https://webpack.js.org/concepts/',
        color: 'var(--primary-500)'
      },
      {
        id: 'bundler-2',
        title: 'Vite Guide',
        description: 'Modern build tool Vite documentation',
        type: 'Documentation',
        difficulty: 'Beginner',
        duration: '1 hour',
        url: 'https://vitejs.dev/guide/',
        color: 'var(--warning-500)'
      }
    ],
    'CI/CD for frontend': [
      {
        id: 'cicd-1',
        title: 'GitHub Actions Guide',
        description: 'CI/CD with GitHub Actions',
        type: 'Guide',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://docs.github.com/en/actions',
        color: 'var(--primary-500)'
      },
      {
        id: 'cicd-2',
        title: 'Frontend CI/CD Course',
        description: 'Complete frontend CI/CD course',
        type: 'Course',
        difficulty: 'Intermediate',
        duration: '4 hours',
        url: 'https://www.udemy.com/course/frontend-ci-cd/',
        color: 'var(--success-500)'
      }
    ],
    'Build optimization': [
      {
        id: 'build-opt-1',
        title: 'Web Performance Guide',
        description: 'Complete web performance optimization',
        type: 'Guide',
        difficulty: 'Intermediate',
        duration: '3 hours',
        url: 'https://web.dev/performance/',
        color: 'var(--primary-500)'
      },
      {
        id: 'build-opt-2',
        title: 'Bundle Analysis Tools',
        description: 'Tools for analyzing and optimizing bundles',
        type: 'Tutorial',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'https://webpack.js.org/guides/code-splitting/',
        color: 'var(--warning-500)'
      }
    ],
    'CDN usage': [
      {
        id: 'cdn-1',
        title: 'CDN Best Practices',
        description: 'Content Delivery Network optimization guide',
        type: 'Guide',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'https://web.dev/content-delivery-networks/',
        color: 'var(--primary-500)'
      },
      {
        id: 'cdn-2',
        title: 'Cloudflare CDN Tutorial',
        description: 'Setting up and optimizing Cloudflare CDN',
        type: 'Tutorial',
        difficulty: 'Beginner',
        duration: '1 hour',
        url: 'https://developers.cloudflare.com/cache/',
        color: 'var(--success-500)'
      }
    ],
    'Monitoring & Sentry': [
      {
        id: 'monitoring-1',
        title: 'Sentry Documentation',
        description: 'Error monitoring and performance tracking',
        type: 'Documentation',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://docs.sentry.io/',
        color: 'var(--primary-500)'
      },
      {
        id: 'monitoring-2',
        title: 'Frontend Monitoring Guide',
        description: 'Complete frontend monitoring setup',
        type: 'Guide',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'https://blog.logrocket.com/frontend-monitoring/',
        color: 'var(--warning-500)'
      }
    ],
    'A/B testing basics': [
      {
        id: 'ab-testing-1',
        title: 'A/B Testing Guide',
        description: 'Complete A/B testing methodology guide',
        type: 'Guide',
        difficulty: 'Intermediate',
        duration: '2 hours',
        url: 'https://www.optimizely.com/optimization-glossary/ab-testing/',
        color: 'var(--primary-500)'
      },
      {
        id: 'ab-testing-2',
        title: 'Frontend A/B Testing',
        description: 'Implementing A/B tests in frontend applications',
        type: 'Tutorial',
        difficulty: 'Intermediate',
        duration: '1 hour',
        url: 'https://blog.logrocket.com/ab-testing-react/',
        color: 'var(--success-500)'
      }
    ]
  };

  // Get all available domains from roadmap API
  async getAvailableDomains() {
    try {
      const response = await api.get('/api/roadmap/roadmaps/domains');
      return response.data.domains;
    } catch (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
  }

  // Get resources for a specific skill
  getResourcesForSkill(skill) {
    const normalizedSkill = this.normalizeSkillName(skill);

    // Direct match
    if (this.resourceDatabase[normalizedSkill]) {
      return this.resourceDatabase[normalizedSkill];
    }

    // Partial match
    const partialMatches = [];
    for (const [key, resources] of Object.entries(this.resourceDatabase)) {
      if (key.toLowerCase().includes(normalizedSkill.toLowerCase()) ||
        normalizedSkill.toLowerCase().includes(key.toLowerCase())) {
        partialMatches.push(...resources);
      }
    }

    return partialMatches;
  }

  // Get all resources for a domain
  async getResourcesForDomain(domain) {
    try {
      // Get skills for the domain
      const response = await api.get(`/api/roadmap/resources/domain/${encodeURIComponent(domain)}`);
      const skills = response.data.skills || [];

      const allResources = [];

      // Get resources for each skill
      skills.forEach(skill => {
        const resources = this.getResourcesForSkill(skill);
        allResources.push(...resources);
      });

      // Remove duplicates and return
      return this.removeDuplicateResources(allResources);
    } catch (error) {
      console.error('Error fetching domain resources:', error);
      // Return filtered local resources as fallback
      const allLocalResources = this.getAllResources();
      return allLocalResources.filter(resource =>
        resource.domain && resource.domain.toLowerCase().includes(domain.toLowerCase())
      );
    }
  }

  // Get all skills from the API
  async getAllSkills() {
    try {
      const response = await api.get('/api/roadmap/resources/skills');
      return response.data.skills || [];
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  // Get all resources
  getAllResources() {
    const allResources = [];
    for (const resources of Object.values(this.resourceDatabase)) {
      allResources.push(...resources);
    }
    return this.removeDuplicateResources(allResources);
  }

  // Search resources
  searchResources(query, domain = null) {
    let resources;

    if (domain) {
      // For domain-specific search, filter local resources by domain
      const allResources = this.getAllResources();
      resources = allResources.filter(resource =>
        resource.domain && resource.domain.toLowerCase().includes(domain.toLowerCase())
      );
    } else {
      resources = this.getAllResources();
    }

    if (!query) return resources;

    const searchTerm = query.toLowerCase();
    return resources.filter(resource =>
      resource.title.toLowerCase().includes(searchTerm) ||
      resource.description.toLowerCase().includes(searchTerm) ||
      resource.type.toLowerCase().includes(searchTerm)
    );
  }

  // Get resources by type
  getResourcesByType(type) {
    const allResources = this.getAllResources();
    return allResources.filter(resource =>
      resource.type.toLowerCase() === type.toLowerCase()
    );
  }

  // Get resources by difficulty
  getResourcesByDifficulty(difficulty) {
    const allResources = this.getAllResources();
    return allResources.filter(resource =>
      resource.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  // Helper methods
  normalizeSkillName(skill) {
    return skill.trim().replace(/[^\w\s]/g, '');
  }

  removeDuplicateResources(resources) {
    const seen = new Set();
    return resources.filter(resource => {
      if (seen.has(resource.id)) {
        return false;
      }
      seen.add(resource.id);
      return true;
    });
  }

  // Get resource statistics
  async getResourceStats() {
    try {
      // Try to get stats from the resources service first
      const response = await resourcesApi.get('/api/scraping/stats');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.warn('Could not fetch stats from resources service, using local data');
    }

    // Fallback to local stats
    const allResources = this.getAllResources();
    const stats = {
      total: allResources.length,
      byType: {},
      byDifficulty: {},
      byDuration: {
        'Under 1 hour': 0,
        '1-3 hours': 0,
        '3-10 hours': 0,
        '10+ hours': 0
      }
    };

    allResources.forEach(resource => {
      // Count by type
      stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;

      // Count by difficulty
      stats.byDifficulty[resource.difficulty] = (stats.byDifficulty[resource.difficulty] || 0) + 1;

      // Count by duration
      const duration = resource.duration.toLowerCase();
      if (duration.includes('min') || duration.includes('under')) {
        stats.byDuration['Under 1 hour']++;
      } else if (duration.includes('1 hour') || duration.includes('2 hour') || duration.includes('3 hour')) {
        stats.byDuration['1-3 hours']++;
      } else if (duration.includes('5 hour') || duration.includes('8 hour') || duration.includes('10 hour')) {
        stats.byDuration['3-10 hours']++;
      } else {
        stats.byDuration['10+ hours']++;
      }
    });

    return stats;
  }

  // ===== WEB SCRAPING METHODS =====

  // Scrape resources for a specific query/skill
  async scrapeResourcesForQuery(query, domain = null, options = {}) {
    try {
      const response = await resourcesApi.post('/api/scraping/resources', {
        query,
        domain,
        maxResults: options.maxResults || 50,
        includeVideo: options.includeVideo !== false,
        includeArticles: options.includeArticles !== false
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Scraping failed');
    } catch (error) {
      console.error('Error scraping resources:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  // Scrape a specific URL
  async scrapeSpecificUrl(url, domain = null, skill = null) {
    try {
      const response = await resourcesApi.post('/api/scraping/url', {
        url,
        domain,
        skill
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'URL scraping failed');
    } catch (error) {
      console.error('Error scraping URL:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  // Bulk scrape resources for multiple queries
  async bulkScrapeResources(queries, domain = null, maxResultsPerQuery = 20) {
    try {
      const response = await resourcesApi.post('/api/scraping/bulk', {
        queries,
        domain,
        maxResultsPerQuery
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      throw new Error(response.data.message || 'Bulk scraping failed');
    } catch (error) {
      console.error('Error bulk scraping:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }

  // Get available scraping sources
  async getScrapingSources() {
    try {
      const response = await resourcesApi.get('/api/scraping/sources');
      if (response.data.success) {
        return response.data.data.sources;
      }
      return [];
    } catch (error) {
      console.error('Error fetching scraping sources:', error);
      return [];
    }
  }

  // Get scraped resources from the database
  async getScrapedResources(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.domain) params.append('domain', filters.domain);
      if (filters.type) params.append('type', filters.type);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await resourcesApi.get(`/api/resources?${params}`);

      if (response.data.success !== false) {
        return response.data.resources || response.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching scraped resources:', error);
      return [];
    }
  }

  // Search scraped resources
  async searchScrapedResources(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('q', query);

      if (filters.domain) params.append('domain', filters.domain);
      if (filters.type) params.append('type', filters.type);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.limit) params.append('limit', filters.limit || 50);

      const response = await resourcesApi.get(`/api/resources/search?${params}`);

      if (response.data.success !== false) {
        return response.data.resources || response.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error searching scraped resources:', error);
      return [];
    }
  }

  // Get resources by domain from scraped data
  async getScrapedResourcesByDomain(domain) {
    try {
      const response = await resourcesApi.get(`/api/resources/domain/${encodeURIComponent(domain)}`);

      if (response.data.success !== false) {
        return response.data.resources || response.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching domain resources:', error);
      return [];
    }
  }

  // Combined method to get all resources (local + scraped)
  async getAllResourcesCombined(includeScraped = true) {
    const localResources = this.getAllResources();

    if (!includeScraped) {
      return localResources;
    }

    try {
      const scrapedResources = await this.getScrapedResources({ limit: 1000 });

      // Combine and deduplicate
      const combinedResources = [...localResources];
      const seenUrls = new Set(localResources.map(r => r.url));

      scrapedResources.forEach(resource => {
        if (!seenUrls.has(resource.url)) {
          combinedResources.push({
            id: resource.id || resource._id,
            title: resource.title,
            description: resource.description,
            url: resource.url,
            type: resource.type,
            difficulty: resource.difficulty,
            duration: resource.duration,
            color: resource.color || this.getColorForType(resource.type),
            source: resource.source || 'Scraped',
            domain: resource.domain,
            skill: resource.skill,
            rating: resource.rating || 0,
            tags: resource.tags || [],
            metadata: resource.metadata || {}
          });
          seenUrls.add(resource.url);
        }
      });

      return combinedResources;
    } catch (error) {
      console.error('Error combining resources:', error);
      return localResources;
    }
  }

  // Helper method to get color for resource type
  getColorForType(type) {
    const colors = {
      'Tutorial': 'var(--success-500)',
      'Course': 'var(--primary-500)',
      'Documentation': 'var(--info-500)',
      'Interactive': 'var(--warning-500)',
      'Book': 'var(--purple-500)',
      'Guide': 'var(--cyan-500)',
      'Project': 'var(--error-500)',
      'Video': 'var(--pink-500)',
      'Article': 'var(--green-500)'
    };

    return colors[type] || 'var(--gray-500)';
  }

  // ===== AI-POWERED ROADMAP-BASED RESOURCE SEARCH =====

  // Get user's latest roadmap
  async getUserLatestRoadmap(userId) {
    try {
      const response = await api.get(`/api/roadmap/roadmaps/user/${userId}`);
      const roadmaps = response.data.roadmaps || [];

      if (roadmaps.length === 0) {
        return null;
      }

      // Return the most recently updated roadmap
      return roadmaps[0];
    } catch (error) {
      console.error('Error fetching user roadmap:', error);
      return null;
    }
  }

  // Search for resources using Serper API + Groq AI based on roadmap
  async searchResourcesWithAI(userId, maxResults = 20) {
    try {
      // Get user's latest roadmap
      const roadmap = await this.getUserLatestRoadmap(userId);
      if (!roadmap) {
        throw new Error('No roadmap found for user');
      }

      // Extract key skills and goal from roadmap
      const goal = roadmap.goal;
      const domain = roadmap.domain;
      const skills = roadmap.steps?.flatMap(step => step.skills || []) || [];

      // Create search query based on roadmap
      const searchQuery = this.buildSearchQuery(goal, domain, skills);

      console.log('🔍 AI Resource Search:', { goal, domain, skills: skills.slice(0, 5), searchQuery });

      // Search using Serper API
      const searchResults = await this.searchWithSerper(searchQuery, maxResults);

      if (!searchResults || searchResults.length === 0) {
        throw new Error('No search results found');
      }

      // Use Groq AI to extract and structure resources
      const aiResources = await this.extractResourcesWithGroq(searchResults, goal, domain, skills);

      return {
        success: true,
        data: {
          resources: aiResources,
          roadmap: {
            goal,
            domain,
            skills: skills.slice(0, 10) // Limit for display
          },
          searchQuery,
          totalFound: aiResources.length
        },
        message: `Found ${aiResources.length} resources for your ${domain} roadmap`
      };

    } catch (error) {
      console.error('Error in AI resource search:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Build search query from roadmap data
  buildSearchQuery(goal, domain, skills) {
    // Take top 3-5 most relevant skills
    const topSkills = skills.slice(0, 5);

    // Create a comprehensive search query
    const skillQuery = topSkills.join(' OR ');
    const domainQuery = domain.toLowerCase();

    // Build query for learning resources
    const query = `${goal} ${domainQuery} (${skillQuery}) tutorial course guide documentation learn -job -career -salary -interview`;

    return query;
  }

  // Search using Serper API
  async searchWithSerper(query, maxResults = 20) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': 'a8df1a33b6fca0c0a6e794d18980aaa9f5dd02ee',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          num: Math.min(maxResults * 2, 25), // Get more results to filter
          gl: 'us',
          hl: 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status}`);
      }

      const data = await response.json();
      return data.organic || [];
    } catch (error) {
      console.error('Serper API error:', error);
      throw error;
    }
  }

  // Extract and structure resources using Groq AI
  async extractResourcesWithGroq(searchResults, goal, domain, skills) {
    try {
      const prompt = this.createResourceExtractionPrompt(searchResults, goal, domain, skills);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a learning resource curator. Extract and structure learning resources from search results. Return ONLY valid JSON arrays, no markdown, no explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '[]';

      // Clean up response - remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const extractedResources = JSON.parse(cleanContent);
      console.log('🤖 Groq AI extracted resources:', extractedResources);

      return extractedResources;
    } catch (error) {
      console.error('Groq API error:', error);
      // Return fallback parsed resources from search results
      return this.createFallbackResources(searchResults, goal, domain);
    }
  }

  // Create extraction prompt for Groq AI
  createResourceExtractionPrompt(searchResults, goal, domain, skills) {
    const topSkills = skills.slice(0, 5);

    return `Extract learning resources from these search results for someone learning "${goal}" in "${domain}".

User's Learning Goal: ${goal}
Domain: ${domain}
Key Skills: ${topSkills.join(', ')}

Search Results:
${searchResults.slice(0, 15).map((result, index) =>
      `${index + 1}. ${result.title}
     URL: ${result.link}
     Snippet: ${result.snippet || 'No description available'}`
    ).join('\n\n')}

Extract the BEST learning resources and return as JSON array. Each resource should have:
- title: Resource title
- description: Brief description (1-2 sentences)
- url: Resource URL
- type: "Tutorial", "Course", "Documentation", "Interactive", "Book", "Guide", "Project", "Video", or "Article"
- difficulty: "Beginner", "Intermediate", or "Advanced"
- duration: Estimated time (e.g., "30 min", "2 hours", "1 week")
- relevance_score: 1-10 (how relevant to the learning goal)

Focus on:
- High-quality educational content
- Resources directly related to the skills
- Mix of different resource types
- Appropriate difficulty levels
- Recent and up-to-date content

Return ONLY the JSON array, no other text:`;
  }

  // Create fallback resources if AI extraction fails
  createFallbackResources(searchResults, goal, domain) {
    return searchResults.slice(0, 10).map((result, index) => ({
      title: result.title,
      description: result.snippet || 'Learning resource for your roadmap',
      url: result.link,
      type: this.guessResourceType(result.title, result.link),
      difficulty: 'Intermediate',
      duration: '1-2 hours',
      relevance_score: 7,
      source: 'AI Search',
      domain: domain,
      color: this.getColorForType(this.guessResourceType(result.title, result.link))
    }));
  }

  // Guess resource type from title and URL
  guessResourceType(title, url) {
    const titleLower = title.toLowerCase();
    const urlLower = url.toLowerCase();

    if (titleLower.includes('course') || urlLower.includes('course')) return 'Course';
    if (titleLower.includes('tutorial') || titleLower.includes('guide')) return 'Tutorial';
    if (titleLower.includes('documentation') || urlLower.includes('docs')) return 'Documentation';
    if (titleLower.includes('video') || urlLower.includes('youtube') || urlLower.includes('video')) return 'Video';
    if (titleLower.includes('book') || urlLower.includes('book')) return 'Book';
    if (titleLower.includes('interactive') || titleLower.includes('playground')) return 'Interactive';
    if (titleLower.includes('project') || titleLower.includes('build')) return 'Project';

    return 'Article';
  }
}

export default new ResourcesService();
