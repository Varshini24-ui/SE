import React, { useState, useRef, useEffect, useCallback } from "react";

// -----------------------------------------------------------------------------
// CONSTANTS & CONFIGURATION
// -----------------------------------------------------------------------------

// Defines the bot's persona and constraints for short, layman-term answers.
const SYSTEM_INSTRUCTION = `You are the 'Resume Assistant' for a 'Dynamic Resume Analyzer' website. 
Your goal is to provide short, sweet, easy-to-read, layman-term answers for common people. Keep all responses under 3 sentences maximum, using simple language.
Your expertise is focused on career development and resume best practices. 
You MUST answer questions related to:
1. Resume and ATS best practices.
2. LinkedIn account creation, profile optimization, and writing posts.
3. X (Twitter) account creation and writing posts.
4. Reddit for career advice or job searching, and writing posts.
5. Basic Git and GitHub commands for career development (e.g., clone, commit, pull).
6. Website features, key concepts (like JD or ATS), and general user queries.

For any question outside these 6 topics, simply respond with a helpful message: "I'm only trained to help with website features, resume, social media, or basic GitHub questions. What can I help you with in those areas?"`;

// NOTE: This key is left as provided. In a production environment, use a secure backend.
const GEMINI_API_KEY = "AIzaSyClMB2V__ZqmcaTHbQiK5DdpekAKVIDeRQ"; 

const INITIAL_MESSAGE = { 
  type: "bot", 
  text: "Hello! I’m your Resume Assistant 👋 How can I help you improve your ATS score or with career social media?" 
};

// -----------------------------------------------------------------------------
// CUSTOM HOOK: useChatLogic (Agile Logic and API Handler)
// -----------------------------------------------------------------------------

/**
 * Handles all state management and core interaction logic for the chatbot.
 * This separation makes the component scalable and testable.
 */
function useChatLogic() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to interact with the Gemini API
  const getBotReply = useCallback(async (text) => {
    // Fail fast if API key is missing
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      return "⚠️ Gemini API key is missing. Please add the key to the `Chatbot.js` file to enable AI responses.";
    }

    try {
      // Define the API endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      // Agentic Prompt Stuffing: Combine the SYSTEM_INSTRUCTION with the user's query.
      const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUser Question: ${text}`;

      const payload = {
        contents: [{ parts: [{ text: fullPrompt }] }],
      };
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data?.candidates?.[0]?.content?.parts) {
        // Extract and join all text parts from the response
        return data.candidates[0].content.parts.map((p) => p.text).join(" ");
      } else if (data?.error) {
        // Handle explicit API errors
        return `I had trouble connecting to the AI brain. Try asking a different way. (API Error: ${data.error.message})`;
      }
      
      return "Sorry, I couldn't generate a response. Please try again.";
      
    } catch (err) {
      // Handle network errors
      return "Oops! I can't reach the server right now. Check your internet connection. (Network Error)";
    }
  }, []);

  // Main function to handle user message submission
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    
    // 1. Add user message, clear input
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setLoading(true);

    // 2. Add "typing" placeholder (using <em> for visual effect)
    setMessages((prev) => [...prev, { type: "bot", text: "<em>Typing…</em>" }]);
    
    // 3. Get reply from AI
    let reply = await getBotReply(text);

    // 4. Replace placeholder with final reply
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { type: "bot", text: reply },
    ]);
    setLoading(false);
  }, [input, loading, getBotReply]);
  
  return { messages, input, loading, setInput, send };
}


// -----------------------------------------------------------------------------
// CHATBOT COMPONENT (UI Layer)
// -----------------------------------------------------------------------------

/**
 * Chatbot component handles the rendering and user interaction (presentational).
 */
export default function Chatbot({ onClose, isOpen })  {
  // Use the custom hook for all component logic
  const { messages, input, loading, setInput, send } = useChatLogic();
  const messagesEndRef = useRef(null);
  
  // Scrolls to the latest message whenever the messages array updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Utility to safely parse simple markdown (*bold*)
  const parseMessage = (text) => {
    // Replaces *text* with <strong>text</strong>
    return text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
  }

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <div className="chatbot">
        <div className="chat-header">
          <h3>🤖 Resume Assistant</h3>
          <button className="x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-message ${m.type}`}
              // Render parsed content (markdown, typing effect <em>)
              dangerouslySetInnerHTML={{ __html: parseMessage(m.text) }}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-row">
          <input
            autoFocus
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            // Call send() on 'Enter' key press
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about ATS, keywords, format…"
            aria-label="Chat input"
          />
          <button onClick={send} disabled={loading} aria-label="Send message">Send</button>
        </div>
      </div>
    </div>
  );
}
