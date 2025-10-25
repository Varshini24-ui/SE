import React, { useState, useCallback, useEffect } from "react"; // ADDED useEffect
import ResumeAnalyzer from "./ResumeAnalyzer";
import Chatbot from "./Chatbot";
import Auth from "./Auth";
import "./App.css";
const SESSION_AUTH_KEY = "RA_SESSION_AUTH";

export default function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [authData, setAuthData] = useState({
    isLoggedIn: false,
    userEmail: null,
    passwordHash: null,
  });
  useEffect(() => {
    const savedAuth = sessionStorage.getItem(SESSION_AUTH_KEY);
    if (savedAuth) {
      try {
        setAuthData(JSON.parse(savedAuth));
      } catch (e) {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
      }
    }
  }, []);
// Handles successful login and saves to sessionStorage
  const handleLogin = useCallback(({ email, passwordHash }) => {
    const newAuthData = { isLoggedIn: true, userEmail: email, passwordHash };
    setAuthData(newAuthData);
    sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(newAuthData));
    console.log(`[App] Session for ${email} saved.`);
  }, []);

  const handleLogout = useCallback(() => {
    setAuthData({ isLoggedIn: false, userEmail: null, passwordHash: null });
    sessionStorage.removeItem(SESSION_AUTH_KEY); // Clear session data
    console.log("Logged out. Session cleared. Resume data remains persisted in localStorage.");
  }, []);
    return (
    <div className="app">
      {/* HEADER */}
      <header className="hero">
        <div className="hero-content">
          <div className="header-row">
            <h1 className="title-small">🚀 Dynamic Resume Analyzer</h1>
            {authData.isLoggedIn && (
              <div className="auth-info">
                {/* MODIFIED: Use full userEmail directly */}
                <span className="user-email" title={authData.userEmail}>
                  {authData.userEmail}
                </span>
                <button className="btn logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
          <p className="subtitle">ATS-aware scoring • Templates • Instant PDF</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {authData.isLoggedIn ? (
          <ResumeAnalyzer 
            userEmail={authData.userEmail} 
            passwordHash={authData.passwordHash} 
          />
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </main>

      {/* Floating Chatbot Button (FAB) */}
      {authData.isLoggedIn && (
        <>
          <button
            className={`fab ${showChatbot ? 'fab-active' : ''}`}
            aria-label="Open Resume Assistant"
            onClick={() => setShowChatbot(!showChatbot)}
          >
            {showChatbot ? '✕' : '💬'}
          </button>
          {/* Note: Chatbot component is now always rendered but hidden by CSS for smooth animation */}
          <Chatbot onClose={() => setShowChatbot(false)} isOpen={showChatbot} />
        </>
      )}

      {/* FOOTER */}
      <footer className="footer-v2">
        <div className="footer-content">
          <p className="footer-title">Dynamic Resume Analyzer</p>
          <div className="team-grid">
            <div className="team-member">
              <strong>Frontend</strong> - V C Ramjhith
            </div>
            <div className="team-member">
              <strong>Backend</strong> - Vamshi
            </div>
            <div className="team-member">
              <strong>QA Tester</strong> - Varshini
            </div>
            <div className="team-member">
              <strong>Team Leader</strong> - U Shivakumar
            </div>
          </div>
          <p className="footer-copyright">
            © 2025 Dynamic Resume Analyzer | ATS-Aware Excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
