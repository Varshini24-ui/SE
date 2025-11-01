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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

export default localStorageMock;