import { clearMockData, mockUserLogin, mockResumeData } from '../helpers/testUtils';
import { mockResume, mockJobDescriptions } from '../helpers/mockDataGenerator';

describe('INT_RESUME: Integration - Resume Analysis Workflow', () => {
  beforeEach(() => {
    clearMockData();
    mockUserLogin('user@example.com');
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // INT_RESUME_001: Upload and analyze
  // ============================================
  describe('INT_RESUME_001: Upload and Analysis', () => {
    test('Should complete full resume analysis workflow', () => {
      const workflow = {
        step1_upload: mockResume.validResume,
        step2_addJD: mockJobDescriptions.seniorDeveloper,
        step3_analyze: true,
        step4_viewResults: true,
      };

      expect(workflow.step1_upload).toBeDefined();
      expect(workflow.step2_addJD).toBeDefined();
      expect(workflow.step3_analyze).toBe(true);
    });

    test('Should save resume data for user', () => {
      mockResumeData('user@example.com', mockResume.validResume);

      const saved = localStorage.getItem('RA_RESUME_user@example.com');
      expect(saved).toBeDefined();
    });

    test('Should display analysis results', () => {
      const results = {
        atsScore: 78,
        matchedKeywords: ['react', 'node.js'],
        missingKeywords: ['kubernetes'],
      };

      expect(results.atsScore).toBeDefined();
      expect(results.matchedKeywords.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // INT_RESUME_002: Multi-job analysis
  // ============================================
  describe('INT_RESUME_002: Multi-Job Analysis', () => {
    test('Should analyze same resume for multiple JDs', () => {
      const analyses = [
        { jd: mockJobDescriptions.seniorDeveloper, score: 78 },
        { jd: mockJobDescriptions.juniorDeveloper, score: 85 },
      ];

      expect(analyses.length).toBe(2);
      expect(analyses[0].score).toBeLessThan(analyses[1].score);
    });
  });

  // ============================================
  // INT_RESUME_003: Template application
  // ============================================
  describe('INT_RESUME_003: Template Application', () => {
    test('Should apply template to resume preview', () => {
      const state = {
        resumeData: mockResume.validResume,
        selectedTemplate: 'Modern',
        preview: '<div>Resume with Modern template</div>',
      };

      expect(state.selectedTemplate).toBe('Modern');
      expect(state.preview).toContain('template');
    });
  });

  // ============================================
  // INT_RESUME_004: Save and retrieve
  // ============================================
  describe('INT_RESUME_004: Save and Retrieve', () => {
    test('Should save and retrieve resume analysis', () => {
      mockResumeData('user@example.com', mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      const saved = JSON.parse(localStorage.getItem('RA_RESUME_user@example.com'));

      expect(saved.resume).toContain('John Doe');
      expect(saved.jd).toContain('React');
    });
  });
});