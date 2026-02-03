import { API_CONFIG } from '../config/api'

class GroqService {
  /**
   * Validate if file content appears to be a resume using Groq AI
   * @param {string} content - The text content to validate
   * @returns {Promise<Object>} Validation result with confidence score and feedback
   */
  async validateResumeContent(content) {
    try {
      const prompt = `Analyze the following text and determine if it appears to be a professional resume or CV. 

Text to analyze:
${content}

Please respond with a JSON object containing:
{
  "isResume": boolean,
  "confidence": number (0-100),
  "reasoning": "Brief explanation of why this is or isn't a resume",
  "missingElements": ["list of typical resume elements that are missing"],
  "suggestions": ["suggestions for improvement if not a resume"]
}

Consider these typical resume elements:
- Contact information (name, email, phone, address)
- Professional summary or objective
- Work experience with dates and descriptions
- Education background
- Skills section
- Professional formatting and structure
- Action verbs and professional language
- Relevant dates and time periods

Be strict in your assessment - only classify as a resume if it clearly contains professional information in a resume-like format.`

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
              content: 'You are an expert resume validator. Analyze text and determine if it\'s a professional resume. Return ONLY valid JSON, no markdown, no explanations outside the JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data = await response.json()
      const responseContent = data.choices[0]?.message?.content || '{}'
      
      // Clean up response - remove markdown code blocks if present
      const cleanContent = responseContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      const result = JSON.parse(cleanContent)
      
      return {
        success: true,
        isResume: result.isResume || false,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || 'Unable to determine',
        missingElements: result.missingElements || [],
        suggestions: result.suggestions || []
      }
    } catch (error) {
      console.error('Groq validation error:', error)
      return {
        success: false,
        isResume: false,
        confidence: 0,
        reasoning: 'Validation failed due to API error',
        missingElements: [],
        suggestions: ['Please try again or check your file format'],
        error: error.message
      }
    }
  }

  /**
   * Get resume improvement suggestions using Groq AI
   * @param {string} content - The resume content
   * @returns {Promise<Object>} Improvement suggestions
   */
  async getResumeSuggestions(content) {
    try {
      const prompt = `Analyze this resume and provide specific improvement suggestions:

${content}

Please respond with a JSON object containing:
{
  "overallScore": number (0-100),
  "strengths": ["list of strong points"],
  "improvements": ["specific areas for improvement"],
  "missingSections": ["resume sections that are missing"],
  "formattingIssues": ["formatting problems to fix"],
  "contentSuggestions": ["specific content improvements"]
}`

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
              content: 'You are a professional resume consultant. Provide detailed feedback and suggestions for resume improvement. Return ONLY valid JSON, no markdown.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data = await response.json()
      const responseContent = data.choices[0]?.message?.content || '{}'
      
      const cleanContent = responseContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      const result = JSON.parse(cleanContent)
      
      return {
        success: true,
        overallScore: result.overallScore || 0,
        strengths: result.strengths || [],
        improvements: result.improvements || [],
        missingSections: result.missingSections || [],
        formattingIssues: result.formattingIssues || [],
        contentSuggestions: result.contentSuggestions || []
      }
    } catch (error) {
      console.error('Groq suggestions error:', error)
      return {
        success: false,
        overallScore: 0,
        strengths: [],
        improvements: ['Unable to analyze - please try again'],
        missingSections: [],
        formattingIssues: [],
        contentSuggestions: [],
        error: error.message
      }
    }
  }
}

export default new GroqService()
