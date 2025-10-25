// ResumeStore.js

/**
 * MOCK CLIENT-SIDE STORAGE FOR ACADEMIC PROJECT ⚠️
 * This module simulates secure storage, encryption, and the 5-day deletion
 * policy using localStorage. In a production app, a secure backend is MANDATORY.
 * Uses UTF-8 compatible Base64 functions to avoid InvalidCharacterError.
 */
const STORAGE_KEY = 'R_A_USER_STORE';
const EXPIRY_DAYS = 5; 

// --- UTF-8 Safe Mock Encryption/Decryption Helpers (Simulation) ---

// Encodes UTF-8 string to a Base64-compatible string
const mockEncrypt = (data) => {
  const jsonString = JSON.stringify(data);
  // FIX: Safely convert UTF-8 JSON string to Latin1-compatible string for btoa()
  const encoder = new TextEncoder();
  const bytes = encoder.encode(jsonString);
  const latin1String = Array.from(bytes)
    .map(byte => String.fromCharCode(byte))
    .join('');
    
  return btoa(latin1String);
};

// Decodes Base64 string back to original UTF-8 string
const mockDecrypt = (data) => {
  try {
    const latin1String = atob(data);
    // FIX: Convert Latin1 string back to UTF-8 byte array using TextDecoder
    const bytes = Uint8Array.from(latin1String, char => char.charCodeAt(0));
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(bytes);

    return JSON.parse(jsonString);
  } catch (e) {
    console.error("[ResumeStore] Decryption failed (Corrupt data or processing error).", e);
    return null;
  }
};

// --- CORE FUNCTIONALITY ---

/**
 * Stores user and "encrypted" resume data. Resets the 5-day inactivity clock.
 * @param {string} userEmail - The email of the logged-in user.
 * @param {string} resumeText - Resume content.
 * @param {string} [jdContent=""] - JD content.
 */
export const storeResumeData = (userEmail, resumeText, jdContent = "") => {
  if (!userEmail || !resumeText) return;

  const expiryTimestamp = Date.now() + (EXPIRY_DAYS * 24 * 60 * 60 * 1000); 

  
  const dataToEncrypt = {
    email: userEmail,
    resume: resumeText,
    jd: jdContent,
    timestamp: Date.now(),
    expiry: expiryTimestamp, 
  };
  const encryptedData = mockEncrypt(dataToEncrypt);
  localStorage.setItem(STORAGE_KEY, encryptedData);
  console.log(`[ResumeStore] Data for ${userEmail} stored. Mock Expiry: ${new Date(expiryTimestamp).toLocaleDateString()}.`);
  console.log(`[LOG:ACTIVITY] User ${userEmail} saved resume content.`);
};

/**
 * Retrieves and "decrypts" resume data, checking the 5-day expiry policy.
 * If data is expired, it is deleted and returns null.
 * @param {string} userEmail - The user's email.
 */
export const getResumeData = (userEmail) => {
  const encryptedData = localStorage.getItem(STORAGE_KEY);
  if (!encryptedData) return null;
  const decryptedData = mockDecrypt(encryptedData);
  if (!decryptedData || decryptedData.email !== userEmail) return null;
  if (Date.now() > decryptedData.expiry) {
    console.warn(`[ResumeStore] Data for ${userEmail} has EXPIRED. Deleting now.`);
    deleteResumeData(); 
    return null;
  }
  return { 
      resume: decryptedData.resume, 
      jd: decryptedData.jd 
  };
};

// Deletes the stored resume data (called on Logout or Expiry).
export const deleteResumeData = () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log("[ResumeStore] Resume data deleted.");
    console.log(`[LOG:SECURITY] Resume data deleted due to session clear or expiry.`); 
};