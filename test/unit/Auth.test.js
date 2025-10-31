// test/Auth.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from '../src/Auth';

describe('Auth Module - Registration Tests', () => {
  test('TC_AUTH_001: Should register user with valid credentials', async () => {
    const mockOnLogin = jest.fn();
    render(<Auth onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const registerBtn = screen.getByRole('button', { name: /register/i });
    
    await userEvent.type(emailInput, 'testuser@example.com');
    await userEvent.type(passwordInput, 'SecurePass123!');
    fireEvent.click(registerBtn);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  test('TC_AUTH_002: Should reject registration with missing email', async () => {
    const mockOnLogin = jest.fn();
    render(<Auth onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const registerBtn = screen.getByRole('button', { name: /register/i });
    
    await userEvent.type(passwordInput, 'SecurePass123!');
    fireEvent.click(registerBtn);
    
    expect(screen.getByText(/email required/i)).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('TC_AUTH_003: Should reject registration with invalid email format', async () => {
    const mockOnLogin = jest.fn();
    render(<Auth onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const registerBtn = screen.getByRole('button', { name: /register/i });
    
    await userEvent.type(emailInput, 'invalidemail');
    await userEvent.type(passwordInput, 'SecurePass123!');
    fireEvent.click(registerBtn);
    
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  test('TC_AUTH_004: Should reject weak password', async () => {
    const mockOnLogin = jest.fn();
    render(<Auth onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const registerBtn = screen.getByRole('button', { name: /register/i });
    
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, '123'); // Too weak
    fireEvent.click(registerBtn);
    
    expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
  });

  test('TC_AUTH_005: Should hash password on registration', async () => {
    const mockOnLogin = jest.fn();
    render(<Auth onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const registerBtn = screen.getByRole('button', { name: /register/i });
    
    const plainPassword = 'SecurePass123!';
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, plainPassword);
    fireEvent.click(registerBtn);
    
    await waitFor(() => {
      const storedData = JSON.parse(localStorage.getItem('RA_SESSION_AUTH'));
      expect(storedData.passwordHash).not.toBe(plainPassword);
      expect(storedData.passwordHash.length).toBeGreaterThan(20);
    });
  });
});