import React, { useState, useEffect, useMemo } from "react";

const SECTION = {
  education: /(education|qualifications)/i,
  skills: /(skills|technical skills|key skills)/i,
  experience: /(experience|work experience)/i,
  projects: /(projects)/i,
  certifications: /(certifications)/i,
  contact: /(contact|email|phone|linkedin|github)/i,
};

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (resumeText.trim()) analyzeResume();
  }, [resumeText]);

  const handleFile = (file) => {
    if (!file || !/text\//.test(file.type)) {
      alert("Only plain text resumes supported");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const analyzeResume = () => {
    const found = {};
    const missing = [];
    for (const [key, regex] of Object.entries(SECTION)) {
      regex.test(resumeText) ? (found[key] = true) : missing.push(key);
    }
    const atsScore = Math.max(0, 100 - missing.length * 15);
    setAnalysis({ found, missing, atsScore });
  };

  const feedback = useMemo(() => {
    if (!analysis) return [];
    const fb = [];
    if (analysis.missing.length) fb.push(`Missing sections: ${analysis.missing.join(", ")}`);
    if (analysis.atsScore < 50) fb.push("Low ATS score. Add missing sections.");
    else if (analysis.atsScore < 80) fb.push("Good, but can improve.");
    else fb.push("Excellent resume structure.");
    return fb;
  }, [analysis]);

  const downloadReport = () => {
    const el = document.getElementById("results-section");
    if (!el) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Resume Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #0f172a; }
            h2 { margin-top: 0; }
            .score { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={styles.app}>
      <header style={styles.hero}>
        <h1 style={styles.title}>Dynamic Resume Analyser</h1>
      </header>
      <main style={styles.container}>
        <section style={styles.section}>
          <div
            style={styles.dropzone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            Drag & Drop your resume (.txt)
          </div>
          <input
            type="file"
            accept=".txt"
            onChange={(e) => handleFile(e.target.files[0])}
            style={styles.fileInput}
          />
        </section>

        {analysis && (
          <section id="results-section" style={styles.results}>
            <h2>Results</h2>
            <div style={styles.grid}>
              <div style={styles.card}>
                <h3>Found Sections</h3>
                <ul>{Object.keys(analysis.found).map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
              <div style={styles.card}>
                <h3>Missing Sections</h3>
                <ul>{analysis.missing.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
              <div style={{ ...styles.card, ...styles.score }}>
                <h3>ATS Score</h3>
                <p style={styles.scoreValue}>{analysis.atsScore}%</p>
              </div>
            </div>
            <div style={styles.card}>
              <h3>Feedback</h3>
              <ul>{feedback.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
            <button style={styles.button} onClick={downloadReport}>Download Report</button>
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: { fontFamily: "Arial, sans-serif", background: "#f9fafb", minHeight: "100vh" },
  hero: { background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "white", padding: "2rem", textAlign: "center" },
  title: { fontSize: "2rem", margin: 0 },
  container: { maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" },
  section: { marginBottom: "2rem", textAlign: "center" },
  dropzone: { border: "2px dashed #475569", borderRadius: "12px", padding: "2rem", marginBottom: "1rem", color: "#475569" },
  fileInput: { display: "block", margin: "0 auto" },
  results: { background: "white", borderRadius: "12px", padding: "2rem", boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem", marginBottom: "1rem" },
  card: { background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" },
  score: { background: "#0f172a", color: "white", textAlign: "center" },
  scoreValue: { fontSize: "2rem", fontWeight: "bold" },
  button: { marginTop: "1rem", background: "#0f172a", color: "white", border: "none", padding: "0.8rem 1.5rem", borderRadius: "8px", cursor: "pointer" },
};
