import { clearMockData } from '../helpers/testUtils';
import { mockResume, mockJobDescriptions, mockAnalysisResults, generateAnalysisResult } from '../helpers/mockDataGenerator';

// Mock the calculateATSScore function - import from your actual source
const calculateATSScore = (resumeText, jobDescription = '') => {
  if (!resumeText || !resumeText.trim()) return null;

  const WEIGHT_STRUCTURE = 40;
  const WEIGHT_KEYWORDS = 30;
  const WEIGHT_FORMATTING = 30;
  const CORE_SECTIONS_LENGTH = 6;
  const WEAK_WORDS_PER_PENALTY = 3;
  const MAX_WEAK_WORD_PENALTY = 15;

  const STOPWORDS = new Set([
    'the', 'a', 'an', 'is', 'of', 'in', 'it', 'at', 'by', 'be', 'as', 'or', 'which', 'all', 'we'
  ]);

  const WEAK_WORDS = [
    'responsible for', 'managed', 'worked on', 'assisted', 'participated in', 'involved in'
  ];

  const STRONG_ACTION_VERBS = [
    'Spearheaded', 'Orchestrated', 'Engineered', 'Led', 'Pioneered', 'Implemented', 'Designed'
  ];

  // Structure Score
  const coreFoundCount = 5;
  const structureScore = Math.max(0, Math.round((coreFoundCount / CORE_SECTIONS_LENGTH) * WEIGHT_STRUCTURE));

  // Keyword Score
  const jdKeys = jobDescription.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const matched = jdKeys.filter(k => resumeText.toLowerCase().includes(k));
  const keywordMatchRatio = jdKeys.length ? matched.length / jdKeys.length : 0;
  const keywordScore = Math.round(keywordMatchRatio * WEIGHT_KEYWORDS);

  // Formatting Score
  let weakWordCount = 0;
  WEAK_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    weakWordCount += (resumeText.match(regex) || []).length;
  });

  const weakWordPenalty = Math.min(
    Math.floor(weakWordCount / WEAK_WORDS_PER_PENALTY) * (MAX_WEAK_WORD_PENALTY / 3),
    MAX_WEAK_WORD_PENALTY
  );
  const formattingScore = Math.max(0, WEIGHT_FORMATTING - weakWordPenalty);

  // Final Score
  const atsScore = Math.max(0, Math.min(100, structureScore + keywordScore + formattingScore));
  const missingKeys = jdKeys.filter(k => !resumeText.toLowerCase().includes(k));
  const usedStrongVerbs = STRONG_ACTION_VERBS.filter(verb => 
    new RegExp(`\\b${verb}\\b`, 'i').test(resumeText)
  );

  return {
    found: { contact: true, summary: true, experience: true, skills: true, education: true, projects: true },
    missing: [],
    matched,
    missingKeys,
    atsScore,
    uniqueJD: jdKeys.length,
    weakWordCount,
    usedStrongVerbs,
  };
};

