import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

// Section definitions for robust parsing using regex
const SECTIONS = {
  contact: /\b(contact|email|phone|linkedin|github|address)\b/i,
  summary: /\b(summary|objective|profile)\b/i,
  experience: /\b(experience|work experience|employment|career)\b/i,
  skills: /\b(skills|technical skills|competencies|technologies)\b/i,
  education: /\b(education|degree|university|college)\b/i,
  projects: /\b(projects?|portfolio)\b/i,
  certifications: /\b(certifications?|certificates?|license|licensed?)\b/i,
};

// Template definitions for styling
const TEMPLATES = {
  modern: { name: "Modern Professional", className: "theme-modern", fontStack: "ui-sans-serif, system-ui, Segoe UI, Arial" },
  minimal: { name: "Minimal Clean", className: "theme-minimal", fontStack: "Arial, Helvetica, sans-serif" },
  creative: { name: "Creative Bold", className: "theme-creative", fontStack: "Helvetica, Arial, sans-serif" },
};

// Stopwords used for cleaner keyword extraction from the JD
const STOPWORDS = new Set([
  "and","the","with","from","that","this","your","their","our","for","into","able","will","shall","must","have","has","had",
  "are","was","were","you","they","them","over","under","about","above","below","not","only","but","also","more","than",
  "such","etc","using","use","used","strong","good","great","work","role","team","skills","requirements","responsibilities",
  "job","description","looking","plus","preferred","required","experience","years","year","developer","engineer","data"
]);

// Weak words that penalize the formatting/vocabulary score (action verb detection)
const WEAK_WORDS = ["responsible for", "managed", "worked on", "assisted", "duties included", "had to"];


