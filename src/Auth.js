import React, { useState, useCallback } from "react";

// NOTE: This URL points to a mock Google Apps Script endpoint
// This backend is updated to expect and handle username and contactInfo during registration.
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwyk3Za9oSx8hLWGadQT7P9B6kbDk3VB6tce5YCe1hiLrL0-xiTMym3x9fl2o0QgVEi/exec";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New state variables for registration fields
  const [username, setUsername] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // SHA-256 helper for client-side password hashing (security simulation)
  const sha256 = useCallback(async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    // Note: crypto.subtle.digest is asynchronous and secure
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }, []);

  const validateEmail = (value) => {
    return /^.+@.+\..+$/.test(value);
  };

  const validateContactInfo = (value) => {
    // Simple validation for phone number (optional: check for minimum length, digits only, etc.)
    return value.length >= 10;
  };

  const validateUsername = (value) => {
    // Simple validation: must be at least 3 characters
    return value.trim().length >= 3;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const authStartTime = performance.now();
    const authType = isLogin ? "LOGIN" : "REGISTER";
    console.log(`[Auth] 🔐 Starting ${authType} process at ${new Date().toISOString()}`);

    const normalizedEmail = (email || "").trim().toLowerCase();
    console.log(`[Auth] 📧 Email normalized: ${normalizedEmail}`);

    // --- Validation Checks ---
    if (!validateEmail(normalizedEmail)) {
      console.warn(`[Auth] ❌ Validation failed: Invalid email format - "${normalizedEmail}"`);
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      console.warn("[Auth] ❌ Validation failed: Password is empty");
      setError("Please enter a password.");
      return;
    }

    if (!isLogin) {
      // Registration-specific validation
      if (!validateUsername(username)) {
        console.warn(`[Auth] ❌ Validation failed: Username too short - "${username}"`);
        setError("Username must be at least 3 characters long.");
        return;
      }
      if (!validateContactInfo(contactInfo)) {
        console.warn(`[Auth] ❌ Validation failed: Invalid contact info - "${contactInfo}"`);
        setError("Please enter a valid contact number (at least 7 digits).");
        return;
      }
      console.log("[Auth] ✅ All registration fields validated successfully");
      console.log(`[Auth] 👤 Username: ${username}, Contact: ${contactInfo}`);
    } else {
      console.log("[Auth] ✅ All login fields validated successfully");
    }
    // --- End Validation Checks ---

    setLoading(true);
    try {
      // 1. Hash password securely before transmission
      const hashStartTime = performance.now();
      console.log("[Auth] 🔒 Starting password hashing...");

      const passwordHash = await sha256(password);

      const hashTime = performance.now() - hashStartTime;
      console.log(`[Auth] ✅ Password hashed in ${hashTime.toFixed(2)}ms`);
      console.log(`[Auth] 🔐 Password hash (first 16 chars): ${passwordHash.substring(0, 16)}...`);

      let apiUrl = `${APPS_SCRIPT_URL}?action=${isLogin ? "login" : "register"}`;
      const data = {
        email: normalizedEmail,
        password: passwordHash,
      };

      if (!isLogin) {
        // Add registration-specific data
        data.username = username.trim();
        data.contactInfo = contactInfo.trim();
      }

      // 2. API call (using POST for better data transfer, especially for registration)
      // Note: This still uses GET parameters for simplicity with the mock Apps Script URL.
      apiUrl += Object.keys(data)
        .map((key) => `&${key}=${encodeURIComponent(data[key])}`)
        .join("");

      console.log(`[Auth] 📤 Sending ${authType} request to API...`);
      console.log(
        `[Auth] 🔗 API endpoint: ${APPS_SCRIPT_URL}?action=${isLogin ? "login" : "register"}`,
      );

      const apiStartTime = performance.now();
      const resp = await fetch(apiUrl);

      const apiResponseTime = performance.now() - apiStartTime;
      console.log(`[Auth] ⏱️  API response received in ${apiResponseTime.toFixed(2)}ms`);
      console.log(`[Auth] 📊 Response status: ${resp.status}`);

      const result = await resp.json();
      console.log("[Auth] 📋 Response data:", result);

      if (result.status === "success") {
        // Successful login/register
        const totalTime = performance.now() - authStartTime;
        console.log(`[Auth] ✅ ${authType} successful!`);
        console.log(`[Auth] ⏲️  Total ${authType} time: ${totalTime.toFixed(2)}ms`);
        console.log(`[Auth] 👤 User authenticated: ${normalizedEmail}`);

        onLogin({
          email: normalizedEmail,
          passwordHash,
          username: isLogin ? result.username || "User" : username,
          contactInfo: isLogin ? result.contactInfo || "" : contactInfo,
        });
      } else {
        // Handle API-side errors (e.g., user not found, registration error)
        console.error(`[Auth] ❌ ${authType} failed:`, result.message);
        setError(result.message || "Authentication failed. Check your credentials or try again.");
      }
    } catch (err) {
      // Handle network errors
      const errorTime = performance.now() - authStartTime;
      console.error(`[Auth] 💥 ${authType} error after ${errorTime.toFixed(2)}ms:`, err);
      console.error("[Auth] 📍 Error type:", err.name, err.message);
      setError("Network or server error: Could not reach the authentication endpoint.");
    } finally {
      setLoading(false);
      const totalTime = performance.now() - authStartTime;
      console.log(`[Auth] 🏁 ${authType} flow completed. Total time: ${totalTime.toFixed(2)}ms\n`);
    }
  };

  const handleSwitch = () => {
    const newMode = !isLogin ? "LOGIN" : "REGISTER";
    console.log(`[Auth] 🔄 Switching mode from ${isLogin ? "LOGIN" : "REGISTER"} to ${newMode}`);

    setIsLogin(!isLogin);
    setError(null);
    setEmail("");
    setUsername("");
    setContactInfo("");
    setPassword("");

    console.log("[Auth] ✅ Mode switched and form cleared");
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="section-title center">
          {isLogin ? "Login" : "Register"} to use Resume Analyzer
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              className="text-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              disabled={loading}
              title="Enter your desired username (min 3 characters)"
            />
          )}

          <input
            className="text-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          {!isLogin && (
            <input
              className="text-input"
              type="tel"
              placeholder="Contact Info (Phone)"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required={!isLogin}
              disabled={loading}
              title="Enter your contact phone number (min 7 digits)"
            />
          )}

          <input
            className="text-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            title="Your password will be securely hashed using SHA-256 before transmission."
          />

          <button type="submit" className="btn primary full-width" disabled={loading}>
            {loading
              ? isLogin
                ? "Logging in..."
                : "Registering..."
              : isLogin
                ? "Login"
                : "Register Now"}
          </button>
        </form>

        {error && (
          <p className="error" style={{ color: "#b00020", marginTop: "0.8rem", fontWeight: 600 }}>
            {error}
          </p>
        )}

        <div className="switch-auth center" style={{ marginTop: "1.5rem" }}>
          <span style={{ marginRight: "0.5rem" }}>
            {isLogin ? "Need an account?" : "Already have an account?"}
          </span>
          <button className="link-button" onClick={handleSwitch} type="button" disabled={loading}>
            {isLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}