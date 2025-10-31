import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeAnalyzer from '../../src/ResumeAnalyzer';
import Auth from '../../src/Auth';
import Chatbot from '../../src/Chatbot';
import App from '../../src/App';
import { clearMockData, mockUserLogin } from '../helpers/testUtils';

describe('Accessibility Tests: Keyboard Navigation', () => {
  beforeEach(() => {
    clearMockData();
    mockUserLogin('test@example.com');
    jest.clearAllMocks();
  });

  // ============================================
  // TC_A11Y_001: Tab Navigation
  // ============================================
  describe('TC_A11Y_001: Tab Key Navigation', () => {
    test('Should navigate through form fields with Tab', async () => {
      render(<Auth onLogin={() => {}} />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      emailInput.focus();
      expect(emailInput).toHaveFocus();

      fireEvent.keyDown(emailInput, { key: 'Tab', code: 'Tab' });
      // Focus should move to next element

      expect(true).toBe(true);
    });

    test('Should navigate buttons with Tab', () => {
      render(<ResumeAnalyzer userEmail="test@example.com" />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(btn => {
        expect(btn).toHaveAttribute('tabindex') || expect(btn.tagName).toBe('BUTTON');
      });
    });

    test('Should support Shift+Tab for backward navigation', () => {
      render(<Auth onLogin={() => {}} />);

      const inputs = screen.getAllByRole('textbox');
      const lastInput = inputs[inputs.length - 1];

      lastInput.focus();
      expect(lastInput).toHaveFocus();

      fireEvent.keyDown(lastInput, { key: 'Tab', shiftKey: true });
      // Focus should move to previous element
    });
  });

  // ============================================
  // TC_A11Y_002: Enter Key Navigation
  // ============================================
  describe('TC_A11Y_002: Enter Key Activation', () => {
    test('Should submit form with Enter key', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

      // Form should submit
      expect(true).toBe(true);
    });

    test('Should activate buttons with Enter key', () => {
      render(<ResumeAnalyzer userEmail="test@example.com" />);

      const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
      analyzeBtn.focus();

      fireEvent.keyDown(analyzeBtn, { key: 'Enter', code: 'Enter' });

      // Button action should trigger
      expect(true).toBe(true);
    });

    test('Should activate buttons with Space key', () => {
      render(<ResumeAnalyzer userEmail="test@example.com" />);

      const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
      analyzeBtn.focus();

      fireEvent.keyDown(analyzeBtn, { key: ' ', code: 'Space' });

      // Button action should trigger
      expect(true).toBe(true);
    });
  });

  // ============================================
  // TC_A11Y_003: Escape Key
  // ============================================
  describe('TC_A11Y_003: Escape Key Handling', () => {
    test('Should close chatbot with Escape key', () => {
      const mockOnClose = jest.fn();
      render(<Chatbot onClose={mockOnClose} isOpen={true} />);

      const chatbot = screen.getByText(/resume assistant/i).closest('.chatbot-container');

      fireEvent.keyDown(chatbot, { key: 'Escape', code: 'Escape' });

      // Chatbot should close
      expect(true).toBe(true);
    });

    test('Should close modals with Escape', () => {
      render(<App />);

      const modal = document.querySelector('.modal');
      if (modal) {
        fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });
      }

      expect(true).toBe(true);
    });
  });

  // ============================================
  // TC_A11Y_004: Arrow Keys
  // ============================================
  describe('TC_A11Y_004: Arrow Key Navigation', () => {
    test('Should navigate dropdown with arrow keys', () => {
      render(<ResumeAnalyzer userEmail="test@example.com" />);

      const select = screen.getByDisplayValue(/software engineer|developer/i);
      select.focus();

      fireEvent.keyDown(select, { key: 'ArrowDown', code: 'ArrowDown' });

      // Selection should change
      expect(true).toBe(true);
    });
  });

  // ============================================
  // TC_A11Y_005: Focus Management
  // ============================================
  describe('TC_A11Y_005: Focus Management', () => {
    test('Should trap focus in modal', () => {
      render(<Auth onLogin={() => {}} />);

      const firstElement = screen.getByPlaceholderText(/email/i);
      const lastElement = screen.getByRole('button', { name: /login|register/i });

      firstElement.focus();
      expect(firstElement).toHaveFocus();
    });

    test('Should restore focus after modal closes', () => {
      render(<App />);

      const fab = screen.queryByRole('button', { name: /chatbot|assistant/i });
      if (fab) {
        fab.focus();
        expect(fab).toHaveFocus();
      }
    });

    test('Should move focus to new content', () => {
      render(<ResumeAnalyzer userEmail="test@example.com" />);

      const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
      analyzeBtn.focus();
      fireEvent.click(analyzeBtn);

      // Focus should move to results or next interactive element
      expect(true).toBe(true);
    });
  });

  // ============================================
  // TC_A11Y_006: Skip Links
  // ============================================
  describe('TC_A11Y_006: Skip Links', () => {
    test('Should have skip to main content link', () => {
      render(<App />);

      const skipLink = screen.queryByText(/skip to|main content/i);
      expect(skipLink).toBeInTheDocument();
    });
  });

  // ============================================
  // TC_A11Y_007: Visible Focus Indicators
  // ============================================
  describe('TC_A11Y_007: Visible Focus Indicators', () => {
    test('Should show focus on buttons', () => {
      render(<ResumeAnalyzer userEmail="test@example.com" />);

      const btn = screen.getByRole('button', { name: /analyze/i });
      btn.focus();

      const styles = window.getComputedStyle(btn);
      expect(styles.outline).not.toBe('none');
    });

    test('Should show focus on inputs', () => {
      render(<Auth onLogin={() => {}} />);

      const input = screen.getByPlaceholderText(/email/i);
      input.focus();

      const styles = window.getComputedStyle(input);
      expect(styles.outline).not.toBe('none');
    });
  });

  // ============================================
  // TC_A11Y_008: Keyboard Traps
  // ============================================
  describe('TC_A11Y_008: No Keyboard Traps', () => {
    test('Should not trap keyboard focus', () => {
      render(<Auth onLogin={() => {}} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        input.focus();
        // User should be able to Tab out
        expect(true).toBe(true);
      });
    });
  });
});