/** Extracts unique, relevant keywords from text, ignoring common stopwords. */
function extractKeywords(text) {
  return [...new Set(text.toLowerCase().split(/[^a-z0-9+#.]/i)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
  )];
}

/** Finds the first non-empty line to use as the candidate name. */
function firstNonEmptyLine(s) {
  return (s || "").split(/\r?\n/).map(x => x.trim()).find(x => x.length > 0) || "Candidate Name";
}

/** Escapes special HTML characters to prevent XSS in dangerouslySetInnerHTML. */
function escapeHTML(s) {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

/** Converts plain text resume content into structured HTML for template rendering. */
function plainToHTML(resumeText) {
  const lines = (resumeText || "").split(/\r?\n/);
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    
    // Check if the line looks like a standard resume section heading
    const isHeading = Object.values(SECTIONS).some(r => r.test(trimmed));
    
    // Check if the line looks like a bullet point (starts with '-', '*', '•', or digit followed by space)
    const isBullet = trimmed.match(/^[-*•\d.]\s/); 

    if (isHeading) return `<h2 class="section-heading">${escapeHTML(trimmed)}</h2>`;
    
    // Wrap consecutive bullet points in a list structure
    if (isBullet) return `<ul><li>${escapeHTML(trimmed.replace(/^[-*•\d.]\s*/, ''))}</li></ul>`; 
    
    return `<p>${escapeHTML(trimmed)}</p>`;
  }).join("\n");
}

/** Calculates the ATS score based on completeness, keyword match, and formatting. */
function calculateATSScore(resumeText, jobDescription) {
  const found = {};
  const missing = [];
  const resumeLower = resumeText.toLowerCase();

  // Score Weights: Completeness (40%), Keywords (30%), Formatting (30%)
  
  // 1. Completeness (40%)
  const coreSections = ["contact", "summary", "experience", "skills", "education"];
  Object.entries(SECTIONS).forEach(([k, rgx]) => {
    const isFound = rgx.test(resumeLower);
    if (isFound) found[k] = true;
    else if (coreSections.includes(k)) missing.push(k);
  });
  
  const coreFoundCount = coreSections.length - missing.length;
  // Score based on the ratio of found core sections
  const structureScore = Math.round((coreFoundCount / coreSections.length) * 40);

  // 2. Keywords (30%) - JD matching
  const jdKeys = extractKeywords(jobDescription);
  const matched = jdKeys.filter(k => resumeLower.includes(k));
  // Prevents division by zero if JD is empty, setting score to max (30)
  const keywordMatchRatio = jdKeys.length ? matched.length / jdKeys.length : 1;
  const keywordScore = Math.round(keywordMatchRatio * 30);

  // 3. Formatting (30%) - Weak word check
  let weakWordCount = 0;
  WEAK_WORDS.forEach(word => {
    // Global regex to count all instances of weak verbs
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    weakWordCount += [...resumeLower.matchAll(regex)].length;
  });
  
  // Max penalty of 15 points (5 points per 5 occurrences of weak words)
  const weakWordPenalty = Math.min(Math.floor(weakWordCount / 5) * 5, 15); 
  const formattingScore = Math.max(0, 30 - weakWordPenalty);

  // Final Score calculation
  const atsScore = Math.max(0, Math.min(100, structureScore + keywordScore + formattingScore));
  const missingKeys = jdKeys.filter(k => !resumeLower.includes(k));

  return { 
    found, missing, matched, missingKeys, 
    atsScore, uniqueJD: jdKeys.length,
    weakWordCount, weakWordPenalty,
  };
}

// Mock Apps Script URL for secure file upload demonstration
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTqKmb1sqsmGhh2g5MgBIw7JWtgYpEQ10cxZYIKFK0Kuitd6I_UYFKoUSoEIMDux1m/exec";


export default function ResumeAnalyzer({ userEmail, passwordHash }) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [analysis, setAnalysis] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  /** Handles file upload and processes content. */
  const handleFile = (file) => {
    setFileError(null);
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFileError("File too large (Max 2MB).");
      setResumeText("");
      return;
    }

    // PDF Handling Simulation: PDF parsing is complex, so we load dummy text for PDF files
    if (file.type === "application/pdf") {
      setFileError("⚠️ PDF selected. Use .txt for accurate analysis. Dummy content loaded.");
      setResumeText("John Smith\n(555) 123-4567 | john.smith@email.com | LinkedIn/johnsmith\n\nSummary\nHighly motivated developer with experience in full-stack web technologies.\n\nExperience\n- Spearheaded the development of a customer-facing portal using React and Tailwind CSS.\n- Managed the migration of legacy systems to a new Firestore database, improving performance by 30%.\n- Led Agile sprint planning and deployment cycles.\n\nSkills\nReact, JavaScript, Tailwind CSS, Firebase, Firestore, Agile Methodology, SQL, Deployment.\n\nEducation\nB.S. Computer Science, University of Technology");
      return;
    }

    if (file.type !== "text/plain") {
      setFileError("Upload a .txt or .pdf file only. TXT recommended.");
      setResumeText("");
      return;
    }

    // Handle TXT file content
    const reader = new FileReader();
    reader.onload = e => setResumeText(String(e.target.result || ""));
    reader.readAsText(file);
  };

  // Effect to recalculate ATS score whenever input changes
  useEffect(() => {
    if (!resumeText) { setAnalysis(null); return; }
    // Core performance check: analysis runs instantly
    const startTime = performance.now();
    setAnalysis(calculateATSScore(resumeText, jobDescription));
    const endTime = performance.now();
    console.log(`Resume analysis completed in ${(endTime - startTime).toFixed(2)} ms.`); 
  }, [resumeText, jobDescription]);

  // Memoized function to generate actionable feedback for the user
  const feedback = useMemo(() => {
    if (!analysis) return [];
    const list = [];
    const { atsScore, missing, uniqueJD, matched, weakWordCount, weakWordPenalty, missingKeys } = analysis;

    // 1. Structure Feedback
    if (missing.length > 0) {
      list.push(`❌ Structure Deficiency: Missing core sections: <strong>${missing.join(", ")}</strong>. (Impact: High)`);
    } else {
      list.push(`⭐ Structure Complete: All standard sections found.`);
    }
    
    // 2. Keyword Feedback (Real-time JD Check)
    const matchPct = uniqueJD ? Math.round((matched.length / uniqueJD) * 100) : 100;
    if (uniqueJD === 0) {
      list.push(`🔎 No JD provided. Cannot calculate keyword alignment. Paste one for a score boost!`);
    } else if (matchPct < 40) {
      list.push(`⚠️ Low Keyword Match (${matchPct}%): Major tailoring needed. Missing critical terms like: <strong>${missingKeys.slice(0, 3).join(', ')}...</strong>`);
    } else if (matchPct < 70) {
      list.push(`📈 Moderate Match (${matchPct}%): Add missing terms for a stronger ATS score. You're close!`);
    } else {
      list.push(`⭐ Strong Match (${matchPct}%): Excellent keyword alignment.`);
    }
    
    // 3. Formatting/Vocabulary Feedback
    if (weakWordCount > 0) {
        list.push(`⚠️ Vocabulary: Used weak verbs <strong>${weakWordCount}</strong> times. Replace terms like 'responsible for' or 'managed' with stronger action verbs like 'Spearheaded' or 'Drove'.`);
    } else {
        list.push(`⭐ Vocabulary: Strong action verbs detected.`);
    }

    // 4. Final Score
    list.push(`📊 Final ATS Score: <strong>${atsScore}%</strong>. Target 80%+ for top performance.`);

    return list;
  }, [analysis]);

  const candidateName = useMemo(() => firstNonEmptyLine(resumeText), [resumeText]);
  const htmlBody = useMemo(() => plainToHTML(resumeText), [resumeText]);

  /** Dynamically loads external libraries (jsPDF and html2canvas) for export. */
  const loadLibraries = useCallback(() => {
    return new Promise((resolve) => {
      // Check if libraries are already loaded
      if (window.jsPDF && window.html2canvas) return resolve();
      
      const jsPDFScript = document.createElement("script");
      jsPDFScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      jsPDFScript.onload = () => {
        const html2canvasScript = document.createElement("script");
        html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        html2canvasScript.onload = resolve;
        document.body.appendChild(html2canvasScript);
      };
      document.body.appendChild(jsPDFScript);
    });
  }, []);

  /** Generates PDF and uploads Base64 data to the mock backend for secure storage. */
  const downloadPDF = async () => {
    if (!previewRef.current || !userEmail || !passwordHash) {
      console.error("Authentication or resume data missing.");
      return;
    }

    setIsUploading(true);
    await loadLibraries(); 

    const node = previewRef.current;
    
    // Temporarily apply full template styles for high-quality, print-ready export
    const originalClass = node.className;
    node.className = `resume-sheet ${TEMPLATES[selectedTemplate].className}`;

    try {
      // 1. Generate image from HTML/CSS
      const canvas = await window.html2canvas(node, { 
          scale: 3, 
          backgroundColor: "#fff", 
          useCORS: true 
      });
      const imgData = canvas.toDataURL("image/png");

      // 2. Generate PDF using jsPDF
      const pdf = new window.jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // Simple multi-page handling
      let y = 0, remainingHeight = imgHeight;
      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 0, -y, pageWidth, imgHeight);
        remainingHeight -= pageHeight;
        y += pageHeight;
        if (remainingHeight > 0) pdf.addPage();
      }

      const fileName = `${candidateName.replace(/\s/g, "_")}_${selectedTemplate}_Resume.pdf`;

      // 3. Convert PDF Blob to Base64 for upload (Security Requirement: data at rest encryption simulated by secure hash auth)
      const base64PDF = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(pdf.output("blob"));
      });
      
      // 4. Perform upload to Google Apps Script backend
      const payload = new URLSearchParams({
        action: "store",
        email: userEmail,
        passwordHash, // Auth token for secure data transfer
        fileName,
        resumeFile: base64PDF,
      });

      const res = await fetch(APPS_SCRIPT_URL, { 
        method: "POST", 
        body: payload 
      });
      const json = await res.json();

      if (json.status === "success") {
        console.log(`✅ Resume uploaded successfully to Mock Storage! Link: ${json.link}`);
      } else {
        console.error(`❌ Upload failed: ${json.message}`);
      }
      
      // Also download the PDF locally for the user
      pdf.save(fileName);

    } catch (err) {
      console.error(`⚠️ PDF Generation or Upload Error:`, err);
    } finally {
      setIsUploading(false);
      // Revert styles after canvas generation
      node.className = originalClass;
    }
  };


  return (
    <React.Fragment>
      <section>
        <div className="grid-2">
          {/* Resume Input Card (File/Text) */}
          <div className="card">
            <h2 className="section-title">📄 Resume Input (Max 2MB)</h2>
            <div className="resume-dropzone"
              onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); }}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            >
              <p className="dropzone-text">Drag & Drop or Select a File (.txt, .pdf)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,application/pdf"
                style={{ display: "none" }}
                onChange={e => handleFile(e.target.files?.[0])}
              />
              <button className="btn select-file-btn" onClick={() => fileInputRef.current.click()}>Select File</button>
              {fileError && <p className="hint file-error">{fileError}</p>}
            </div>
            <textarea className="text-input jd-input mt-1" 
              placeholder="Paste your resume content here. (TXT is best for parsing accuracy)" 
              value={resumeText} 
              onChange={e => setResumeText(e.target.value)} 
            />
          </div>

          {/* Job Description Card */}
          <div className="card">
            <h2 className="section-title">📝 Job Description (For Keyword Scoring)</h2>
            <textarea className="text-input jd-input" placeholder="Paste Job Description here..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
            <p className="hint">Pasting the JD is crucial. The tool analyzes keywords against this text for 30% of your ATS score.</p>
          </div>
        </div>

        {resumeText && (
          <>
            {/* Template Selection Card */}
            <div className="card">
              <h2 className="section-title">🎨 Choose Template</h2>
              <div className="template-grid">
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <button key={key} type="button" className={`template-card ${selectedTemplate === key ? "selected" : ""}`} onClick={() => setSelectedTemplate(key)} title={t.name}>
                    <div className={`template-swatch ${t.className}`}></div>
                    <div className="template-name">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ATS Analysis Card (Score + Feedback) */}
            {analysis && (
              <div className="card">
                <h2 className="section-title">📊 ATS Analysis (Score: {analysis.atsScore}%)</h2>
                <div className="score-row">
                  {/* Dynamic Score Ring with color coding */}
                  <div className="score-ring" style={{ "--pct": `${analysis.atsScore}%`, "--ring-color": analysis.atsScore >= 70 ? 'var(--ok)' : analysis.atsScore >= 40 ? 'var(--warn)' : 'var(--bad)' }}>
                    <div className="score-num">{analysis.atsScore}</div>
                    <div className="score-label">Score</div>
                  </div>
                  <div className="analysis-points">
                    <h3>Actionable Suggestions</h3>
                    <ul className="feedback-list">
                      {feedback.map((f, i) => <li key={i} dangerouslySetInnerHTML={{ __html: f }} />)}
                    </ul>
                  </div>
                </div>
                <div className="actions">
                  <button className="btn primary" onClick={downloadPDF} disabled={isUploading}>
                    {isUploading ? 'Uploading & Downloading...' : '📄 Download & Securely Upload PDF'}
                  </button>
                  <p className="hint">Downloads the PDF and securely uploads a copy to mock storage for 5-day retention.</p>
                </div>
              </div>
            )}

            {/* Resume Preview Sheet */}
            <div ref={previewRef} className={`resume-sheet ${TEMPLATES[selectedTemplate].className}`} style={{ fontFamily: TEMPLATES[selectedTemplate].fontStack }}>
              <div className="sheet-header">
                <div className="avatar">{candidateName.slice(0, 1).toUpperCase()}</div>
                <div className="headings">
                  <h1 className="name">{candidateName}</h1>
                  <div className="tagline">Professional Resume</div>
                </div>
              </div>
              <div className="sheet-body" dangerouslySetInnerHTML={{ __html: htmlBody }} />
            </div>
          </>
        )}
      </section>
    </React.Fragment>
  );
}
