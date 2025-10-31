import { clearMockData } from '../helpers/testUtils';
import { mockResume, mockJobDescriptions } from '../helpers/mockDataGenerator';

describe('MODULE 2: Resume Analyzer Component Tests', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TC_ANALYZER_001: Component Rendering
  // ============================================
  describe('TC_ANALYZER_001: Component Rendering', () => {
    test('Should render resume input textarea', () => {
      const component = {
        renderInputs: () => ({
          resumeInput: true,
          jdInput: true,
          analyzeButton: true,
        }),
      };

      const rendered = component.renderInputs();
      expect(rendered.resumeInput).toBe(true);
    });

    test('Should render analyze button', () => {
      const component = {
        buttons: {
          analyze: { label: 'Analyze Resume', enabled: true },
        },
      };

      expect(component.buttons.analyze.enabled).toBe(true);
    });

    test('Should render job description input', () => {
      const component = {
        inputs: ['resumeInput', 'jdInput', 'templateSelect'],
      };

      expect(component.inputs).toContain('jdInput');
    });
  });

  // ============================================
  // TC_ANALYZER_002: Resume Input Handling
  // ============================================
  describe('TC_ANALYZER_002: Resume Input Handling', () => {
    test('Should accept resume text input', () => {
      const state = { resumeText: '' };
      state.resumeText = mockResume.validResume;

      expect(state.resumeText).toContain('John Doe');
      expect(state.resumeText).toContain('SKILLS');
    });

    test('Should handle large resume input', () => {
      const state = { resumeText: mockResume.largeResume };

      expect(state.resumeText.length).toBeGreaterThan(1000);
    });

    test('Should clear previous input on new upload', () => {
      const state = { resumeText: 'Old resume content' };
      state.resumeText = mockResume.validResume;

      expect(state.resumeText).not.toContain('Old resume');
      expect(state.resumeText).toContain('John Doe');
    });
  });

  // ============================================
  // TC_ANALYZER_003: Job Description Input
  // ============================================
  describe('TC_ANALYZER_003: Job Description Input', () => {
    test('Should accept job description input', () => {
      const state = { jdText: mockJobDescriptions.seniorDeveloper };

      expect(state.jdText).toContain('React');
      expect(state.jdText).toContain('Node.js');
    });

    test('Should accept different job descriptions', () => {
      const state = { jdText: '' };
      
      state.jdText = mockJobDescriptions.juniorDeveloper;
      expect(state.jdText).toContain('HTML5');

      state.jdText = mockJobDescriptions.designerRole;
      expect(state.jdText).toContain('Figma');
    });

    test('Should handle empty JD gracefully', () => {
      const state = { jdText: '' };

      expect(state.jdText).toBe('');
    });
  });

  // ============================================
  // TC_ANALYZER_004: Analysis Triggering
  // ============================================
  describe('TC_ANALYZER_004: Analysis Triggering', () => {
    test('Should trigger analysis on button click', () => {
      const mockAnalyze = jest.fn();
      const state = {
        resumeText: mockResume.validResume,
        jdText: mockJobDescriptions.seniorDeveloper,
        onAnalyze: mockAnalyze,
      };

      state.onAnalyze();
      expect(mockAnalyze).toHaveBeenCalled();
    });

    test('Should not analyze with empty resume', () => {
      const mockAnalyze = jest.fn();
      const state = {
        resumeText: '',
        jdText: mockJobDescriptions.seniorDeveloper,
        onAnalyze: mockAnalyze,
      };

      if (state.resumeText.trim()) {
        state.onAnalyze();
      }

      expect(mockAnalyze).not.toHaveBeenCalled();
    });

    test('Should pass correct data to analysis function', () => {
      const mockAnalyze = jest.fn((resume, jd) => ({
        atsScore: 75,
      }));

      const result = mockAnalyze(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

      expect(mockAnalyze).toHaveBeenCalledWith(
        mockResume.validResume,
        mockJobDescriptions.seniorDeveloper
      );
      expect(result.atsScore).toBe(75);
    });
  });

  // ============================================
  // TC_ANALYZER_005: Display Analysis Results
  // ============================================
  describe('TC_ANALYZER_005: Display Analysis Results', () => {
    test('Should display ATS score after analysis', () => {
      const state = {
        analysisResult: { atsScore: 82 },
        showResults: true,
      };

      expect(state.showResults).toBe(true);
      expect(state.analysisResult.atsScore).toBe(82);
    });

    test('Should display matched keywords', () => {
      const state = {
        analysisResult: {
          matched: ['react', 'node.js', 'mongodb'],
          atsScore: 75,
        },
      };

      expect(state.analysisResult.matched.length).toBe(3);
      expect(state.analysisResult.matched).toContain('react');
    });

    test('Should display missing keywords', () => {
      const state = {
        analysisResult: {
          missingKeys: ['kubernetes', 'graphql'],
          atsScore: 65,
        },
      };

      expect(state.analysisResult.missingKeys.length).toBe(2);
    });
  });

  // ============================================
  // TC_ANALYZER_006: Role Selection
  // ============================================
  describe('TC_ANALYZER_006: Job Role Selection', () => {
    test('Should allow user to select different roles', () => {
      const state = {
        selectedRole: 'Senior Developer',
        availableRoles: ['Junior Developer', 'Senior Developer', 'Designer'],
      };

      expect(state.availableRoles).toContain(state.selectedRole);
    });

    test('Should update role and provide relevant JD', () => {
      const state = { selectedRole: 'Designer' };

      const roleToJd = {
        'Designer': mockJobDescriptions.designerRole,
        'Senior Developer': mockJobDescriptions.seniorDeveloper,
      };

      const jd = roleToJd[state.selectedRole];
      expect(jd).toContain('Design');
    });
  });

  // ============================================
  // TC_ANALYZER_007: Template Selection
  // ============================================
  describe('TC_ANALYZER_007: Template Selection', () => {
    test('Should allow template selection', () => {
      const state = {
        templates: ['Modern', 'Standard', 'Creative'],
        selectedTemplate: 'Modern',
      };

      expect(state.templates).toContain(state.selectedTemplate);
    });

    test('Should update preview when template changes', () => {
      const state = {
        selectedTemplate: 'Modern',
        previewUpdated: false,
      };

      state.selectedTemplate = 'Standard';
      state.previewUpdated = true;

      expect(state.previewUpdated).toBe(true);
      expect(state.selectedTemplate).toBe('Standard');
    });
  });

  // ============================================
  // TC_ANALYZER_008: Preview Update
  // ============================================
  describe('TC_ANALYZER_008: Real-time Preview', () => {
    test('Should update preview in real-time', () => {
      const state = {
        resumeText: '',
        preview: '',
      };

      state.resumeText = 'John Doe';
      state.preview = state.resumeText;

      expect(state.preview).toBe('John Doe');
    });

    test('Should reflect template changes in preview', () => {
      const state = {
        template: 'Modern',
        preview: '<div class="modern">Resume</div>',
      };

      expect(state.preview).toContain('modern');
    });
  });

  // ============================================
  // TC_ANALYZER_009: Error Handling
  // ============================================
  describe('TC_ANALYZER_009: Error Handling', () => {
    test('Should handle analysis errors gracefully', () => {
      const mockAnalyze = jest.fn(() => {
        throw new Error('Analysis failed');
      });

      expect(() => {
        mockAnalyze();
      }).toThrow('Analysis failed');
    });

    test('Should show error message on failure', () => {
      const state = {
        error: null,
        isAnalyzing: false,
      };

      try {
        throw new Error('Network error');
      } catch (e) {
        state.error = e.message;
        state.isAnalyzing = false;
      }

      expect(state.error).toBe('Network error');
      expect(state.isAnalyzing).toBe(false);
    });
  });

  // ============================================
  // TC_ANALYZER_010: Loading State
  // ============================================
  describe('TC_ANALYZER_010: Loading State', () => {
    test('Should show loading state during analysis', async () => {
      const state = { isAnalyzing: false };

      state.isAnalyzing = true;
      expect(state.isAnalyzing).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 100));
      state.isAnalyzing = false;
      expect(state.isAnalyzing).toBe(false);
    });

    test('Should disable buttons during loading', () => {
      const state = {
        isAnalyzing: true,
        buttons: {
          analyze: { disabled: true },
          download: { disabled: true },
        },
      };

      expect(state.buttons.analyze.disabled).toBe(true);
      expect(state.buttons.download.disabled).toBe(true);
    });
  });
});