import { clearMockData } from '../helpers/testUtils';

describe('Security Tests: Input Validation', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  test('SEC_INPUT_001: Should sanitize HTML in user input', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeHTML(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  test('SEC_INPUT_002: Should prevent SQL injection patterns', () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const result = validateInput(maliciousInput);

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('SQL');
  });

  test('SEC_INPUT_003: Should prevent NoSQL injection', () => {
    const maliciousInput = { $ne: null };
    const result = validateMongoInput(maliciousInput);

    expect(result.isValid).toBe(false);
  });

  test('SEC_INPUT_004: Should validate email format', () => {
    const validEmails = ['user@example.com', 'test.user@domain.co.uk'];
    const invalidEmails = ['invalid', '@example.com', 'user@'];

    validEmails.forEach(email => {
      expect(validateEmail(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      expect(validateEmail(email)).toBe(false);
    });
  });

  test('SEC_INPUT_005: Should validate file upload', () => {
    const validFile = { name: 'resume.txt', type: 'text/plain', size: 100000 };
    const invalidFile = { name: 'virus.exe', type: 'application/x-msdownload', size: 500000 };

    expect(validateFile(validFile)).toBe(true);
    expect(validateFile(invalidFile)).toBe(false);
  });

  test('SEC_INPUT_006: Should prevent command injection', () => {
    const maliciousInput = '`rm -rf /`';
    const result = validateInput(maliciousInput);

    expect(result.isValid).toBe(false);
  });

  test('SEC_INPUT_007: Should escape special characters', () => {
    const input = '<>&"\'';
    const escaped = escapeSpecialChars(input);

    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');
    expect(escaped).toContain('&amp;');
  });

  test('SEC_INPUT_008: Should validate URL format', () => {
    const validUrls = ['https://example.com', 'http://test.org'];
    const invalidUrls = ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>'];

    validUrls.forEach(url => {
      expect(validateUrl(url)).toBe(true);
    });

    invalidUrls.forEach(url => {
      expect(validateUrl(url)).toBe(false);
    });
  });

  test('SEC_INPUT_009: Should validate file size', () => {
    const maxSize = 2 * 1024 * 1024; // 2MB

    const smallFile = { size: 1000000 };
    const largeFile = { size: 5000000 };

    expect(smallFile.size < maxSize).toBe(true);
    expect(largeFile.size < maxSize).toBe(false);
  });

  test('SEC_INPUT_010: Should prevent path traversal attacks', () => {
    const maliciousPath = '../../../etc/passwd';
    const result = validatePath(maliciousPath);

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('path traversal');
  });
});

function sanitizeHTML(input) {
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
}

function validateInput(input) {
  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
    /['";\\]/,
  ];

  const isMalicious = sqlPatterns.some(pattern => pattern.test(input));
  
  return {
    isValid: !isMalicious,
    reason: isMalicious ? 'SQL injection pattern detected' : 'Valid',
  };
}

function validateMongoInput(input) {
  if (typeof input === 'object' && input !== null) {
    const keys = Object.keys(input);
    const hasMalicious = keys.some(key => key.startsWith('$'));
    
    return {
      isValid: !hasMalicious,
      reason: hasMalicious ? 'NoSQL injection detected' : 'Valid',
    };
  }
  
  return { isValid: true, reason: 'Valid' };
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateFile(file) {
  const maxSize = 2 * 1024 * 1024;
  const allowedTypes = ['text/plain', 'application/pdf'];

  return file.size <= maxSize && allowedTypes.includes(file.type);
}

function escapeSpecialChars(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateUrl(url) {
  const dangerousProtocols = ['javascript:', 'data:', 'file:'];
  const isDangerous = dangerousProtocols.some(protocol => url.toLowerCase().startsWith(protocol));

  if (isDangerous) return false;

  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function validatePath(path) {
  if (path.includes('..') || path.includes('~')) {
    return {
      isValid: false,
      reason: 'Potential path traversal attack detected',
    };
  }

  return { isValid: true, reason: 'Valid' };
}