import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { clearMockData } from '../helpers/testUtils';

describe('Integration: Authentication Flow', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  test('INT_AUTH_001: Should complete full registration flow', async () => {
    render(<App />);

    // Check for login/register
    const switchBtn = screen.getByText(/need an account|register/i);
    fireEvent.click(switchBtn);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /register/i });

    await userEvent.type(emailInput, 'newuser@example.com');
    await userEvent.type(passwordInput, 'SecurePass123!');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/resume analyzer|analyze/i)).toBeInTheDocument();
    });
  });

  test('INT_AUTH_002: Should complete full login flow', async () => {
    render(<App />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /login/i });

    await userEvent.type(emailInput, 'testuser@example.com');
    await userEvent.type(passwordInput, 'SecurePass123!');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/resume analyzer|analyze/i)).toBeInTheDocument();
    });
  });

  test('INT_AUTH_003: Should persist session after login', async () => {
    render(<App />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /login/i });

    await userEvent.type(emailInput, 'testuser@example.com');
    await userEvent.type(passwordInput, 'SecurePass123!');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const session = sessionStorage.getItem('RA_SESSION_AUTH');
      expect(session).not.toBeNull();
    });
  });

  test('INT_AUTH_004: Should logout successfully', async () => {
    render(<App />);

    // Login first
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /login/i });

    await userEvent.type(emailInput, 'testuser@example.com');
    await userEvent.type(passwordInput, 'SecurePass123!');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });

    // Logout
    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });
  });
});