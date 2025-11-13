/**
 * Custom Assertion Helpers for System Tests
 */

/**
 * Assert that an element is visible and interactable
 */
export const assertElementInteractable = (element) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
  expect(element).not.toBeDisabled();
};

/**
 * Assert valid email format
 */
export const assertValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  expect(emailRegex.test(email)).toBe(true);
};

/**
 * Assert score is within valid range
 */
export const assertValidScore = (score) => {
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(100);
  expect(typeof score).toBe('number');
};

/**
 * Assert API response structure
 */
export const assertApiResponse = (response, expectedKeys) => {
  expect(response).toBeDefined();
  expect(typeof response).toBe('object');
  
  expectedKeys.forEach(key => {
    expect(response).toHaveProperty(key);
  });
};

/**
 * Assert file upload success
 */
export const assertFileUploaded = (fileElement, expectedFilename) => {
  expect(fileElement).toBeInTheDocument();
  expect(fileElement.textContent).toContain(expectedFilename);
};

/**
 * Assert error message displayed
 */
export const assertErrorDisplayed = (container, errorText) => {
  const errorElement = container.querySelector('[role="alert"]') || 
                        container.querySelector('.error') ||
                        container.querySelector('[class*="error"]');
  
  expect(errorElement).toBeInTheDocument();
  if (errorText) {
    expect(errorElement.textContent).toMatch(new RegExp(errorText, 'i'));
  }
};

/**
 * Assert loading state
 */
export const assertLoading = (container) => {
  const loadingIndicator = container.querySelector('[role="progressbar"]') ||
                           container.querySelector('.loading') ||
                           container.querySelector('[class*="loading"]');
  
  expect(loadingIndicator).toBeInTheDocument();
};

/**
 * Assert analysis results structure
 */
export const assertAnalysisResults = (results) => {
  expect(results).toHaveProperty('score');
  expect(results).toHaveProperty('feedback');
  assertValidScore(results.score);
  
  if (results.feedback) {
    expect(results.feedback).toHaveProperty('strengths');
    expect(results.feedback).toHaveProperty('improvements');
    expect(Array.isArray(results.feedback.strengths)).toBe(true);
    expect(Array.isArray(results.feedback.improvements)).toBe(true);
  }
};

/**
 * Assert authentication state
 */
export const assertAuthenticated = (container) => {
  // Check for common authenticated state indicators
  const logoutButton = container.querySelector('[aria-label*="logout"]') ||
                       container.querySelector('[class*="logout"]');
  
  const userMenu = container.querySelector('[aria-label*="user menu"]') ||
                   container.querySelector('[class*="user-menu"]');
  
  expect(logoutButton || userMenu).toBeInTheDocument();
};

/**
 * Assert chatbot message structure
 */
export const assertChatMessage = (message, sender) => {
  expect(message).toHaveProperty('text');
  expect(message).toHaveProperty('sender');
  expect(message.sender).toBe(sender);
  expect(typeof message.text).toBe('string');
  expect(message.text.length).toBeGreaterThan(0);
};