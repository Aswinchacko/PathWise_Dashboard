// Resources Service - AI-powered resource discovery and management
class ResourcesService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.resources = [];
    this.domains = [];
    this.stats = {};
  }

  // Get available domains
  async getAvailableDomains() {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/domains`);
      if (!response.ok) throw new Error('Failed to fetch domains');
      this.domains = await response.json();
      return this.domains;
    } catch (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
  }

  // Get all resources (combined)
  async getAllResourcesCombined(includeScraped = false) {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/all?include_scraped=${includeScraped}`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      this.resources = await response.json();
      return this.resources;
    } catch (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
  }

  // Get all resources (local)
  getAllResources() {
    return this.resources;
  }

  // Get resource statistics
  async getResourceStats() {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      this.stats = await response.json();
      return this.stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  }

  // Get scraping sources
  async getScrapingSources() {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/sources`);
      if (!response.ok) throw new Error('Failed to fetch sources');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sources:', error);
      return [];
    }
  }

  // Get user's latest roadmap
  async getUserLatestRoadmap(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/roadmap/latest/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch roadmap');
      return await response.json();
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      return null;
    }
  }

  // Get resources for specific domain
  async getResourcesForDomain(domain) {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/domain/${domain}`);
      if (!response.ok) throw new Error('Failed to fetch domain resources');
      return await response.json();
    } catch (error) {
      console.error('Error fetching domain resources:', error);
      return [];
    }
  }

  // Get scraped resources by domain
  async getScrapedResourcesByDomain(domain) {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/scraped/${domain}`);
      if (!response.ok) throw new Error('Failed to fetch scraped resources');
      return await response.json();
    } catch (error) {
      console.error('Error fetching scraped resources:', error);
      return [];
    }
  }

  // Scrape resources for query
  async scrapeResourcesForQuery(query, domain, maxResults = 20) {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          domain,
          maxResults
        })
      });
      if (!response.ok) throw new Error('Failed to scrape resources');
      return await response.json();
    } catch (error) {
      console.error('Error scraping resources:', error);
      return { success: false, error: error.message };
    }
  }

  // Scrape specific URL
  async scrapeSpecificUrl(url, domain) {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/scrape-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          domain
        })
      });
      if (!response.ok) throw new Error('Failed to scrape URL');
      return await response.json();
    } catch (error) {
      console.error('Error scraping URL:', error);
      return { success: false, error: error.message };
    }
  }

  // Search resources with AI
  async searchResourcesWithAI(userId, limit = 20) {
    try {
      const response = await fetch(`${this.baseUrl}/api/resources/ai-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          limit
        })
      });
      if (!response.ok) throw new Error('Failed to search with AI');
      return await response.json();
    } catch (error) {
      console.error('Error searching with AI:', error);
      return { success: false, error: error.message };
    }
  }

  // Search resources
  searchResources(query, domain = null) {
    let filtered = this.resources;
    
    if (query) {
      filtered = filtered.filter(resource => 
        resource.title?.toLowerCase().includes(query.toLowerCase()) ||
        resource.description?.toLowerCase().includes(query.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    if (domain) {
      filtered = filtered.filter(resource => resource.domain === domain);
    }
    
    return filtered;
  }

  // Search scraped resources
  searchScrapedResources(query, filters = {}) {
    // This would search through scraped resources
    // Implementation depends on how scraped resources are stored
    return [];
  }

  // Get color for resource type
  getColorForType(type) {
    const colors = {
      'course': '#3B82F6',
      'tutorial': '#10B981',
      'article': '#F59E0B',
      'video': '#EF4444',
      'book': '#8B5CF6',
      'tool': '#06B6D4',
      'documentation': '#84CC16',
      'default': '#6B7280'
    };
    return colors[type] || colors.default;
  }

  // Search with Serper API
  async searchWithSerper(query, maxResults = 20) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': import.meta.env.VITE_SERPER_API_KEY,
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
      console.error('Serper search error:', error);
      return [];
    }
  }

  // Extract and structure resources using Groq AI
  async extractResourcesWithGroq(searchResults, goal, domain, skills) {
    try {
      const prompt = this.createResourceExtractionPrompt(searchResults, goal, domain, skills);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that extracts and structures learning resources from search results. Return only valid JSON.'
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
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from Groq API');
      }

      // Parse JSON response
      const resources = JSON.parse(content);
      return Array.isArray(resources) ? resources : [];
    } catch (error) {
      console.error('Groq extraction error:', error);
      return [];
    }
  }

  // Create resource extraction prompt
  createResourceExtractionPrompt(searchResults, goal, domain, skills) {
    return `
Extract learning resources from these search results for someone learning ${domain} with the goal: "${goal}".

Skills they have: ${skills.join(', ')}

Search Results:
${JSON.stringify(searchResults, null, 2)}

Return a JSON array of resources with this structure:
[
  {
    "title": "Resource Title",
    "description": "Brief description",
    "url": "https://example.com",
    "type": "course|tutorial|article|video|book|tool|documentation",
    "difficulty": "beginner|intermediate|advanced",
    "duration": "estimated time (e.g., '2 hours', '1 week')",
    "tags": ["tag1", "tag2"],
    "domain": "${domain}",
    "relevance_score": 0.85
  }
]

Only include resources that are directly relevant to learning ${domain} and achieving the goal "${goal}".
Return maximum 10 resources, sorted by relevance.
`;
  }
}

// Export singleton instance
const resourcesService = new ResourcesService();
export default resourcesService;