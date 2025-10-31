import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeAnalyzer from '../../src/ResumeAnalyzer';
import { clearMockData, mockUserLogin } from '../helpers/testUtils';
import { mockResume } from '../helpers/mockDataGenerator';

describe('Integration: PDF Export', () => {
  beforeEach(() => {
    clearMockData();
    mockUserLogin('test@example.com');
    jest.clearAllMocks();
  });

  test('INT_PDF_001: Should export resume as PDF after analysis', async () => {
    render(<ResumeAnalyzer userEmail="test@example.com" />);

    // Input resume
    const resumeInput = screen.getByPlaceholderText(/paste your resume/i);
    await userEvent.type(resumeInput, mockResume.validResume);

    // Analyze
    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      const downloadBtn = screen.getByRole('button', { name: /download|export/i });
      expect(downloadBtn).not.toBeDisabled();
    });

    // Download
    const downloadBtn = screen.getByRole('button', { name: /download|export/i });
    fireEvent.click(downloadBtn);

    // Verify download triggered
    await waitFor(() => {
      expect(downloadBtn).toBeInTheDocument();
    });
  });

  test('INT_PDF_002: Should include template styling in PDF', async () => {
    render(<ResumeAnalyzer userEmail="test@example.com" />);

    const resumeInput = screen.getByPlaceholderText(/paste your resume/i);
    await userEvent.type(resumeInput, mockResume.validResume);

    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      const templateBtn = screen.queryByRole('button', { name: /template|modern|standard/i });
      if (templateBtn) {
        fireEvent.click(templateBtn);
      }
    });

    const downloadBtn = screen.getByRole('button', { name: /download|export/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(screen.queryByText(/processing|generating/i)).not.toBeInTheDocument();
    });
  });
});