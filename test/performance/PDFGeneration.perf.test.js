import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeAnalyzer from '../../src/ResumeAnalyzer';
import { clearMockData, mockUserLogin } from '../helpers/testUtils';
import { mockResume } from '../helpers/mockDataGenerator';

describe('Performance Tests: PDF Generation', () => {
  beforeEach(() => {
    clearMockData();
    mockUserLogin('test@example.com');
    jest.clearAllMocks();
  });

  test('PERF_PDF_001: Should generate PDF within 10 seconds', async () => {
    render(<ResumeAnalyzer userEmail="test@example.com" />);

    const resumeInput = screen.getByPlaceholderText(/paste your resume/i);
    await userEvent.type(resumeInput, mockResume.validResume);

    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      const downloadBtn = screen.getByRole('button', { name: /download|export/i });
      expect(downloadBtn).not.toBeDisabled();
    });

    const startTime = performance.now();
    
    const downloadBtn = screen.getByRole('button', { name: /download|export/i });
    fireEvent.click(downloadBtn);

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    expect(executionTime).toBeLessThan(10000);
  });

  test('PERF_PDF_002: Should handle large resume PDF generation', async () => {
    render(<ResumeAnalyzer userEmail="test@example.com" />);

    const largeResume = mockResume.validResume.repeat(10);
    const resumeInput = screen.getByPlaceholderText(/paste your resume/i);
    await userEvent.type(resumeInput, largeResume);

    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      const downloadBtn = screen.getByRole('button', { name: /download|export/i });
      expect(downloadBtn).not.toBeDisabled();
    }, { timeout: 15000 });
  });

  test('PERF_PDF_003: Memory usage during PDF generation', async () => {
    render(<ResumeAnalyzer userEmail="test@example.com" />);

    const resumeInput = screen.getByPlaceholderText(/paste your resume/i);
    await userEvent.type(resumeInput, mockResume.validResume);

    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    const initialMemory = performance.memory?.usedJSHeapSize || 0;

    await waitFor(() => {
      const downloadBtn = screen.getByRole('button', { name: /download|export/i });
      fireEvent.click(downloadBtn);
    });

    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).toBeLessThan(50000000); // 50MB max increase
  });

  test('PERF_PDF_004: Should not impact UI responsiveness', async () => {
    render(<ResumeAnalyzer userEmail="test@example.com" />);

    const resumeInput = screen.getByPlaceholderText(/paste your resume/i);
    await userEvent.type(resumeInput, mockResume.validResume);

    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      const downloadBtn = screen.getByRole('button', { name: /download|export/i });
      expect(downloadBtn).not.toBeDisabled();
    });

    // Component should still be responsive
    expect(screen.getByPlaceholderText(/paste your resume/i)).toBeEnabled();
  });
});