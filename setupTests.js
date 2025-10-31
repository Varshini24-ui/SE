import '@testing-library/jest-dom';

// ===============================================
// MOCK STORAGE
// ===============================================

global.store = {};

const localStorageMock = {
  getItem: jest.fn((key) => {
    return global.store[key] || null;
  }),
  setItem: jest.fn((key, value) => {
    global.store[key] = String(value);
  }),
  removeItem: jest.fn((key) => {
    delete global.store[key];
  }),
  clear: jest.fn(() => {
    global.store = {};
  }),
};

const sessionStorageMock = {
  getItem: jest.fn((key) => {
    return global.store[`session_${key}`] || null;
  }),
  setItem: jest.fn((key, value) => {
    global.store[`session_${key}`] = String(value);
  }),
  removeItem: jest.fn((key) => {
    delete global.store[`session_${key}`];
  }),
  clear: jest.fn(() => {
    Object.keys(global.store).forEach(key => {
      if (key.startsWith('session_')) {
        delete global.store[key];
      }
    });
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// ===============================================
// MOCK FETCH API
// ===============================================

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ status: 'success' }),
    text: () => Promise.resolve(''),
  })
);

// ===============================================
// MOCK URL
// ===============================================

global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-uuid');
global.URL.revokeObjectURL = jest.fn();

// ===============================================
// CLEAR AFTER EACH TEST
// ===============================================

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  global.store = {};
});