// App.js

import React, { useState, useCallback, useEffect, useRef } from "react";
import ResumeAnalyzer from "./ResumeAnalyzer";
import Chatbot from "./Chatbot";
import Auth from "./Auth";
import "./App.css";
const SESSION_AUTH_KEY = "RA_SESSION_AUTH";
const SESSION_TIMEOUT_DURATION = 1 * 60 * 1000; // 1 minute in milliseconds

export default function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [authData, setAuthData] = useState({
    isLoggedIn: false,
    userEmail: null,
    passwordHash: null,
    username: null,
  });
  // State to hold resume-related context for the Chatbot
  const [resumeContext, setResumeContext] = useState({
    userEmail: null,
    resumeText: "",
    analysisSummary: null,
  });

  // Session timeout tracking
  const sessionTimeoutRef = useRef(null);
  const sessionStartTimeRef = useRef(null);

  // Function to clear session timeout
  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      console.log("[Session] ⏱️  Session timeout cleared");
    }
  }, []);

  // Function to reset session timer on user activity
  const resetSessionTimer = useCallback(() => {
    clearSessionTimeout();

    if (authData.isLoggedIn) {
      const timeoutDuration = SESSION_TIMEOUT_DURATION;
      const timeoutMinutes = Math.round(timeoutDuration / 60000);

      console.log(
        `[Session] 🔄 Session timer reset. Will expire in ${timeoutMinutes} minutes at ${new Date(Date.now() + timeoutDuration).toLocaleTimeString()}`,
      );

      sessionTimeoutRef.current = setTimeout(() => {
        console.warn(
          `[Session] ⏰ SESSION TIMEOUT! User was inactive for ${timeoutMinutes} minutes`,
        );
        console.log(`[Session] 🚪 Auto-logging out user: ${authData.userEmail}`);

        // Auto logout
        setAuthData({ isLoggedIn: false, userEmail: null, passwordHash: null, username: null });
        sessionStorage.removeItem(SESSION_AUTH_KEY);
        setResumeContext({ userEmail: null, resumeText: "", analysisSummary: null });

        alert(
          `⏰ Your session has expired due to inactivity (${timeoutMinutes} minutes). Please log in again.`,
        );
      }, timeoutDuration);
    }
  }, [authData.isLoggedIn, authData.userEmail, clearSessionTimeout]);

  // Set up activity listeners for session reset
  useEffect(() => {
    if (!authData.isLoggedIn) {
      return;
    }

    console.log("[Session] 👁️  Setting up activity listeners");

    const handleActivity = () => {
      resetSessionTimer();
    };

    // Listen to user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    // Initial timer setup
    resetSessionTimer();

    return () => {
      console.log("[Session] 🧹 Cleaning up activity listeners");
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearSessionTimeout();
    };
  }, [authData.isLoggedIn, resetSessionTimer, clearSessionTimeout]);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem(SESSION_AUTH_KEY);
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        console.log(`[Session] 📂 Session restored from storage for user: ${parsedAuth.userEmail}`);
        console.log(
          `[Session] ⏱️  Session timeout duration: ${SESSION_TIMEOUT_DURATION / 60000} minutes`,
        );

        // parsedAuth now includes username
        setAuthData(parsedAuth);
        // Initialize resumeContext.userEmail on session load
        setResumeContext((prev) => ({ ...prev, userEmail: parsedAuth.userEmail }));
      } catch (e) {
        console.error("[Session] ❌ Error parsing saved session:", e);
        sessionStorage.removeItem(SESSION_AUTH_KEY);
      }
    } else {
      console.log("[Session] 📋 No saved session found. User is logged out.");
    }
  }, []);

  // Handles successful login and saves to sessionStorage
  const handleLogin = useCallback(({ email, passwordHash, username }) => {
    const newAuthData = { isLoggedIn: true, userEmail: email, passwordHash, username };
    setAuthData(newAuthData);
    sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(newAuthData));
    sessionStartTimeRef.current = Date.now();

    console.log(`[Session] ✅ User logged in: ${email}`);
    console.log(
      `[Session] 🕐 Session start time: ${new Date(sessionStartTimeRef.current).toLocaleTimeString()}`,
    );
    console.log(`[Session] ⏱️  Session timeout: ${SESSION_TIMEOUT_DURATION / 60000} minutes`);

    // Initialize resumeContext.userEmail on fresh login
    setResumeContext((prev) => ({ ...prev, userEmail: email }));
  }, []);

  // Fixes the potential ESLint warning by ensuring the function is correctly scoped and used below.
  const handleLogout = useCallback(() => {
    const logoutTime = new Date().toLocaleTimeString();
    const sessionDuration = sessionStartTimeRef.current
      ? Date.now() - sessionStartTimeRef.current
      : 0;
    const sessionMinutes = Math.round(sessionDuration / 60000);

    console.log("[Session] 🚪 User logout initiated");
    console.log(`[Session] ⏱️  Session duration: ${sessionMinutes} minutes`);
    console.log(`[Session] 🕐 Logout time: ${logoutTime}`);

    setAuthData({ isLoggedIn: false, userEmail: null, passwordHash: null, username: null });
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    setResumeContext({ userEmail: null, resumeText: "", analysisSummary: null });

    clearSessionTimeout();
    sessionStartTimeRef.current = null;

    console.log("[Session] ✅ Session cleared. Resume data remains persisted in localStorage.");
  }, [clearSessionTimeout]);

  // Callback to receive resume data from ResumeAnalyzer
  const handleResumeDataChange = useCallback((data) => {
    setResumeContext(data);
    console.log(`[App] Resume context updated for ${data.userEmail}.`);
  }, []);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-content">
          <div className="main-header-block">
            <div className="header-row">
              <h1 className="title-small">🚀 Dynamic Resume Analyzer</h1>
            </div>
            <p className="subtitle">ATS-aware scoring • Templates • Instant PDF</p>
          </div>
          {authData.isLoggedIn && (
            <div className="auth-info-row">
              <div className="auth-info">
                <span className="user-email" title={authData.userEmail}>
                  {authData.username || authData.userEmail}
                </span>
                <button className="btn logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {authData.isLoggedIn ? (
          <ResumeAnalyzer
            userEmail={authData.userEmail}
            passwordHash={authData.passwordHash}
            // Pass the data change handler to ResumeAnalyzer
            onDataChange={handleResumeDataChange}
          />
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </main>

      {authData.isLoggedIn && (
        <>
          <button
            className={`fab ${showChatbot ? "fab-active" : ""}`}
            aria-label="Open Resume Assistant"
            onClick={() => setShowChatbot(!showChatbot)}
          >
            {showChatbot ? "✕" : "💬"}
          </button>
          <Chatbot
            onClose={() => setShowChatbot(false)}
            isOpen={showChatbot}
            resumeContext={resumeContext}
          />
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