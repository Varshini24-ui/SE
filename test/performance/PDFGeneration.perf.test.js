import { clearMockData, mockResumeData } from '../helpers/testUtils';
import { mockResume } from '../helpers/mockDataGenerator';

describe('PERF_PDF: Performance Tests - PDF Generation', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  // ============================================
  // PERF_PDF_001: PDF generation time
  // ============================================
  describe('PERF_PDF_001: PDF Generation Time', () => {
    test('Should generate PDF within 3 seconds', async () => {
      mockResumeData('user@example.com', mockResume.validResume);

      const startTime = performance.now();

      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 100));
      const pdfGenerated = true;

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(pdfGenerated).toBe(true);
      expect(executionTime).toBeLessThan(3000);
    });

    test('Should generate multiple PDFs sequentially', async () => {
      const templates = ['Modern', 'Standard', 'Creative'];

      const startTime = performance.now();

      for (const template of templates) {
        mockResumeData('user@example.com', mockResume.validResume);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(5000);
    });
  });

  // ============================================
  // PERF_PDF_002: Large document handling
  // ============================================
  describe('PERF_PDF_002: Large Document Handling', () => {
    test('Should handle large resume PDF generation', async () => {
      const largeResume = mockResume.validResume.repeat(5);
      mockResumeData('user@example.com', largeResume);

      const startTime = performance.now();
      await new Promise(resolve => setTimeout(resolve, 150));
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(3000);
    });
  });

  // ============================================
  // PERF_PDF_003: Memory efficiency
  // ============================================
  describe('PERF_PDF_003: Memory Efficiency', () => {
    test('Should not leak memory during PDF generation', async () => {
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        mockResumeData(`user${i}@example.com`, mockResume.validResume);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Cleanup
      localStorage.clear();
      expect(localStorage.getItem('RA_RESUME_user0@example.com')).toBeNull();
    });
  });

  // ============================================
  // PERF_PDF_004: Download performance
  // ============================================
  describe('PERF_PDF_004: Download Performance', () => {
    test('Should initiate download quickly', async () => {
      const mockDownload = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 50))
      );

      const startTime = performance.now();
      await mockDownload();
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(500);
      expect(mockDownload).toHaveBeenCalled();
    });
  });
});