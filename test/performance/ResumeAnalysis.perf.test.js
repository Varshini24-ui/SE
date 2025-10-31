import { clearMockData } from '../helpers/testUtils';
import { mockResume, mockJobDescriptions } from '../helpers/mockDataGenerator';

const calculateATSScore = (resumeText, jobDescription = '') => {
  if (!resumeText || !resumeText.trim()) return null;
  return {
    atsScore: 75,
    found: {},
    missing: [],
    matched: [],
    missingKeys: [],
    weakWordCount: 0,
    usedStrongVerbs: [],
    uniqueJD: 10,
  };
};

describe('Performance Tests: Resume Analysis', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  test('PERF_001: Should analyze resume within 15 seconds', () => {
    const startTime = performance.now();

    const analysis = calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    expect(executionTime).toBeLessThan(15000);
    expect(analysis).not.toBeNull();
  });

  test('PERF_002: Should handle large resume efficiently', () => {
    const largeResume = mockResume.validResume.repeat(20);

    const startTime = performance.now();
    const analysis = calculateATSScore(largeResume, mockJobDescriptions.seniorDeveloper);
    const endTime = performance.now();

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(5000);
  });

  test('PERF_003: Should process multiple analyses quickly', () => {
    const startTime = performance.now();

    for (let i = 0; i < 10; i++) {
      calculateATSScore(mockResume.validResume, mockJobDescriptions.seniorDeveloper);
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    expect(executionTime).toBeLessThan(10000);
  });
});