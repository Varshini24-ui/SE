The provided files implement a React application called **Dynamic Resume Analyzer**, which is a comprehensive tool designed to help users optimize their resumes for Applicant Tracking Systems (ATS).

Here is a GitHub README file for the project:

# 🚀 Dynamic Resume Analyzer

## ATS-Aware Scoring • Templates • Instant PDF

The **Dynamic Resume Analyzer** is a modern web application built with React that helps job seekers tailor their resumes to specific job descriptions to maximize their chances of passing Applicant Tracking Systems (ATS) filters. It provides an ATS compatibility score, detailed, actionable feedback, and a live resume preview with multiple professional templates, including PDF export functionality.

-----

## ✨ Features

  * **ATS Compatibility Score:** Generates a score (out of 100%) based on three weighted factors: **Structure** (40%), **Keyword Match** (30%), and **Formatting/Vocabulary** (30%).
  * **Job Description (JD) Keyword Matching:** Extracts keywords from the pasted Job Description and compares them to the resume content, providing a list of missing critical terms.
  * **Actionable Feedback:** Provides specific suggestions to improve structure, integrate missing keywords, and replace "weak verbs" with **Strong Action Verbs** (e.g., *Spearheaded, Optimized, Engineered*).
  * **Live Resume Preview & Templates:** Displays a live, formatted preview of the resume text using selectable, professional templates (**Modern, Minimal, Classic**).
  * **Role-Based Template Recommendation:** Suggests the best template (e.g., Minimal for Software Engineer, Modern for Product Manager) based on the user's selected job role.
  * **Instant PDF Download:** Allows users to download a high-quality, formatted PDF of their resume based on the selected template.
  * **AI Chatbot Assistant:** A companion chatbot powered by **Gemini API** (using `gemini-2.5-flash`) to provide short, expert advice on ATS best practices, social media profile optimization (LinkedIn, X, Reddit), and basic Git/GitHub for career development.
  * **Secure (Mock) Authentication:** Features a login/register system with client-side SHA-256 password hashing (simulated) and a session management system.

-----

## 🛠️ Technology Stack

  * **Frontend:** React, HTML5, CSS3
  * **Core Libraries:**
      * `jspdf` & `html2canvas` (for client-side PDF generation)
      * Native `fetch` (for API calls)
  * **AI Model:** Google Gemini API (`gemini-2.5-flash`)
  * **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
  * **Data Persistence:** `localStorage` (Simulated secure storage for resume data with a 5-day expiry policy)

-----

## 💡 Core ATS Scoring Logic

The `calculateATSScore` function in `ResumeAnalyzer.js` uses a weighted scoring model:

1.  **Structure Score (`WEIGHT_STRUCTURE = 40`):**
      * Checks for the presence of **6 core sections**: `contact`, `summary`, `experience`, `skills`, `education`, and `projects`.
      * $Score = \frac{\text{Found Core Sections}}{6} \times 40$
2.  **Keyword Score (`WEIGHT_KEYWORDS = 30`):**
      * Compares extracted, filtered keywords from the JD against the resume text.
      * $Score = \frac{\text{Matched Keywords}}{\text{Total JD Keywords}} \times 30$
3.  **Formatting/Vocabulary Score (`WEIGHT_FORMATTING = 30`):**
      * Penalizes the score for using "weak verbs" (e.g., *responsible for, managed, worked on*).
      * $Penalty = \text{min}\left(15, \left\lfloor\frac{\text{Weak Word Count}}{3}\right\rfloor \times 5\right)$
      * $Score = \text{max}(0, 30 - Penalty)$

**Final ATS Score:** $\text{Structure Score} + \text{Keyword Score} + \text{Formatting Score}$

-----

## ⚙️ Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone [YOUR_REPO_URL]
    cd dynamic-resume-analyzer
    ```

2.  **Install dependencies:**
    This is a basic React project, so install with your preferred package manager (assuming you have a standard `package.json` for a React app):

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure API Key:**
    The AI Chatbot requires a Gemini API Key.

      * Get a key from Google AI Studio.
      * In **`Chatbot.js`**, replace the placeholder in the `GEMINI_API_KEY` constant:

    <!-- end list -->

    ```javascript
    // Chatbot.js
    const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; // <-- REPLACE THIS
    ```

4.  **Run the application:**

    ```bash
    npm start
    # or
    yarn start
    ```

The application will open in your browser at `http://localhost:3000` (or similar).

-----

## 📝 Usage

1.  **Login/Register:** Use the mock authentication system to create an account and log in.
2.  **Select Role:** Choose your target job role (e.g., Software Engineer).
3.  **Input Resume:** Paste your resume content into the left textarea or upload a `.txt` file.
4.  **Input JD:** Paste the target Job Description into the right textarea.
5.  **Analyze:** Click the **`✨ ANALYZE RESUME & GENERATE SCORE`** button.
6.  **Review Feedback:** Check the ATS Analysis card for your score, missing keywords, and actionable suggestions.
7.  **Customize:** Select a template and click **`⬇️ Download... as PDF`** to export your final resume.
