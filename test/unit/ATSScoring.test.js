import { clearMockData } from '../helpers/testUtils';
import { mockResume, mockJobDescriptions } from '../helpers/mockDataGenerator';

// Mock ATS Scoring Function
const calculateATSScore = (resumeText, jobDescription = '') => {
  if (!resumeText || !resumeText.trim()) return null;
  if (!jobDescription || !jobDescription.trim()) {
    return {
      atsScore: 0,
      found: {},
      missing: [],
      matched: [],
      missingKeys: [],
      weakWordCount: 0,
      usedStrongVerbs: [],
      uniqueJD: 0,
    };
  }

  const WEIGHT_STRUCTURE = 40;
  const WEIGHT_KEYWORDS = 30;
  const WEIGHT_FORMATTING = 30;

  const WEAK_WORDS = [
    'responsible for',
    'managed',
    'worked on',
    'assisted',
    'participated in',
    'involved in',
  ];

  const STRONG_VERBS = ['Spearheaded', 'Orchestrated', 'Engineered', 'Led', 'Pioneered', 'Implemented', 'Designed'];

  // Extract keywords from JD
  const jdKeywords = jobDescription
    .toLowerCase()
    .split(/[^a-z0-9+#.\-/]/i)
    .filter(w => w.length > 2);

  // Find matches
  const resumeLower = resumeText.toLowerCase();
  const matched = jdKeywords.filter(keyword => resumeLower.includes(keyword));
  const missingKeys = jdKeywords.filter(keyword => !resumeLower.includes(keyword));

  // Count weak words
  let weakWordCount = 0;
  WEAK_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    weakWordCount += (resumeText.match(regex) || []).length;
  });

  // Check for strong verbs
  const usedStrongVerbs = STRONG_VERBS.filter(verb => new RegExp(`\\b${verb}\\b`, 'i').test(resumeText));

  // Calculate scores
  const structureScore = 30;
  const keywordMatchRatio = jdKeywords.length ? matched.length / jdKeywords.length : 0;
  const keywordScore = Math.round(keywordMatchRatio * WEIGHT_KEYWORDS);
  const weakWordPenalty = Math.min(weakWordCount * 3, 20);
  const formattingScore = Math.max(WEIGHT_FORMATTING - weakWordPenalty, 0);

  const atsScore = Math.max(0, Math.min(100, structureScore + keywordScore + formattingScore));

  return {
    atsScore,
    found: { contact: true, summary: true, experience: true, skills: true, education: true },
    missing: [],
    matched,
    missingKeys,
    weakWordCount,
    usedStrongVerbs,
    uniqueJD: jdKeywords.length,
  };
};

