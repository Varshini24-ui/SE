import React, { useState, useRef, useEffect, useCallback } from "react";

// Static responses for the dummy chatbot
const RESPONSES = {
  greeting: "Hello! I’m your Resume Assistant 👋 How can I help you improve your ATS score?",
  ats: "ATS scans for keywords, clean structure, and standard headings. Tailor your resume to the JD to beat it.",
  keywords: "Pick high-signal JD terms, use action verbs, and quantify results (%, $, time).",
  format: "Keep it simple: standard fonts, headings, bullets, consistent dates, no tables/graphics.",
  sections: "Must-have sections for high ATS: Contact, Summary, Experience, Skills, Education. Add Projects/Certs if relevant.",
  default: "I can help with general advice on ATS, keywords, formatting, or required sections. Ask me about your score breakdown!",
};

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([{ type: "bot", text: RESPONSES.greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fallback logic for static responses
  const replyFor = useCallback((text) => {
    const t = text.toLowerCase();
    if (t.includes("score") || t.includes("suggestions") || t.includes("breakdown")) return "To get a *detailed* breakdown and context-aware suggestions, you need to first upload your resume and run the analysis on the main page. I can then pull that data!";
    if (t.includes("ats")) return RESPONSES.ats;
    if (t.includes("keyword")) return RESPONSES.keywords;
    if (t.includes("format")) return RESPONSES.format;
    if (t.includes("section")) return RESPONSES.sections;
    if (t.includes("hello") || t.includes("hi")) return RESPONSES.greeting;
    return RESPONSES.default;
  }, []);

  // API call logic with fallback
  const getBotReply = async (text) => {
    try {
      // Replace this URL with your actual chatbot API endpoint
      const response = await fetch("AIzaSyDk2paDsskbk3ql-0Hp7HSB3xSjJVO1fPQ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      // Assume the API returns { reply: "..." }
      return data.reply || replyFor(text);
    } catch (err) {
      // On error, use static replies
      return replyFor(text);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setLoading(true);

    // Show "typing..." message for effect
    setMessages((prev) => [...prev, { type: "bot", text: "<em>Typing…</em>" }]);
    let reply = await getBotReply(text);

    // Remove "typing..." and show actual reply
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { type: "bot", text: reply },
    ]);
    setLoading(false);
  };

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>🤖 Resume Assistant</h3>
          <button className="x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-message ${m.type}`}
              dangerouslySetInnerHTML={{
                __html: m.text.replace(/\*(.*?)\*/g, "<strong>$1</strong>"),
              }}
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
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about ATS, keywords, format…"
          />
          <button onClick={send} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}