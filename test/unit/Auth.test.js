import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from '../../src/Auth';
import { clearMockData } from '../helpers/testUtils';

describe('MODULE 1: Authentication Tests', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  describe('TC_AUTH_001-005: Registration Tests', () => {
    test('TC_AUTH_001: Should register user with valid credentials', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      // Switch to register mode
      const switchBtn = screen.getByText(/need an account|register/i);
      fireEvent.click(switchBtn);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /register/i });

      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'SecurePass123!');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalled();
      });
    });

    test('TC_AUTH_002: Should reject registration with missing email', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const switchBtn = screen.getByText(/register/i);
      fireEvent.click(switchBtn);

      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /register/i });

      await userEvent.type(passwordInput, 'SecurePass123!');
      fireEvent.click(submitBtn);

      expect(screen.getByText(/email|required/i)).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    test('TC_AUTH_003: Should reject registration with invalid email format', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const switchBtn = screen.getByText(/register/i);
      fireEvent.click(switchBtn);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /register/i });

      await userEvent.type(emailInput, 'invalidemail');
      await userEvent.type(passwordInput, 'SecurePass123!');
      fireEvent.click(submitBtn);

      expect(screen.getByText(/invalid.*email|email.*invalid/i)).toBeInTheDocument();
    });

    test('TC_AUTH_004: Should reject weak password', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const switchBtn = screen.getByText(/register/i);
      fireEvent.click(switchBtn);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /register/i });

      await userEvent.type(emailInput, 'user@example.com');
      await userEvent.type(passwordInput, '123');
      fireEvent.click(submitBtn);

      expect(screen.getByText(/password|weak|strong/i)).toBeInTheDocument();
    });

    test('TC_AUTH_005: Should hash password on registration', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const switchBtn = screen.getByText(/register/i);
      fireEvent.click(switchBtn);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /register/i });

      const plainPassword = 'SecurePass123!';
      await userEvent.type(emailInput, 'user@example.com');
      await userEvent.type(passwordInput, plainPassword);
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalled();
        const callArgs = mockOnLogin.mock.calls[0][0];
        expect(callArgs.passwordHash).not.toBe(plainPassword);
        expect(callArgs.passwordHash.length).toBeGreaterThan(20);
      });
    });
  });

  describe('TC_AUTH_006-010: Login Tests', () => {
    test('TC_AUTH_006: Should login with correct credentials', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'testuser@example.com');
      await userEvent.type(passwordInput, 'SecurePass123!');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalled();
      });
    });

    test('TC_AUTH_007: Should reject login with incorrect password', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'testuser@example.com');
      await userEvent.type(passwordInput, 'WrongPassword123!');
      fireEvent.click(submitBtn);

      expect(screen.getByText(/credentials|invalid|failed/i)).toBeInTheDocument();
    });

    test('TC_AUTH_008: Should reject login with non-existent email', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'nonexistent@example.com');
      await userEvent.type(passwordInput, 'SecurePass123!');
      fireEvent.click(submitBtn);

      expect(screen.getByText(/not found|invalid|failed/i)).toBeInTheDocument();
    });

    test('TC_AUTH_009: Should maintain session after login', async () => {
      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'testuser@example.com');
      await userEvent.type(passwordInput, 'SecurePass123!');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        const session = sessionStorage.getItem('RA_SESSION_AUTH');
        expect(session).not.toBeNull();
        const sessionData = JSON.parse(session);
        expect(sessionData.isLoggedIn).toBe(true);
      });
    });

    test('TC_AUTH_010: Should display error message on network failure', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );

      const mockOnLogin = jest.fn();
      render(<Auth onLogin={mockOnLogin} />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'user@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/network|error|server/i)).toBeInTheDocument();
      });
    });
  });
});