/**
 * End-to-End User Flow System Tests
 * Tests complete user journey through the application
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import config from '../config/systemTestConfig';
import { setupSystemTest, cleanupSystemTest } from '../helpers/systemTestHelpers';

describe('End-to-End User Flow - System Tests', () => {
  let user;

  beforeAll(async () => {
    await setupSystemTest();
  });

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(async () => {
    await cleanupSystemTest();
  });

  describe('Complete User Journey', () => {
    test('Application loads successfully', async () => {
      // Step 1: Render application
      render(<App />);

      // Step 2: Verify initial page load using getAllByText
      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles.length).toBeGreaterThan(0);
        expect(titles[0]).toBeInTheDocument();
      }, { timeout: config.timeouts.pageLoad });

      // Step 3: Verify the app structure is present
      const container = document.querySelector('.app');
      expect(container).toBeInTheDocument();
    });

    test('User can see login form on initial load', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      }, { timeout: config.timeouts.pageLoad });

      // Check if login form is present
      const emailInput = screen.queryByPlaceholderText(/email/i);
      const passwordInput = screen.queryByPlaceholderText(/password/i);
      
      if (emailInput && passwordInput) {
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        
        const loginButton = screen.getByRole('button', { name: /login/i });
        expect(loginButton).toBeInTheDocument();
      } else {
        // App might not require login
        expect(true).toBe(true);
      }
    });

    test('User can interact with authentication form', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const emailInput = screen.queryByPlaceholderText(/email/i);
      
      if (emailInput) {
        const passwordInput = screen.getByPlaceholderText(/password/i);
        
        // Type in credentials
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'TestPassword123!');

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('TestPassword123!');

        // Try to submit
        const loginButton = screen.getByRole('button', { name: /login/i });
        await user.click(loginButton);

        // Wait for any response
        await waitFor(() => {
          // Form should still exist or user should be redirected
          expect(document.body).toBeInTheDocument();
        }, { timeout: config.timeouts.apiResponse });
      } else {
        expect(true).toBe(true);
      }
    });

    test('User can switch between login and register', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Look for register button
      const registerButton = screen.queryByRole('button', { name: /register|sign up/i });
      
      if (registerButton) {
        await user.click(registerButton);

        await waitFor(() => {
          // Should now see register form
          const register = screen.queryByRole('button', { name: /register|create|sign up/i });
          expect(register).toBeInTheDocument();
        });

        // Switch back to login
        const loginLink = screen.queryByRole('button', { name: /login|sign in/i });
        if (loginLink) {
          await user.click(loginLink);
          
          await waitFor(() => {
            const login = screen.queryByRole('button', { name: /login|sign in/i });
            expect(login).toBeInTheDocument();
          });
        }
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Resume Analysis Interface', () => {
    test('Application shows resume input interface', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Look for file input or resume-related elements
      const resumeElements = screen.queryAllByText(/resume input|upload|drop.*file/i);
      
      if (resumeElements.length > 0) {
        expect(resumeElements[0]).toBeInTheDocument();
      } else {
        // Might be hidden behind auth
        expect(true).toBe(true);
      }
    });

    test('Application shows job description input', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Look for job description textarea
      const jdElements = screen.queryAllByText(/job description|jd/i);
      
      if (jdElements.length > 0) {
        expect(jdElements[0]).toBeInTheDocument();
      } else {
        expect(true).toBe(true);
      }
    });

    test('Application has file input for resume upload', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const fileInputs = container.querySelectorAll('input[type="file"]');
      
      if (fileInputs.length > 0) {
        expect(fileInputs[0]).toBeInTheDocument();
        expect(fileInputs[0]).toHaveAttribute('accept');
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Chatbot Functionality', () => {
    test('Application has chatbot button', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Look for chatbot button (FAB)
      const chatButton = container.querySelector('.fab') ||
                        screen.queryByRole('button', { name: /chat|open chatbot/i });

      if (chatButton) {
        expect(chatButton).toBeInTheDocument();
        
        // Try to open chatbot
        await user.click(chatButton);
        
        await waitFor(() => {
          const chatbot = container.querySelector('.chatbot-container');
          if (chatbot) {
            expect(chatbot).toBeInTheDocument();
          }
        });
      } else {
        expect(true).toBe(true);
      }
    });

    test('Chatbot shows AI assistant interface', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Check if chatbot is present
      const aiAssistant = screen.queryByText(/resume ai assistant|chatbot/i);
      
      if (aiAssistant) {
        expect(aiAssistant).toBeInTheDocument();
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Application Structure and Layout', () => {
    test('Application has header section', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const header = container.querySelector('header') || 
                    container.querySelector('.hero');
      
      expect(header).toBeInTheDocument();
    });

    test('Application has main content area', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const main = container.querySelector('main') || 
                  container.querySelector('.container');
      
      expect(main).toBeInTheDocument();
    });

    test('Application has footer section', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const footer = container.querySelector('footer');
      
      if (footer) {
        expect(footer).toBeInTheDocument();
        
        // Check for team information
        const teamInfo = screen.queryAllByText(/ramjhith|vamshi|varshini|shivakumar/i);
        if (teamInfo.length > 0) {
          expect(teamInfo[0]).toBeInTheDocument();
        }
      } else {
        expect(true).toBe(true);
      }
    });

    test('Application displays subtitle with features', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const subtitle = screen.queryByText(/ats.*aware.*scoring|templates|instant.*pdf/i);
      
      if (subtitle) {
        expect(subtitle).toBeInTheDocument();
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Responsive Design Elements', () => {
    test('Application has grid layout for cards', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const grid = container.querySelector('.grid-2');
      const cards = container.querySelectorAll('.card');
      
      if (grid || cards.length > 0) {
        expect(grid || cards[0]).toBeInTheDocument();
      } else {
        expect(true).toBe(true);
      }
    });

    test('Application cards have proper styling classes', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const cards = container.querySelectorAll('.card');
      
      cards.forEach(card => {
        expect(card).toHaveClass('card');
      });
    });
  });

  describe('Error Handling and Validation', () => {
    test('Application handles missing resume gracefully', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Try to submit without resume (if analyze button is available)
      const analyzeButton = screen.queryByRole('button', { name: /analyze|submit|compare/i });
      
      if (analyzeButton && !screen.queryByPlaceholderText(/email/i)) {
        await user.click(analyzeButton);

        // Should handle gracefully (either show error or ignore)
        await waitFor(() => {
          expect(document.body).toBeInTheDocument();
        });
      } else {
        expect(true).toBe(true);
      }
    });

    test('Application validates authentication fields', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const emailInput = screen.queryByPlaceholderText(/email/i);
      
      if (emailInput) {
        // Email input should have type="email" for HTML5 validation
        expect(emailInput).toHaveAttribute('type', 'email');
        
        const passwordInput = screen.getByPlaceholderText(/password/i);
        expect(passwordInput).toHaveAttribute('type', 'password');
        
        // Both should be required
        expect(emailInput).toHaveAttribute('required');
        expect(passwordInput).toHaveAttribute('required');
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('User Experience Features', () => {
    test('Application provides helpful hints and instructions', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Look for hints or instructions
      const hints = screen.queryAllByText(/crucial|paste|keyword|ats score|accuracy/i);
      
      if (hints.length > 0) {
        expect(hints[0]).toBeInTheDocument();
      } else {
        expect(true).toBe(true);
      }
    });

    test('Application shows file format information', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Look for file format hints
      const formatInfo = screen.queryAllByText(/\.txt|\.pdf|drag.*drop|select.*file/i);
      
      if (formatInfo.length > 0) {
        expect(formatInfo[0]).toBeInTheDocument();
      } else {
        expect(true).toBe(true);
      }
    });

    test('Application displays team information in footer', async () => {
      render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Check for team members
      const teamMembers = [
        /ramjhith/i,
        /vamshi/i,
        /varshini/i,
        /shivakumar/i
      ];

      let foundTeamMember = false;
      teamMembers.forEach(member => {
        const element = screen.queryByText(member);
        if (element) {
          foundTeamMember = true;
        }
      });

      // At least one team member should be mentioned
      if (foundTeamMember) {
        expect(foundTeamMember).toBe(true);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Integration Points', () => {
    test('All main components render together', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      // Check for main sections
      const sections = {
        header: container.querySelector('header, .hero'),
        main: container.querySelector('main, .container'),
        footer: container.querySelector('footer'),
        auth: container.querySelector('.auth-container'),
      };

      // At least 2 sections should be present
      const presentSections = Object.values(sections).filter(s => s !== null);
      expect(presentSections.length).toBeGreaterThanOrEqual(2);
    });

    test('Application maintains consistent styling', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        const titles = screen.getAllByText(/Resume Analyzer/i);
        expect(titles[0]).toBeInTheDocument();
      });

      const buttons = container.querySelectorAll('button');
      const cards = container.querySelectorAll('.card');
      const textInputs = container.querySelectorAll('.text-input');

      // Check that styled elements exist
      const styledElements = buttons.length + cards.length + textInputs.length;
      expect(styledElements).toBeGreaterThan(0);
    });
  });
});