import React from 'react';
import { render } from '@testing-library/react';

/**
 * Custom render function with providers
 */
export function renderWithProviders(ui, { ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Get form input values from container
 */
export function getFormValues(container) {
  const inputs = container.querySelectorAll('input, textarea, select');
  const values = {};

  inputs.forEach(input => {
    const key = input.name || input.id;
    if (input.type === 'checkbox' || input.type === 'radio') {
      values[key] = input.checked;
    } else {
      values[key] = input.value;
    }
  });

  return values;
}

/**
 * Mock user login
 */
export function mockUserLogin(email = 'test@example.com') {
  const userData = {
    isLoggedIn: true,
    userEmail: email,
    passwordHash: 'hashedPassword123abc' + Date.now(),
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000),
  };

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('RA_SESSION_AUTH', JSON.stringify(userData));
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`RA_USER_${email}`, JSON.stringify(userData));
  }
  return userData;
}

/**
 * Mock resume data storage
 */
export function mockResumeData(
  email,
  resumeText = 'John Doe\nEmail: john@example.com\nSkills: React, Node.js',
  jobDescription = 'Looking for React developer'
) {
  const resumeData = {
    resume: resumeText,
    jd: jobDescription,
    timestamp: Date.now(),
    expiresAt: Date.now() + (5 * 24 * 60 * 60 * 1000),
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`RA_RESUME_${email}`, JSON.stringify(resumeData));
  }
  return resumeData;
}

/**
 * Clear all mock data
 */
export function clearMockData() {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
  jest.clearAllMocks();
}

/**
 * Create mock file
 */
export function createMockFile(content = '', filename = 'test.txt', type = 'text/plain') {
  const blob = new Blob([content], { type });
  return new File([blob], filename, { type });
}

/**
 * Wait for element to appear in DOM
 */
export async function waitForElement(callback, timeout = 3000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const element = callback();
      if (element) return element;
    } catch (e) {
      // Element not found yet
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Element not found within ${timeout}ms`);
}

/**
 * Simulate typing in input
 */
export async function typeText(element, text, delay = 50) {
  for (let char of text) {
    element.value += char;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Get all test data attributes
 */
export function getTestData(container) {
  const elements = container.querySelectorAll('[data-testid]');
  const data = {};

  elements.forEach(el => {
    data[el.getAttribute('data-testid')] = el.textContent;
  });

  return data;
}

export default {
  renderWithProviders,
  waitForAsync,
  getFormValues,
  mockUserLogin,
  mockResumeData,
  clearMockData,
  createMockFile,
  waitForElement,
  typeText,
  getTestData,
};