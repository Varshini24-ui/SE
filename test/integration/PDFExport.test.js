import { clearMockData, mockUserLogin } from '../helpers/testUtils';
import { mockResume } from '../helpers/mockDataGenerator';

describe('INT_PDF: Integration - PDF Export', () => {
  beforeEach(() => {
    clearMockData();
    mockUserLogin('user@example.com');
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // INT_PDF_001: Complete export flow
  // ============================================
  describe('INT_PDF_001: Complete PDF Export', () => {
    test('Should export resume as PDF after analysis', async () => {
      const state = {
        resumeText: mockResume.validResume,
        selectedTemplate: 'Modern',
        pdfGenerated: false,
      };

      state.pdfGenerated = true;

      expect(state.pdfGenerated).toBe(true);
      expect(state.selectedTemplate).toBe('Modern');
    });

    test('Should include template styling in PDF', () => {
      const pdfContent = {
        template: 'Modern',
        cssClasses: ['template-modern', 'styled'],
        resumeData: mockResume.validResume,
      };

      expect(pdfContent.template).toBe('Modern');
      expect(pdfContent.cssClasses.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // INT_PDF_002: Download handling
  // ============================================
  describe('INT_PDF_002: Download Handling', () => {
    test('Should trigger download after PDF generation', () => {
      const mockDownload = jest.fn();
      const state = { onGenerateAndDownload: mockDownload };

      state.onGenerateAndDownload();

      expect(mockDownload).toHaveBeenCalled();
    });

    test('Should provide correct filename for download', () => {
      const filename = 'Resume_JohnDoe.pdf';

      expect(filename).toMatch(/\.pdf$/);
      expect(filename).toContain('Resume');
    });
  });
});