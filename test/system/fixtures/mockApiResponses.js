/**
 * Mock API Responses for System Tests
 */

export const mockApiResponses = {
  authentication: {
    loginSuccess: {
      status: 200,
      data: {
        token: 'mock-jwt-token-123456789',
        user: {
          id: 'user-001',
          email: 'testuser@example.com',
          name: 'Test User'
        },
        expiresIn: 3600
      }
    },

    loginFailure: {
      status: 401,
      error: {
        message: 'Invalid credentials'
      }
    },

    registerSuccess: {
      status: 201,
      data: {
        message: 'User registered successfully',
        user: {
          id: 'user-002',
          email: 'newuser@example.com',
          name: 'New User'
        }
      }
    }
  },

  resumeAnalysis: {
    analysisSuccess: {
      status: 200,
      data: {
        analysisId: 'analysis-001',
        score: 75,
        matchPercentage: 75,
        feedback: {
          strengths: [
            'Good keyword match',
            'Relevant experience'
          ],
          improvements: [
            'Add more quantifiable achievements',
            'Include missing skills'
          ]
        },
        skillsAnalysis: {
          matched: ['React', 'JavaScript', 'Node.js'],
          missing: ['Docker', 'Kubernetes'],
          recommended: ['AWS', 'TypeScript']
        },
        atsScore: 80,
        timestamp: '2025-11-13T09:15:46Z'
      }
    },

    analysisError: {
      status: 500,
      error: {
        message: 'Analysis failed',
        details: 'Unable to process resume file'
      }
    },

    invalidFileFormat: {
      status: 400,
      error: {
        message: 'Invalid file format',
        supportedFormats: ['pdf', 'txt', 'docx']
      }
    }
  },

  chatbot: {
    generalResponse: {
      status: 200,
      data: {
        message: 'I can help you improve your resume score. What specific area would you like to focus on?',
        suggestions: [
          'Keywords optimization',
          'ATS compatibility',
          'Skills matching'
        ],
        timestamp: '2025-11-13T09:15:46Z'
      }
    },

    resumeAdvice: {
      status: 200,
      data: {
        message: 'To improve your resume score, consider these tips:\n1. Include relevant keywords from the job description\n2. Quantify your achievements\n3. Use a clean, ATS-friendly format\n4. Highlight matching skills prominently',
        relatedTopics: ['ATS optimization', 'Keyword matching', 'Resume formatting']
      }
    },

    errorResponse: {
      status: 500,
      error: {
        message: 'Unable to process your request at this time'
      }
    }
  }
};

export const mockChatResponses = {
  greeting: 'Hello! I\'m here to help you with your resume. How can I assist you today?',
  
  atsQuestion: 'ATS (Applicant Tracking System) is software used by employers to filter and rank resumes. To optimize for ATS, use standard section headings, include relevant keywords, and avoid complex formatting.',
  
  scoreImprovement: 'To improve your resume score:\n1. Match keywords from the job description\n2. Add quantifiable achievements\n3. Ensure proper formatting\n4. Include all relevant skills\n5. Use action verbs',
  
  fallback: 'I\'m not sure I understood that. Could you please rephrase your question? I can help you with resume optimization, ATS compatibility, and improving your match score.'
};