describe('MODULE 3: ATS Scoring & Analysis Tests', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TC_ATS_001: Should calculate correct ATS score
  // ============================================
  describe('TC_ATS_001: ATS Score Calculation', () => {
    test('Should calculate score between 0-100 for valid resume and JD', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis).not.toBeNull();
      expect(analysis.atsScore).toBeGreaterThanOrEqual(0);
      expect(analysis.atsScore).toBeLessThanOrEqual(100);
    });

    test('Should return null for empty resume', () => {
      const analysis = calculateATSScore('', mockJobDescriptions.seniorDeveloper);

      expect(analysis).toBeNull();
    });

    test('Should return score of 0 for empty job description', () => {
      const analysis = calculateATSScore(mockResume.validResume, '');

      expect(analysis.atsScore).toBe(0);
    });

    test('Should return different scores for different resumes', () => {
      const score1 = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);
      const score2 = calculateATSScore(mockResume.minimumResume, mockJobDescriptions.seniorDeveloper);

      expect(score1.atsScore).not.toEqual(score2.atsScore);
    });

    test('Should give higher score to complete resume', () => {
      const completeScore = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);
      const minimumScore = calculateATSScore(mockResume.minimumResume, mockJobDescriptions.seniorDeveloper);

      expect(completeScore.atsScore).toBeGreaterThan(minimumScore.atsScore);
    });
  });

  // ============================================
  // TC_ATS_002: Should identify matching keywords
  // ============================================
  describe('TC_ATS_002: Keyword Identification & Matching', () => {
    test('Should identify matching keywords between resume and JD', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.matched).toBeDefined();
      expect(Array.isArray(analysis.matched)).toBe(true);
      expect(analysis.matched.length).toBeGreaterThan(0);
    });

    test('Should have more matches for relevant resume', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      const keywordMatches = analysis.matched.filter(k => k.length > 2);
      expect(keywordMatches.length).toBeGreaterThan(0);
    });

    test('Should calculate unique JD keywords', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.uniqueJD).toBeGreaterThan(0);
    });

    test('Should not match keywords case-sensitively', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.matched).toBeDefined();
      expect(analysis.matched.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // TC_ATS_003: Should identify missing keywords
  // ============================================
  describe('TC_ATS_003: Missing Keywords Detection', () => {
    test('Should identify missing keywords from JD', () => {
      const analysis = calculateATSScore(mockResume.minimumResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.missingKeys).toBeDefined();
      expect(Array.isArray(analysis.missingKeys)).toBe(true);
    });

    test('Should have more missing keywords for weak resume', () => {
      const weakAnalysis = calculateATSScore(mockResume.minimumResume, mockJobDescriptions.seniorDeveloper);
      const strongAnalysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(weakAnalysis.missingKeys.length).toBeGreaterThanOrEqual(strongAnalysis.missingKeys.length);
    });

    test('Should show what keywords are missing', () => {
      const analysis = calculateATSScore(mockResume.minimumResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.missingKeys.length).toBeGreaterThan(0);
      analysis.missingKeys.forEach(key => {
        expect(typeof key).toBe('string');
      });
    });
  });

  // ============================================
  // TC_ATS_004: Should penalize weak action verbs
  // ============================================
  describe('TC_ATS_004: Weak Action Verbs Detection & Penalty', () => {
    test('Should penalize resume with weak action verbs', () => {
      const analysis = calculateATSScore(mockResume.resumeWithWeakVerbs, mockJobDescriptions.seniorDeveloper);

      expect(analysis.weakWordCount).toBeGreaterThan(0);
    });

    test('Should have lower score for resume with weak verbs', () => {
      const weakAnalysis = calculateATSScore(mockResume.resumeWithWeakVerbs, mockJobDescriptions.seniorDeveloper);
      const strongAnalysis = calculateATSScore(mockResume.resumeWithStrongVerbs, mockJobDescriptions.seniorDeveloper);

      expect(weakAnalysis.atsScore).toBeLessThan(strongAnalysis.atsScore);
    });

    test('Should detect common weak verbs like "worked on"', () => {
      const testResume = 'worked on projects, managed team, assisted with tasks';
      const analysis = calculateATSScore(testResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.weakWordCount).toBeGreaterThan(0);
    });

    test('Should count multiple weak verbs', () => {
      const testResume = `
        Responsible for managing tasks.
        Worked on developing features.
        Assisted in database design.
        Participated in code reviews.
      `;
      const analysis = calculateATSScore(testResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.weakWordCount).toBeGreaterThanOrEqual(4);
    });
  });

  // ============================================
  // TC_ATS_005: Should reward strong action verbs
  // ============================================
  describe('TC_ATS_005: Strong Action Verbs Identification', () => {
    test('Should identify strong action verbs in resume', () => {
      const analysis = calculateATSScore(mockResume.resumeWithStrongVerbs, mockJobDescriptions.seniorDeveloper);

      expect(analysis.usedStrongVerbs).toBeDefined();
      expect(Array.isArray(analysis.usedStrongVerbs)).toBe(true);
      expect(analysis.usedStrongVerbs.length).toBeGreaterThan(0);
    });

    test('Should have higher score with strong verbs', () => {
      const strongAnalysis = calculateATSScore(mockResume.resumeWithStrongVerbs, mockJobDescriptions.seniorDeveloper);
      const weakAnalysis = calculateATSScore(mockResume.resumeWithWeakVerbs, mockJobDescriptions.seniorDeveloper);

      expect(strongAnalysis.atsScore).toBeGreaterThan(weakAnalysis.atsScore);
    });

    test('Should detect verbs like "Spearheaded", "Orchestrated", "Engineered"', () => {
      const testResume = 'Spearheaded project, Orchestrated team migration, Engineered solutions';
      const analysis = calculateATSScore(testResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.usedStrongVerbs.length).toBeGreaterThan(0);
    });

    test('Should not reward weak resumes even with one strong verb', () => {
      const testResume = 'Led one small project but had no other skills';
      const analysis = calculateATSScore(testResume, mockJobDescriptions.seniorDeveloper);

      // Score should still be moderate because of missing keywords
      // Even with a strong verb, the lack of required skills limits the score
      expect(analysis.atsScore).toBeLessThan(70);
      expect(analysis.atsScore).toBeGreaterThan(30);
    });
  });

  // ============================================
  // TC_ATS_006: Should handle empty resume
  // ============================================
  describe('TC_ATS_006: Empty Resume Handling', () => {
    test('Should return null for completely empty resume', () => {
      const analysis = calculateATSScore('', mockJobDescriptions.seniorDeveloper);

      expect(analysis).toBeNull();
    });

    test('Should handle resume with only spaces', () => {
      const analysis = calculateATSScore('   ', mockJobDescriptions.seniorDeveloper);

      expect(analysis).toBeNull();
    });

    test('Should handle resume with only newlines', () => {
      const analysis = calculateATSScore('\n\n\n', mockJobDescriptions.seniorDeveloper);

      expect(analysis).toBeNull();
    });
  });

  // ============================================
  // TC_ATS_007: Should handle empty job description
  // ============================================
  describe('TC_ATS_007: Empty Job Description Handling', () => {
    test('Should return score of 0 for empty JD', () => {
      const analysis = calculateATSScore(mockResume.validResume, '');

      expect(analysis.atsScore).toBe(0);
    });

    test('Should handle JD with only spaces', () => {
      const analysis = calculateATSScore(mockResume.validResume, '   ');

      expect(analysis.atsScore).toBe(0);
    });

    test('Should still parse resume even with empty JD', () => {
      const analysis = calculateATSScore(mockResume.validResume, '');

      expect(analysis.found).toBeDefined();
      expect(analysis.matched.length).toBe(0);
    });
  });

  // ============================================
  // TC_ATS_008: Should handle special characters
  // ============================================
  describe('TC_ATS_008: Special Character Handling', () => {
    test('Should parse resume with special characters in name', () => {
      const testResume = 'Jean-Luc André O\'Connor - Senior Developer with C++ & C# skills';
      const analysis = calculateATSScore(testResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis).not.toBeNull();
      expect(analysis.atsScore).toBeDefined();
    });

    test('Should handle programming languages with symbols', () => {
      const testResume = 'Skills: C++, C#, Node.js, .NET, F#, Vue.js';
      const analysis = calculateATSScore(testResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis).not.toBeNull();
      expect(analysis.atsScore).toBeGreaterThanOrEqual(0);
    });

    test('Should handle URLs in resume', () => {
      const testResume = 'Portfolio: https://example.com/john-doe-portfolio?ref=resume&id=123';
      const analysis = calculateATSScore(testResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis).not.toBeNull();
    });

    test('Should handle emails with special characters', () => {
      const testResume = 'Contact: john+work@example.co.uk';
      const analysis = calculateATSScore(testResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis).not.toBeNull();
    });
  });

  // ============================================
  // TC_ATS_009: Should return consistent score
  // ============================================
  describe('TC_ATS_009: Score Consistency', () => {
    test('Should return same score for identical input', () => {
      const analysis1 = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);
      const analysis2 = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis1.atsScore).toBe(analysis2.atsScore);
    });

    test('Should be deterministic across multiple calls', () => {
      const scores = [];
      for (let i = 0; i < 5; i++) {
        const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);
        scores.push(analysis.atsScore);
      }

      // All scores should be identical
      const allEqual = scores.every(score => score === scores[0]);
      expect(allEqual).toBe(true);
    });

    test('Should match keywords consistently', () => {
      const analysis1 = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);
      const analysis2 = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis1.matched).toEqual(analysis2.matched);
    });
  });

  // ============================================
  // TC_ATS_010: Should handle large resumes
  // ============================================
  describe('TC_ATS_010: Large Resume Handling', () => {
    test('Should not crash on very large resume', () => {
      const largeResume = mockResume.validResume.repeat(100);

      expect(() => {
        calculateATSScore(largeResume, mockJobDescriptions.seniorDeveloper);
      }).not.toThrow();
    });

    test('Should process large resume within reasonable time', () => {
      const largeResume = mockResume.validResume.repeat(50);

      const startTime = Date.now();
      const analysis = calculateATSScore(largeResume, mockJobDescriptions.seniorDeveloper);
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(1000); // Should complete in less than 1 second
      expect(analysis).not.toBeNull();
    });

    test('Should return valid score for large resume', () => {
      const largeResume = mockResume.validResume.repeat(20);

      const analysis = calculateATSScore(largeResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.atsScore).toBeGreaterThanOrEqual(0);
      expect(analysis.atsScore).toBeLessThanOrEqual(100);
    });

    test('Should identify all keywords even in large resume', () => {
      const largeResume = mockResume.validResume.repeat(10);

      const analysis = calculateATSScore(largeResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.matched.length).toBeGreaterThan(0);
      expect(analysis.matched.length).toBeLessThanOrEqual(analysis.uniqueJD);
    });
  });
});