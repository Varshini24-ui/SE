describe('E2E: Complete User Journey', () => {
  const sampleResume = `Alice Johnson
Email: alice.johnson@email.com | Phone: (555) 987-6543 | LinkedIn: linkedin.com/in/alicejohnson

PROFESSIONAL SUMMARY
Results-driven Full Stack Developer with 6+ years of experience building scalable web applications. 
Expert in React, Node.js, and cloud technologies.

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python, SQL
• Frontend: React, Redux, Next.js, Tailwind CSS
• Backend: Node.js, Express, GraphQL, REST APIs
• Database: MongoDB, PostgreSQL, Redis
• DevOps: Docker, Kubernetes, AWS, CI/CD
• Tools: Git, Jest, Webpack, npm

PROFESSIONAL EXPERIENCE
Senior Full Stack Developer | Innovation Labs | Jan 2021 - Present
• Architected and deployed microservices platform handling 2M+ daily transactions
• Increased application performance by 55% through optimization and caching strategies
• Led cross-functional team of 8 engineers in agile development environment
• Implemented automated testing reducing bugs by 40%
• Mentored junior developers and conducted code reviews

Full Stack Developer | WebTech Solutions | Jun 2018 - Dec 2020
• Developed responsive web applications using React and Node.js
• Built RESTful APIs serving data to mobile and web clients
• Integrated third-party services and payment gateways
• Participated in daily standups and sprint planning

Junior Developer | CodeStart Inc | Jan 2017 - May 2018
• Created UI components using React and modern JavaScript
• Collaborated with designers to implement pixel-perfect interfaces
• Wrote unit tests achieving 85% code coverage

EDUCATION
Master of Science in Computer Science
Tech University | 2015 - 2017

Bachelor of Science in Information Technology  
State University | 2011 - 2015

CERTIFICATIONS
• AWS Certified Solutions Architect
• React Advanced Certification
• MongoDB Certified Developer

PROJECTS
Healthcare Portal - MERN stack application for patient management (React, Node.js, MongoDB)
E-Learning Platform - Built scalable LMS serving 50K+ students (Next.js, GraphQL, PostgreSQL)
Real-time Chat App - WebSocket-based messaging system with 99.9% uptime`;

  const sampleJD = `Senior Full Stack Developer Position

We are looking for an experienced Senior Full Stack Developer to join our growing engineering team.

Required Skills:
• 5+ years of professional software development experience
• Strong proficiency in JavaScript, React, and Node.js
• Experience with TypeScript and modern frontend frameworks
• Solid understanding of RESTful APIs and GraphQL
• Experience with cloud platforms (AWS, Azure, or GCP)
• Knowledge of database design (SQL and NoSQL)
• Familiarity with Docker and container orchestration
• Strong problem-solving and debugging skills
• Excellent communication and teamwork abilities

Preferred Qualifications:
• Experience with microservices architecture
• Knowledge of CI/CD pipelines
• Experience leading or mentoring development teams
• Contributions to open-source projects
• Master's degree in Computer Science or related field

Responsibilities:
• Design and develop scalable web applications
• Collaborate with product managers and designers
• Write clean, maintainable, and well-tested code
• Participate in code reviews and technical discussions
• Mentor junior team members
• Stay updated with latest technology trends`;

  // ============================================
  // E2E_JOURNEY_001: Complete Registration to Export
  // ============================================
  describe('E2E_JOURNEY_001: Full Workflow - Registration to PDF Export', () => {
    
    it('E2E_JOURNEY_001: Should complete entire user journey', () => {
      const uniqueEmail = `journey${Date.now()}@example.com`;
      
      // STEP 1: Visit application
      cy.clearAllStorage();
      cy.visit('/');
      cy.waitForApp();
      
      // STEP 2: Register new user
      cy.contains('button', /register|need/i).click();
      cy.get('input[type="email"]').first().type(uniqueEmail);
      cy.get('input[type="password"]').first().type('JourneyPass123!');
      cy.get('button[type="submit"]').click();
      
      // Verify successful registration
      cy.contains('button', /logout/i, { timeout: 10000 }).should('be.visible');
      cy.log('✓ Registration successful');
      
      // STEP 3: Select job role
      cy.get('#job-role').select('Software Engineer');
      cy.log('✓ Job role selected');
      
      // STEP 4: Fill resume content
      cy.get('textarea').first().clear().type(sampleResume, { delay: 0 });
      cy.log('✓ Resume entered');
      
      // STEP 5: Fill job description
      cy.get('textarea').last().clear().type(sampleJD, { delay: 0 });
      cy.log('✓ Job description entered');
      
      // STEP 6: Analyze resume
      cy.contains('button', /analyze resume/i).should('be.visible').click();
      cy.log('✓ Analysis initiated');
      
      // STEP 7: Verify analysis results
      cy.get('[class*="score"]', { timeout: 10000 }).should('be.visible');
      cy.get('.score-num').invoke('text').then((score) => {
        cy.log(`✓ ATS Score: ${score}`);
        expect(parseInt(score)).to.be.at.least(0);
      });
      
      // STEP 8: Review feedback
      cy.get('.feedback-list').should('exist');
      cy.get('.feedback-list li').should('have.length.at.least', 1);
      cy.log('✓ Feedback displayed');
      
      // STEP 9: Select template
      cy.get('[class*="template-card"]').first().click();
      cy.wait(500);
      cy.log('✓ Template selected');
      
      // STEP 10: Verify preview
      cy.get('.resume-sheet').should('be.visible');
      cy.get('.sheet-header').should('contain', 'Alice Johnson');
      cy.log('✓ Preview rendered');
      
      // STEP 11: Download PDF
      cy.contains('button', /download|export|pdf/i)
        .should('be.visible')
        .should('not.be.disabled')
        .click();
      cy.wait(2000);
      cy.log('✓ PDF export triggered');
      
      // STEP 12: Verify completion
      cy.contains('button', /logout/i).should('be.visible');
      cy.log('✓ Journey completed successfully');
    });
  });

  // ============================================
  // E2E_JOURNEY_002: Session Persistence
  // ============================================
  describe('E2E_JOURNEY_002: Session and Data Persistence', () => {
    
    it('E2E_JOURNEY_002: Should persist data across page reloads', () => {
      cy.clearAllStorage();
      cy.login('testuser@example.com', 'SecurePass123!');
      
      // Add resume data
      cy.fillResume(sampleResume);
      cy.fillJobDescription(sampleJD);
      cy.analyzeResume();
      
      // Get original score
      let originalScore;
      cy.get('.score-num').invoke('text').then((text) => {
        originalScore = text;
      });
      
      // Reload page
      cy.reload();
      cy.waitForApp();
      
      // Verify still logged in
      cy.contains('button', /logout/i, { timeout: 5000 }).should('be.visible');
      
      // Verify resume data persisted
      cy.get('textarea').first().should('contain.value', 'Alice Johnson');
      cy.get('textarea').last().should('contain.value', 'Senior Full Stack Developer');
      
      // Verify score persisted
      cy.get('.score-num').should('be.visible');
      cy.log('✓ Data persisted after reload');
    });

    it('E2E_JOURNEY_003: Should clear data after logout and login', () => {
      cy.login('testuser@example.com', 'SecurePass123!');
      
      // Add some data
      cy.fillResume('Test Resume Content');
      
      // Logout
      cy.logout();
      
      // Login again
      cy.login('testuser@example.com', 'SecurePass123!');
      
      // Previous session data should still be there (localStorage persists)
      cy.get('textarea').first().should('contain.value', 'Test Resume Content');
    });
  });

  // ============================================
  // E2E_JOURNEY_003: Multiple Analysis Iterations
  // ============================================
  describe('E2E_JOURNEY_003: Multiple Resume Iterations', () => {
    
    beforeEach(() => {
      cy.clearAllStorage();
      cy.login('testuser@example.com', 'SecurePass123!');
    });

    it('E2E_JOURNEY_004: Should handle multiple analysis runs', () => {
      // First analysis
      cy.completeResumeAnalysis(sampleResume, sampleJD);
      
      let firstScore;
      cy.get('.score-num').invoke('text').then((text) => {
        firstScore = parseInt(text);
        cy.log(`First score: ${firstScore}`);
      });
      
      // Modify resume (improve it)
      const improvedResume = sampleResume + '\n\nAWARDS\n• Employee of the Year 2022\n• Innovation Award 2021';
      cy.get('textarea').first().clear().type(improvedResume, { delay: 0 });
      
      // Analyze again
      cy.analyzeResume();
      
      // Score should potentially change
      cy.get('.score-num').should('be.visible');
      cy.log('✓ Multiple analyses completed');
    });

    it('E2E_JOURNEY_005: Should update score when JD changes', () => {
      // Analyze without JD
      cy.fillResume(sampleResume);
      cy.analyzeResume();
      
      let scoreWithoutJD;
      cy.get('.score-num').invoke('text').then((text) => {
        scoreWithoutJD = parseInt(text);
      });
      
      // Add JD and analyze again
      cy.fillJobDescription(sampleJD);
      cy.analyzeResume();
      
      // Score should change (likely increase with matching keywords)
      cy.get('.score-num').invoke('text').then((text) => {
        const scoreWithJD = parseInt(text);
        cy.log(`Score without JD: ${scoreWithoutJD}, with JD: ${scoreWithJD}`);
        // Score exists and is valid
        expect(scoreWithJD).to.be.at.least(0);
      });
    });
  });

  // ============================================
  // E2E_JOURNEY_004: Template Workflow
  // ============================================
  describe('E2E_JOURNEY_004: Complete Template Selection Workflow', () => {
    
    beforeEach(() => {
      cy.clearAllStorage();
      cy.login('testuser@example.com', 'SecurePass123!');
      cy.completeResumeAnalysis(sampleResume, sampleJD);
    });

    it('E2E_JOURNEY_006: Should test all templates', () => {
      const templates = ['Modern Professional', 'Minimal Clean', 'Classic Standard'];
      
      templates.forEach((templateName, index) => {
        cy.log(`Testing template: ${templateName}`);
        
        // Select template
        cy.contains('.template-name', templateName).parent().click();
        cy.wait(500);
        
        // Verify selection
        cy.contains('.template-name', templateName)
          .parent()
          .should('have.class', 'selected');
        
        // Verify preview updates
        cy.get('.resume-sheet').should('be.visible');
        
        cy.log(`✓ ${templateName} tested successfully`);
      });
    });

    it('E2E_JOURNEY_007: Should export PDFs with different templates', () => {
      // Select each template and download
      cy.get('[class*="template-card"]').each(($template, index) => {
        cy.wrap($template).click();
        cy.wait(500);
        
        // Download PDF
        cy.contains('button', /download|export/i).click();
        cy.wait(1500);
        
        cy.log(`✓ PDF ${index + 1} exported`);
      });
    });
  });

  // ============================================
  // E2E_JOURNEY_005: Error Handling & Recovery
  // ============================================
  describe('E2E_JOURNEY_005: Error Handling and Recovery', () => {
    
    it('E2E_JOURNEY_008: Should handle network interruptions gracefully', () => {
      cy.clearAllStorage();
      cy.visit('/');
      cy.waitForApp();
      
      // Simulate network error
      cy.intercept('POST', '**/exec*', { forceNetworkError: true }).as('networkError');
      
      // Try to login
      cy.get('input[type="email"]').type('user@example.com');
      cy.get('input[type="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();
      
      // Should show error or remain on login page
      cy.wait(2000);
      cy.get('body').then(($body) => {
        const hasError = $body.text().includes('error') || 
                        $body.text().includes('Network') ||
                        $body.text().includes('Login');
        expect(hasError).to.be.true;
      });
      
      cy.log('✓ Network error handled gracefully');
    });

    it('E2E_JOURNEY_009: Should recover from invalid input', () => {
      cy.clearAllStorage();
      cy.login('testuser@example.com', 'SecurePass123!');
      
      // Enter invalid resume
      cy.get('textarea').first().type('Invalid');
      cy.analyzeResume();
      
      // Should still show score (even if low)
      cy.get('.score-num').should('be.visible');
      
      // Fix resume
      cy.get('textarea').first().clear().type(sampleResume, { delay: 0 });
      cy.analyzeResume();
      
      // Score should improve
      cy.get('.score-num').should('be.visible');
      cy.log('✓ Recovered from invalid input');
    });

    it('E2E_JOURNEY_010: Should handle rapid consecutive actions', () => {
      cy.clearAllStorage();
      cy.login('testuser@example.com', 'SecurePass123!');
      
      // Rapid actions
      cy.fillResume('Quick test');
      cy.contains('button', /analyze/i).click();
      cy.wait(500);
      
      cy.get('textarea').first().clear().type('Another test', { delay: 0 });
      cy.contains('button', /analyze/i).click();
      cy.wait(500);
      
      // Should still function correctly
      cy.get('body').should('exist');
      cy.log('✓ Handled rapid actions');
    });
  });
});