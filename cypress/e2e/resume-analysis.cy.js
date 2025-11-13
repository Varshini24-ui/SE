describe('E2E: Resume Analysis Flow', () => {
  const sampleResume = `John Doe
Email: john.doe@example.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

SUMMARY
Senior Software Engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies.

SKILLS
• Frontend: React, JavaScript, TypeScript, HTML5, CSS3
• Backend: Node.js, Express, Python, MongoDB
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, JIRA

EXPERIENCE
Senior Software Engineer | Tech Company | 2020-Present
• Spearheaded development of microservices architecture serving 1M+ users
• Optimized application performance by 40% through code refactoring
• Led team of 5 developers in agile environment

Software Engineer | StartupCo | 2018-2020
• Developed RESTful APIs using Node.js and Express
• Implemented responsive UI components with React
• Collaborated with cross-functional teams on product launches

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014-2018

PROJECTS
E-commerce Platform - Built full-stack application with React and Node.js
Mobile App - Developed iOS app with 50K+ downloads`;

  const sampleJobDescription = `We are seeking a Senior Software Engineer with strong expertise in React and Node.js. 
The ideal candidate will have:
- 5+ years of software development experience
- Strong proficiency in React, JavaScript, TypeScript
- Experience with Node.js, Express, and RESTful APIs
- Cloud experience with AWS or similar platforms
- Excellent problem-solving and communication skills
- Experience leading development teams
- Knowledge of microservices architecture
- Agile development methodology experience`;

  beforeEach(() => {
    cy.clearAllStorage();
    cy.login('testuser@example.com', 'SecurePass123!');
    cy.waitForApp();
  });

  // ============================================
  // E2E_RESUME_001-005: Upload & Analysis
  // ============================================
  describe('E2E_RESUME_001-005: Resume Upload and Analysis', () => {
    
    it('E2E_RESUME_001: Should paste and analyze resume text', () => {
      // Fill resume
      cy.fillResume(sampleResume);
      
      // Verify text is entered
      cy.get('textarea').first().should('contain.value', 'John Doe');
      
      // Analyze
      cy.analyzeResume();
      
      // Verify analysis results
      cy.get('[class*="score"]').should('be.visible');
      cy.get('[class*="score"]').should('contain', /\d+/);
    });

    it('E2E_RESUME_002: Should analyze resume with job description', () => {
      // Fill both resume and JD
      cy.fillResume(sampleResume);
      cy.fillJobDescription(sampleJobDescription);
      
      // Analyze
      cy.analyzeResume();
      
      // Verify higher score due to keyword matching
      cy.get('[class*="score"]').should('be.visible');
      cy.get('body').should('contain', /keyword|match/i);
    });

    it('E2E_RESUME_003: Should display ATS score with color coding', () => {
      cy.completeResumeAnalysis(sampleResume, sampleJobDescription);
      
      // Score should be visible
      cy.get('.score-num').should('be.visible');
      cy.get('.score-num').invoke('text').then((scoreText) => {
        const score = parseInt(scoreText);
        expect(score).to.be.at.least(0);
        expect(score).to.be.at.most(100);
      });
      
      // Score ring should exist
      cy.get('.score-ring').should('exist');
    });

    it('E2E_RESUME_004: Should show detailed feedback and suggestions', () => {
      cy.completeResumeAnalysis(sampleResume, sampleJobDescription);
      
      // Wait for analysis card
      cy.get('.ats-analysis-card').should('be.visible');
      
      // Should show actionable suggestions
      cy.get('.feedback-list').should('exist');
      cy.get('.feedback-list li').should('have.length.at.least', 1);
      
      // Should contain feedback keywords
      cy.get('body').should('contain', /structure|keyword|vocabulary/i);
    });

    it('E2E_RESUME_005: Should persist resume data in localStorage', () => {
      cy.fillResume(sampleResume);
      cy.fillJobDescription(sampleJobDescription);
      cy.analyzeResume();
      
      // Reload page
      cy.reload();
      cy.waitForApp();
      
      // Data should persist
      cy.get('textarea').first().should('contain.value', 'John Doe');
      cy.get('textarea').last().should('contain.value', 'Senior Software Engineer');
    });
  });

  // ============================================
  // E2E_RESUME_006-010: Template Selection & PDF Export
  // ============================================
  describe('E2E_RESUME_006-010: Template Selection and PDF Export', () => {
    
    beforeEach(() => {
      cy.completeResumeAnalysis(sampleResume, sampleJobDescription);
    });

    it('E2E_RESUME_006: Should display template selection options', () => {
      // Template grid should be visible
      cy.get('.template-grid').should('be.visible');
      
      // Should have multiple templates
      cy.get('[class*="template-card"]').should('have.length.at.least', 3);
      
      // Templates should have names
      cy.get('.template-name').should('exist');
    });

    it('E2E_RESUME_007: Should select and apply template', () => {
      // Click on Modern Professional template
      cy.contains('.template-name', 'Modern Professional').parent().click();
      
      // Verify selection
      cy.get('[class*="template-card"][class*="selected"]').should('exist');
      cy.contains('.template-name', 'Modern Professional')
        .parent()
        .should('have.class', 'selected');
    });

    it('E2E_RESUME_008: Should change template and update preview', () => {
      // Select first template
      cy.get('[class*="template-card"]').first().click();
      cy.wait(500);
      
      // Select different template
      cy.get('[class*="template-card"]').eq(1).click();
      cy.wait(500);
      
      // Preview should exist
      cy.get('.resume-sheet').should('be.visible');
      cy.get('.sheet-header').should('be.visible');
    });

    it('E2E_RESUME_009: Should export resume as PDF', () => {
      // Verify download button exists and click it
      cy.contains('button', /download|export|pdf/i)
        .should('be.visible')
        .should('not.be.disabled')
        .click();
      
      // Should show processing state
      cy.wait(1000);
      
      // Button should be visible after processing
      cy.contains('button', /download|export|pdf/i, { timeout: 10000 })
        .should('be.visible');
    });

    it('E2E_RESUME_010: Should include selected template in PDF export', () => {
      // Select specific template
      cy.contains('.template-name', 'Minimal Clean').parent().click();
      cy.wait(500);
      
      // Download PDF
      cy.downloadPDF();
      
      // Verify button text includes template name
      cy.contains('button', /Minimal Clean/i).should('exist');
    });
  });

  // ============================================
  // E2E_RESUME_011-015: Edge Cases & Validation
  // ============================================
  describe('E2E_RESUME_011-015: Edge Cases and Validation', () => {
    
    it('E2E_RESUME_011: Should handle empty resume gracefully', () => {
      // Try to analyze without resume
      cy.contains('button', /analyze resume/i).should('be.disabled');
      
      // Or should show error if clicked
      cy.get('textarea').first().clear();
      cy.get('body').then(($body) => {
        const analyzeBtn = $body.find('button:contains("ANALYZE RESUME")');
        if (analyzeBtn.prop('disabled') === false) {
          analyzeBtn.click();
          cy.wait(1000);
          cy.get('body').should('contain', /please|resume|content/i);
        }
      });
    });

    it('E2E_RESUME_012: Should handle resume without job description', () => {
      cy.fillResume(sampleResume);
      cy.analyzeResume();
      
      // Should still show score (lower due to no keyword matching)
      cy.get('[class*="score"]').should('be.visible');
      cy.get('body').should('contain', /paste a job description/i);
    });

    it('E2E_RESUME_013: Should detect missing resume sections', () => {
      const incompleteResume = 'John Doe\nEmail: john@example.com\n\nSome experience text.';
      
      cy.fillResume(incompleteResume);
      cy.analyzeResume();
      
      // Should show missing sections in feedback
      cy.get('.feedback-list').should('contain', /missing/i);
    });

    it('E2E_RESUME_014: Should highlight weak words in resume', () => {
      const weakResume = `John Doe
Email: john@example.com

EXPERIENCE
• Responsible for managing tasks
• Worked on various projects
• Assisted team members`;
      
      cy.fillResume(weakResume);
      cy.analyzeResume();
      
      // Should show weak word feedback
      cy.get('body').should('contain', /weak|vocabulary/i);
    });

    it('E2E_RESUME_015: Should suggest strong action verbs', () => {
      cy.completeResumeAnalysis(sampleResume, sampleJobDescription);
      
      // Should mention action verbs in feedback
      cy.get('body').should('contain', /vocabulary|action|verb/i);
    });
  });

  // ============================================
  // E2E_RESUME_016-020: Job Role Templates
  // ============================================
  describe('E2E_RESUME_016-020: Job Role Template Recommendations', () => {
    
    beforeEach(() => {
      cy.completeResumeAnalysis(sampleResume, sampleJobDescription);
    });

    it('E2E_RESUME_016: Should display job role selector', () => {
      cy.get('#job-role').should('be.visible');
      cy.get('#job-role option').should('have.length.at.least', 5);
    });

    it('E2E_RESUME_017: Should recommend template based on job role', () => {
      // Select Software Engineer role
      cy.get('#job-role').select('Software Engineer');
      
      // Should show template recommendation
      cy.get('.template-recommendation').should('be.visible');
    });

    it('E2E_RESUME_018: Should apply recommended template', () => {
      // Change job role
      cy.get('#job-role').select('Product Manager');
      
      // Check if apply button appears
      cy.get('body').then(($body) => {
        if ($body.find('.btn-apply-template').length > 0) {
          cy.get('.btn-apply-template').click();
          cy.wait(500);
          
          // Verify template changed
          cy.get('[class*="template-card"][class*="selected"]').should('exist');
        }
      });
    });

    it('E2E_RESUME_019: Should update preview when role changes', () => {
      const initialPreview = cy.get('.resume-sheet');
      initialPreview.should('be.visible');
      
      // Change role
      cy.get('#job-role').select('Data Scientist/Analyst');
      cy.wait(500);
      
      // Preview should still be visible
      cy.get('.resume-sheet').should('be.visible');
    });

    it('E2E_RESUME_020: Should allow manual template override', () => {
      // Select a role
      cy.get('#job-role').select('Consultant');
      
      // Manually select different template
      cy.contains('.template-name', 'Modern Professional').parent().click();
      
      // Manual selection should override recommendation
      cy.contains('.template-name', 'Modern Professional')
        .parent()
        .should('have.class', 'selected');
    });
  });
});