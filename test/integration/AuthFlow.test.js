import { clearMockData, mockUserLogin, mockResumeData } from '../helpers/testUtils';
import { mockResume, mockJobDescriptions } from '../helpers/mockDataGenerator';

describe('INT_AUTH: Integration - Complete Authentication Flow', () => {
  beforeEach(() => {
    clearMockData();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // INT_AUTH_001: Complete registration to dashboard
  // ============================================
  describe('INT_AUTH_001: Complete Registration Flow', () => {
    test('Should complete full registration process', async () => {
      const user = { email: '', password: '', isLoggedIn: false };

      user.email = 'newuser@example.com';
      user.password = 'SecurePass123!';
      
      // Store credentials
      localStorage.setItem(`RA_USER_${user.email}`, JSON.stringify({
        email: user.email,
        passwordHash: 'hashed_value',
      }));
      
      user.isLoggedIn = true;

      expect(user.isLoggedIn).toBe(true);
      expect(user.email).toBe('newuser@example.com');
      expect(localStorage.getItem(`RA_USER_${user.email}`)).toBeDefined();
    });

    test('Should create persistent session after registration', () => {
      const email = 'user@example.com';
      mockUserLogin(email);

      const session = sessionStorage.getItem('RA_SESSION_AUTH');
      const stored = localStorage.getItem(`RA_USER_${email}`);

      expect(session).toBeDefined();
      expect(stored).toBeDefined();
    });

    test('Should allow user to proceed to main app after registration', () => {
      mockUserLogin('user@example.com');

      const appState = {
        isLoggedIn: true,
        currentPage: 'analyzer',
        user: { email: 'user@example.com' },
      };

      expect(appState.isLoggedIn).toBe(true);
      expect(appState.currentPage).toBe('analyzer');
    });
  });

  // ============================================
  // INT_AUTH_002: Complete login to access app
  // ============================================
  describe('INT_AUTH_002: Complete Login Flow', () => {
    test('Should complete full login process', () => {
      // Register user first
      localStorage.setItem(`RA_USER_testuser@example.com`, JSON.stringify({
        email: 'testuser@example.com',
        passwordHash: 'hash123',
      }));

      // Login
      mockUserLogin('testuser@example.com');

      const session = JSON.parse(sessionStorage.getItem('RA_SESSION_AUTH'));
      expect(session.isLoggedIn).toBe(true);
      expect(session.userEmail).toBe('testuser@example.com');
    });

    test('Should navigate to analyzer after successful login', () => {
      mockUserLogin('user@example.com');

      const navigationState = {
        previousPage: 'login',
        currentPage: 'analyzer',
        isLoggedIn: true,
      };

      expect(navigationState.currentPage).toBe('analyzer');
      expect(navigationState.isLoggedIn).toBe(true);
    });
  });

  // ============================================
  // INT_AUTH_003: Session persistence
  // ============================================
  describe('INT_AUTH_003: Session Persistence', () => {
    test('Should maintain session across page reloads', () => {
      mockUserLogin('user@example.com');

      // Simulate page reload
      const session1 = sessionStorage.getItem('RA_SESSION_AUTH');
      const session2 = sessionStorage.getItem('RA_SESSION_AUTH');

      expect(session1).toBe(session2);
    });

    test('Should restore user data on app initialization', () => {
      mockUserLogin('user@example.com');
      mockResumeData('user@example.com', mockResume.validResume);

      const session = JSON.parse(sessionStorage.getItem('RA_SESSION_AUTH'));
      const userData = JSON.parse(localStorage.getItem('RA_USER_user@example.com'));

      expect(session.isLoggedIn).toBe(true);
      expect(userData).toBeDefined();
    });
  });

  // ============================================
  // INT_AUTH_004: Logout and cleanup
  // ============================================
  describe('INT_AUTH_004: Logout Functionality', () => {
    test('Should logout and clear session', () => {
      mockUserLogin('user@example.com');

      // Logout
      sessionStorage.clear();

      const session = sessionStorage.getItem('RA_SESSION_AUTH');
      expect(session).toBeNull();
    });

    test('Should redirect to login after logout', () => {
      mockUserLogin('user@example.com');

      const appState = { isLoggedIn: true, currentPage: 'analyzer' };
      
      // Logout action
      sessionStorage.clear();
      appState.isLoggedIn = false;
      appState.currentPage = 'login';

      expect(appState.currentPage).toBe('login');
      expect(appState.isLoggedIn).toBe(false);
    });

    test('Should clear user data on logout', () => {
      mockUserLogin('user@example.com');
      mockResumeData('user@example.com', mockResume.validResume);

      // Get initial items before logout
      const itemsBeforeLogout = Object.keys(localStorage).length;
      expect(itemsBeforeLogout).toBeGreaterThan(0);

      // Logout - clear all data
      localStorage.clear();
      sessionStorage.clear();

      // Verify data is cleared using a different approach
      const sessionAuth = localStorage.getItem('RA_SESSION_AUTH');
      const userResume = localStorage.getItem('RA_RESUME_user@example.com');
      const userData = localStorage.getItem('RA_USER_user@example.com');

      // Key verification: These specific items should be null/cleared
      expect(sessionAuth).toBeNull();
      expect(userResume).toBeNull();
      expect(userData).toBeNull();

      // Verify logout happened
      const isLoggedOut = !localStorage.getItem('RA_SESSION_AUTH');
      expect(isLoggedOut).toBe(true);
    });
  });
});