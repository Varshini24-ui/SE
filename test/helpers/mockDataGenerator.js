/**
 * Mock data for testing
 */

export const mockResume = {
  validResume: `
    John Doe
    Email: john@example.com
    Phone: (555) 123-4567
    LinkedIn: https://linkedin.com/in/johndoe
    
    SUMMARY
    Experienced developer with 5 years expertise in building scalable web applications
    
    SKILLS
    React, Node.js, MongoDB, JavaScript, Python, Docker, AWS
    
    EXPERIENCE
    Senior Developer at TechCorp (2020-2023)
    - Led development of web applications
    - Optimized performance by 40%
    - Implemented microservices architecture
    - Mentored junior developers
    
    EDUCATION
    B.S. Computer Science (2018)
    University of Technology
  `,

  minimumResume: `
    Jane Smith
    Email: jane@example.com
    Skills: JavaScript
  `,

  emptyResume: ``,

  resumeWithWeakVerbs: `
    EXPERIENCE
    Was responsible for managing projects
    Worked on developing features
    Assisted with database design
    Participated in code reviews
    Managed team responsibilities
    Involved in testing procedures
  `,

  resumeWithStrongVerbs: `
    EXPERIENCE
    Senior Developer at TechCorp (2020-2023)
    - Spearheaded development of microservices
    - Orchestrated team migrations to new systems
    - Engineered performance improvements of 40%
    - Pioneered new development frameworks
    - Drove adoption of best practices
    - Implemented scalable solutions
    - Designed architecture for cloud migration
    - Led development team of 5 engineers
  `,

  resumeWithSpecialChars: `
    Jean-Luc André O'Connor
    Email: john+work@example.co.uk
    Skills: C++, C#, Node.js, .NET, Vue.js
    Portfolio: https://example.com/portfolio?ref=resume&id=123
  `,

  resumeWithDates: `
    EXPERIENCE
    Senior Developer at TechCorp (Jan 2021 - Present)
    - Led development team (2021-2023)
    
    Junior Developer (2020-2021)
  `,

  largeResume: null, // Will be set below
};

// Generate large resume
mockResume.largeResume = mockResume.validResume.repeat(20);

export const mockJobDescriptions = {
  seniorDeveloper: `
    Senior Full Stack Developer Position
    We seek a developer with:
    - 5+ years React experience
    - Strong Node.js knowledge
    - MongoDB expertise
    - AWS cloud experience
    - Docker and Kubernetes skills
    - Leadership abilities
    - Agile methodology experience
    - Performance optimization skills
  `,

  juniorDeveloper: `
    Junior Frontend Developer
    Requirements:
    - HTML5, CSS3, JavaScript knowledge
    - React basics
    - Git version control
    - Problem-solving skills
    - Team collaboration abilities
  `,

  designerRole: `
    UX/UI Designer
    Requirements:
    - 3+ years design experience
    - Figma proficiency
    - Prototyping skills
    - Design systems knowledge
    - User research background
  `,

  emptyJobDescription: ``,

  jdWithSpecialChars: `
    C++ Developer (C# & .NET background helpful)
    Salary: $100,000-$150,000/year
    Skills: C++, Python, JavaScript
  `,
};

export const mockAnalysisResults = {
  highScore: {
    atsScore: 85,
    found: {
      contact: true,
      summary: true,
      experience: true,
      skills: true,
      education: true,
      projects: true,
    },
    missing: [],
    matched: ['react', 'node.js', 'mongodb', 'aws', 'docker'],
    missingKeys: ['kubernetes', 'graphql'],
    weakWordCount: 1,
    usedStrongVerbs: ['Spearheaded', 'Orchestrated', 'Engineered', 'Pioneered'],
    uniqueJD: 15,
  },

  mediumScore: {
    atsScore: 55,
    found: {
      contact: true,
      summary: false,
      experience: true,
      skills: true,
      education: true,
      projects: false,
    },
    missing: ['summary', 'projects'],
    matched: ['javascript', 'react', 'node.js'],
    missingKeys: ['mongodb', 'aws', 'docker', 'kubernetes'],
    weakWordCount: 5,
    usedStrongVerbs: ['Led', 'Implemented'],
    uniqueJD: 12,
  },

  lowScore: {
    atsScore: 25,
    found: {
      contact: true,
      summary: false,
      experience: false,
      skills: false,
      education: false,
      projects: false,
    },
    missing: ['summary', 'experience', 'skills', 'education', 'projects'],
    matched: [],
    missingKeys: ['javascript', 'react', 'node.js', 'mongodb', 'aws'],
    weakWordCount: 10,
    usedStrongVerbs: [],
    uniqueJD: 20,
  },

  noMatch: {
    atsScore: 0,
    found: {},
    missing: [],
    matched: [],
    missingKeys: [],
    weakWordCount: 0,
    usedStrongVerbs: [],
    uniqueJD: 0,
  },
};

/**
 * Generate random resume
 */
export function generateRandomResume(firstName = 'Test', lastName = 'User') {
  return `
    ${firstName} ${lastName}
    Email: ${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com
    Phone: (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}
    
    SUMMARY
    Dynamic professional with diverse skill set
    
    SKILLS
    JavaScript, React, Node.js, Python, SQL
    
    EXPERIENCE
    Developer at SampleCorp (2020-2023)
    - Developed scalable applications
    - Improved performance by 30%
    - Led team initiatives
    
    EDUCATION
    B.S. in Computer Science (2020)
  `;
}

/**
 * Generate random job description
 */
export function generateRandomJobDescription(role = 'Developer') {
  return `
    We are hiring a ${role}
    Requirements:
    - 3+ years experience
    - JavaScript and web development
    - Problem-solving skills
    - Excellent communication
    - Team player mentality
    - Code quality commitment
  `;
}

/**
 * Generate analysis result
 */
export function generateAnalysisResult(score = 50) {
  const isHighScore = score >= 70;
  const isMediumScore = score >= 40 && score < 70;

  return {
    atsScore: score,
    found: {
      contact: true,
      summary: isHighScore,
      experience: true,
      skills: true,
      education: isMediumScore || isHighScore,
      projects: isHighScore,
    },
    missing: isHighScore ? [] : isMediumScore ? ['projects'] : ['summary', 'projects'],
    matched: isHighScore ? ['react', 'node.js', 'mongodb'] : ['javascript'],
    missingKeys: isHighScore ? ['kubernetes'] : ['react', 'node.js'],
    weakWordCount: Math.floor((100 - score) / 10),
    usedStrongVerbs: isHighScore ? ['Led', 'Implemented', 'Engineered'] : ['Developed'],
    uniqueJD: Math.floor(Math.random() * 20) + 5,
  };
}

export default {
  mockResume,
  mockJobDescriptions,
  mockAnalysisResults,
  generateRandomResume,
  generateRandomJobDescription,
  generateAnalysisResult,
};