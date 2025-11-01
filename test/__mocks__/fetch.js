global.fetch = jest.fn((url, options = {}) => {
  // Mock successful API response
  if (url.includes('gemini') || url.includes('generativelanguage')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        candidates: [
          {
            content: {
              parts: [{ text: 'Mock AI response for testing' }],
            },
          },
        ],
      }),
    });
  }

  // Mock Google Apps Script response (Auth)
  if (url.includes('script.google.com')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        status: 'success',
        message: 'User authenticated',
      }),
    });
  }

  // Default mock response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: 'mock data' }),
  });
});

export default global.fetch;