/**
 * Mock User Data for System Tests
 */

export const mockUsers = {
  validUser: {
    id: 'user-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    role: 'user',
    createdAt: '2025-01-01T00:00:00Z'
  },

  newUser: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'NewUser123!',
    role: 'user'
  },

  adminUser: {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'AdminPass123!',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00Z'
  },

  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword123!'
  }
};

export const mockResumes = {
  validResume: {
    filename: 'john-doe-resume.pdf',
    content: 'Software Engineer with 5 years of experience in React, Node.js, and Python...',
    format: 'pdf',
    size: 1024 * 50 // 50KB
  },

  textResume: {
    filename: 'resume.txt',
    content: 'JOHN DOE\nSoftware Engineer\nSkills: JavaScript, React, Node.js\nExperience: 5 years',
    format: 'txt',
    size: 1024 * 2 // 2KB
  },

  validJobDescription: `
    Job Title: Senior Software Engineer
    
    Requirements:
    - 5+ years of experience in software development
    - Strong proficiency in React and Node.js
    - Experience with RESTful APIs and microservices
    - Knowledge of database systems (SQL and NoSQL)
    - Excellent problem-solving skills
    
    Preferred:
    - Experience with cloud platforms (AWS, Azure)
    - Knowledge of CI/CD pipelines
    - Strong communication skills
  `,

  shortJobDescription: 'Looking for a React developer with Node.js experience'
};

export const mockAnalysisResults = {
  highScore: {
    score: 85,
    matchPercentage: 85,
    strengths: [
      'Strong technical skills match',
      'Relevant experience level',
      'Good keyword coverage'
    ],
    improvements: [
      'Add more specific project examples',
      'Include quantifiable achievements'
    ],
    matchedSkills: ['React', 'Node.js', 'JavaScript', 'REST APIs'],
    missingSkills: ['AWS', 'Docker']
  },

  lowScore: {
    score: 45,
    matchPercentage: 45,
    strengths: [
      'Basic skills present'
    ],
    improvements: [
      'Add more relevant keywords',
      'Highlight matching experience',
      'Include technical skills section',
      'Improve ATS compatibility'
    ],
    matchedSkills: ['JavaScript'],
    missingSkills: ['React', 'Node.js', 'AWS', 'Docker', 'SQL']
  }
};