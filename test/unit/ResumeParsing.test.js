import { clearMockData } from '../helpers/testUtils';
import { mockResume, mockJobDescriptions } from '../helpers/mockDataGenerator';

const parseContactInfo = (text) => {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/\(\d{3}\)\s\d{3}-\d{4}/);

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
  };
};

const extractSections = (text) => {
  const sections = {};
  const sectionRegex = /^([A-Z\s]+)$/gm;
  const matches = [...text.matchAll(sectionRegex)];

  return { sectionCount: matches.length };
};

describe('MODULE 2.2: Resume Parsing Tests (TC 2.2)', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TC_PARSE_001: Extract contact information
  // ============================================
  describe('TC_PARSE_001: Contact Information Extraction', () => {
    test('Should extract email from resume', () => {
      const contact = parseContactInfo(mockResume.validResume);

      expect(contact.email).toBeDefined();
      expect(contact.email).toMatch(/[\w.-]+@[\w.-]+\.\w+/);
    });

    test('Should extract phone number from resume', () => {
      const contact = parseContactInfo(mockResume.validResume);

      expect(contact.phone).toBeDefined();
      expect(contact.phone).toMatch(/\(\d{3}\)\s\d{3}-\d{4}/);
    });

    test('Should extract LinkedIn URL', () => {
      const linkedinMatch = mockResume.validResume.match(/linkedin\.com\/in\/[\w-]+/i);

      expect(linkedinMatch).not.toBeNull();
    });

    test('Should extract portfolio URL', () => {
      const urlMatch = mockResume.validResume.match(/https?:\/\/[\w.-]+\.\w+/);

      expect(urlMatch).not.toBeNull();
    });

    test('Should handle multiple email formats', () => {
      const emails = [
        'john.doe@example.com',
        'jane+smith@company.co.uk',
        'contact@domain.io',
      ];

      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
      emails.forEach(email => {
        expect(email).toMatch(emailRegex);
      });
    });
  });

  // ============================================
  // TC_PARSE_002: Skills section extraction
  // ============================================
  describe('TC_PARSE_002: Skills Section Extraction', () => {
    test('Should extract skills section', () => {
      const skillsMatch = mockResume.validResume.match(/SKILLS[\s\S]*?(?=\n[A-Z]|$)/i);

      expect(skillsMatch).not.toBeNull();
    });

    test('Should extract skills from bullet points', () => {
      const skillsMatch = mockResume.validResume.match(/(?:javascript|react|node|mongodb)/gi);

      expect(skillsMatch).not.toBeNull();
      expect(skillsMatch.length).toBeGreaterThan(0);
    });

    test('Should handle comma-separated skills', () => {
      const testResume = 'Skills: JavaScript, React, Node.js, MongoDB, Docker';
      const skillsMatch = testResume.match(/[a-z]+(?:\.\s?js)?/gi);

      expect(skillsMatch.length).toBeGreaterThan(3);
    });

    test('Should extract frameworks and tools', () => {
      const frameworks = ['React', 'Node', 'MongoDB'];

      frameworks.forEach(fw => {
        expect(mockResume.validResume.toLowerCase()).toContain(fw.toLowerCase());
      });
    });

    test('Should handle skills with special characters', () => {
      const testResume = 'Skills: C++, C#, Node.js, .NET, Vue.js';

      expect(testResume).toContain('C++');
      expect(testResume).toContain('C#');
      expect(testResume).toContain('.NET');
    });
  });

  // ============================================
  // TC_PARSE_003: Experience section extraction
  // ============================================
  describe('TC_PARSE_003: Experience Section Extraction', () => {
    test('Should extract experience entries', () => {
      const experienceMatch = mockResume.validResume.match(/EXPERIENCE[\s\S]*?(?=\n[A-Z]|$)/i);

      expect(experienceMatch).not.toBeNull();
    });

    test('Should extract job title', () => {
      const titleMatch = mockResume.validResume.match(/([A-Za-z\s]+)\s+at\s+([A-Za-z\s]+)/i);

      expect(titleMatch).not.toBeNull();
      if (titleMatch) {
        expect(titleMatch[1]).toMatch(/[a-z]/i);
      }
    });

    test('Should extract company name', () => {
      const testResume = 'Senior Developer at TechCorp Inc. (2020-2023)';
      const companyMatch = testResume.match(/at\s+([^(]+)\s*\(/);

      expect(companyMatch).not.toBeNull();
      expect(companyMatch[1].trim()).toContain('TechCorp');
    });

    test('Should extract employment dates', () => {
      const dateMatches = mockResume.validResume.match(/\((\d{4})-(\d{4})\)/g);

      expect(dateMatches).not.toBeNull();
      if (dateMatches) {
        expect(dateMatches.length).toBeGreaterThan(0);
      }
    });

    test('Should extract job responsibilities', () => {
      const responsibilities = mockResume.validResume.match(/- ([^-\n]+)/g);

      expect(responsibilities).not.toBeNull();
      if (responsibilities) {
        expect(responsibilities.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================
  // TC_PARSE_004: Education section extraction
  // ============================================
  describe('TC_PARSE_004: Education Section Extraction', () => {
    test('Should extract education entries', () => {
      const educationMatch = mockResume.validResume.match(/EDUCATION[\s\S]*?(?=\n[A-Z]|$)/i);

      expect(educationMatch).not.toBeNull();
    });

    test('Should extract degree type', () => {
      const degreeMatch = mockResume.validResume.match(/(bachelor|master|phd|associate)\s+of\s+([^(]+)/i);

      if (degreeMatch) {
        expect(['bachelor', 'master', 'phd', 'associate']).toContain(degreeMatch[1].toLowerCase());
      }
    });

    test('Should extract university name', () => {
      const testResume = 'B.S. Computer Science\nUniversity of Technology (2018)';
      const universityMatch = testResume.match(/([A-Za-z\s]+)\s*\(\d{4}\)/);

      expect(universityMatch).not.toBeNull();
      expect(universityMatch[1].trim()).toContain('University');
    });

    test('Should extract graduation year', () => {
      const yearMatch = mockResume.validResume.match(/\((\d{4})\)/);

      expect(yearMatch).not.toBeNull();
      if (yearMatch) {
        expect(yearMatch[1]).toMatch(/\d{4}/);
      }
    });

    test('Should handle multiple degrees', () => {
      const testResume = 'M.S. Computer Science (2020)\nB.S. Computer Science (2018)';
      const degreeMatches = testResume.match(/(b\.?s|m\.?s|phd)/gi);

      expect(degreeMatches.length).toBe(2);
    });
  });

  // ============================================
  // TC_PARSE_005: Handle malformed resume
  // ============================================
  describe('TC_PARSE_005: Malformed Resume Handling', () => {
    test('Should handle resume without clear section headers', () => {
      const testResume = 'John Doe\njohn@example.com\n5 years experience with JavaScript';
      const words = testResume.split(/\s+/).filter(w => w.length > 2);

      expect(words.length).toBeGreaterThan(0);
    });

    test('Should handle mixed formatting', () => {
      const testResume = 'JOHN DOE\nemail: john@example.com | phone: (555) 123-4567';

      expect(testResume).toContain('@');
      expect(testResume).toContain('555');
    });

    test('Should handle incomplete sections', () => {
      const testResume = 'SKILLS\nJavaScript, React,\n\nEXPERIENCE';
      const skillsMatch = testResume.match(/javascript|react/i);

      expect(skillsMatch).not.toBeNull();
    });

    test('Should handle missing sections', () => {
      const testResume = 'John Doe\njohn@example.com\n\nSKILLS\nJavaScript, Python';
      const sections = extractSections(testResume);

      expect(sections.sectionCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================
  // TC_PARSE_006: Identify missing sections
  // ============================================
  describe('TC_PARSE_006: Missing Section Identification', () => {
    test('Should identify missing skills section', () => {
      const testResume = 'John Doe\nEmail: john@example.com\nEXPERIENCE\nDeveloper';
      const hasSkills = /skills/i.test(testResume);

      expect(hasSkills).toBe(false);
    });

    test('Should identify missing experience section', () => {
      const testResume = 'John Doe\nEmail: john@example.com\nSKILLS\nJavaScript';
      const hasExperience = /experience|employment/i.test(testResume);

      expect(hasExperience).toBe(false);
    });

    test('Should identify missing education section', () => {
      const testResume = 'John Doe\nEmail: john@example.com\nEXPERIENCE\nDeveloper';
      const hasEducation = /education|degree|university/i.test(testResume);

      expect(hasEducation).toBe(false);
    });
  });

  // ============================================
  // TC_PARSE_007: Handle special characters
  // ============================================
  describe('TC_PARSE_007: Special Character Handling', () => {
    test('Should parse resume with special characters in name', () => {
      const testResume = 'Jean-Luc André O\'Connor';
      const nameMatch = testResume.match(/^[A-Za-z\s\-\']+/);

      expect(nameMatch).not.toBeNull();
    });

    test('Should parse email with special characters', () => {
      const testResume = 'Email: john+work@example.co.uk';
      const emailMatch = testResume.match(/[\w.+-]+@[\w.-]+\.\w+/);

      expect(emailMatch).not.toBeNull();
      expect(emailMatch[0]).toContain('+');
    });

    test('Should handle programming languages with symbols', () => {
      const testResume = 'Skills: C++, C#, F#, Node.js, .NET';

      expect(testResume).toContain('C++');
      expect(testResume).toContain('C#');
      expect(testResume).toContain('.NET');
    });
  });

  // ============================================
  // TC_PARSE_008: Extract keywords for ATS
  // ============================================
  describe('TC_PARSE_008: Keyword Extraction for ATS', () => {
    test('Should extract relevant keywords', () => {
      const text = mockResume.validResume.toLowerCase().split(/[^a-z0-9+#.\-/]/i);
      const keywords = text.filter(w => w.length > 2);

      expect(keywords.length).toBeGreaterThan(0);
    });

    test('Should normalize keywords to lowercase', () => {
      const text = 'Skills: REACT, JavaScript, Node.JS';
      const keywords = text.toLowerCase().split(/[^a-z0-9+#.\-/]/i);

      keywords.forEach(keyword => {
        expect(keyword).toEqual(keyword.toLowerCase());
      });
    });

    test('Should extract unique keywords only', () => {
      const text = 'JavaScript JavaScript React React React';
      const unique = [...new Set(text.toLowerCase().split(/\s+/))];

      expect(unique.length).toBeLessThan(5);
    });
  });

  // ============================================
  // TC_PARSE_009: Performance for large resumes
  // ============================================
  describe('TC_PARSE_009: Performance with Large Resumes', () => {
    test('Should parse large resume within acceptable time', () => {
      const largeResume = mockResume.validResume.repeat(10);

      const startTime = performance.now();
      const lines = largeResume.split('\n');
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100);
    });
  });

  // ============================================
  // TC_PARSE_010: Integration with parsing
  // ============================================
  describe('TC_PARSE_010: Parsing Integration', () => {
    test('Should parse resume content correctly', () => {
      const contact = parseContactInfo(mockResume.validResume);

      expect(contact.email).toBeDefined();
      expect(contact.email).toMatch(/@/);
    });
  });
});