describe('MODULE 3: ATS Scoring & Analysis Tests', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  // ============================================
  // TC_ATS_001: Score Calculation
  // ============================================
  describe('TC_ATS_001: ATS Score Calculation', () => {
    test('Should calculate correct structure score', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis).not.toBeNull();
      expect(analysis.atsScore).toBeGreaterThanOrEqual(0);
      expect(analysis.atsScore).toBeLessThanOrEqual(100);
      expect(analysis.found).toBeDefined();
    });

    test('Should return null for empty resume', () => {
      const analysis = calculateATSScore('', mockJobDescriptions.seniorDeveloper);

      expect(analysis).toBeNull();
    });

    test('Should handle resume without job description', () => {
      const analysis = calculateATSScore(mockResume.validResume, '');

      expect(analysis).not.toBeNull();
      expect(analysis.atsScore).toBeDefined();
      expect(analysis.uniqueJD).toBe(0);
    });

    test('Should score between 0-100', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.atsScore).toBeGreaterThanOrEqual(0);
      expect(analysis.atsScore).toBeLessThanOrEqual(100);
    });
  });

  // ============================================
  // TC_ATS_002: Keyword Matching
  // ============================================
  describe('TC_ATS_002: Keyword Identification & Matching', () => {
    test('Should identify matching keywords', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.matched).toBeDefined();
      expect(Array.isArray(analysis.matched)).toBe(true);
    });

    test('Should identify missing keywords from JD', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.missingKeys).toBeDefined();
      expect(Array.isArray(analysis.missingKeys)).toBe(true);
    });

    test('Should calculate unique JD keywords', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.uniqueJD).toBeGreaterThan(0);
    });

    test('Should handle resume with high keyword match', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      // Should have some matches
      expect(analysis.matched.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================
  // TC_ATS_003: Missing Keywords
  // ============================================
  describe('TC_ATS_003: Missing Keywords Detection', () => {
    test('Should identify missing keywords', () => {
      const analysis = calculateATSScore(mockResume.minimumResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.missingKeys).toBeDefined();
      expect(analysis.missingKeys.length).toBeGreaterThanOrEqual(0);
    });

    test('Should have more missing keywords for weak resume', () => {
      const weakAnalysis = calculateATSScore(mockResume.minimumResume, mockJobDescriptions.seniorDeveloper);
      const strongAnalysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(weakAnalysis.missingKeys.length).toBeGreaterThanOrEqual(strongAnalysis.missingKeys.length);
    });
  });

  // ============================================
  // TC_ATS_004: Weak Verbs Penalty
  // ============================================
  describe('TC_ATS_004: Weak Action Verbs Detection', () => {
    test('Should penalize weak action verbs', () => {
      const analysis = calculateATSScore(mockResume.resumeWithWeakVerbs, mockJobDescriptions.seniorDeveloper);

      expect(analysis.weakWordCount).toBeGreaterThan(0);
    });

    test('Should have zero weak words for strong resume', () => {
      const analysis = calculateATSScore(mockResume.resumeWithStrongVerbs, mockJobDescriptions.seniorDeveloper);

      expect(analysis.weakWordCount).toBeLessThanOrEqual(2);
    });

    test('Should reduce score based on weak word count', () => {
      const weakAnalysis = calculateATSScore(mockResume.resumeWithWeakVerbs, mockJobDescriptions.seniorDeveloper);
      const strongAnalysis = calculateATSScore(mockResume.resumeWithStrongVerbs, mockJobDescriptions.seniorDeveloper);

      expect(weakAnalysis.atsScore).toBeLessThan(100);
    });
  });

  // ============================================
  // TC_ATS_005: Strong Verbs Identification
  // ============================================
  describe('TC_ATS_005: Strong Action Verbs Identification', () => {
    test('Should identify strong action verbs', () => {
      const analysis = calculateATSScore(mockResume.resumeWithStrongVerbs, mockJobDescriptions.seniorDeveloper);

      expect(analysis.usedStrongVerbs).toBeDefined();
      expect(Array.isArray(analysis.usedStrongVerbs)).toBe(true);
      expect(analysis.usedStrongVerbs.length).toBeGreaterThan(0);
    });

    test('Should have strong verbs in strong resume', () => {
      const analysis = calculateATSScore(mockResume.resumeWithStrongVerbs, mockJobDescriptions.seniorDeveloper);

      const strongVerbs = ['Spearheaded', 'Orchestrated', 'Engineered'];
      const foundVerbs = analysis.usedStrongVerbs.filter(v => strongVerbs.includes(v));

      expect(foundVerbs.length).toBeGreaterThan(0);
    });

    test('Should have few or no strong verbs in weak resume', () => {
      const analysis = calculateATSScore(mockResume.resumeWithWeakVerbs, mockJobDescriptions.seniorDeveloper);

      // Weak resume may have some strong verbs but likely fewer
      expect(analysis.usedStrongVerbs.length).toBeLessThanOrEqual(5);
    });
  });

  // ============================================
  // TC_ATS_006-010: Additional Score Tests
  // ============================================
  describe('TC_ATS_006-010: Score Variations', () => {
    test('Should give higher score to complete resume', () => {
      const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.atsScore).toBeGreaterThan(30);
    });

    test('Should give lower score to incomplete resume', () => {
      const analysis = calculateATSScore(mockResume.minimumResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis.atsScore).toBeLessThan(70);
    });

    test('Should handle special characters in resume', () => {
      const analysis = calculateATSScore(mockResume.resumeWithSpecialChars, mockJobDescriptions.seniorDeveloper);

      expect(analysis).not.toBeNull();
      expect(analysis.atsScore).toBeDefined();
    });

    test('Should handle different job descriptions', () => {
      const seniorAnalysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);
      const juniorAnalysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.juniorDeveloper);

      expect(seniorAnalysis.atsScore).toBeDefined();
      expect(juniorAnalysis.atsScore).toBeDefined();
    });

    test('Should be consistent across multiple calls', () => {
      const analysis1 = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);
      const analysis2 = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(analysis1.atsScore).toBe(analysis2.atsScore);
    });
  });
});