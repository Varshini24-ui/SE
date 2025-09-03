// App.test.js
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import App from "./App";

function createFile(content, name, type) {
  return new File([content], name, { type });
}

describe("Dynamic Resume Analyzer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects non-text files", () => {
    window.alert = jest.fn();
    render(<App />);
    const input = screen.getByLabelText(/upload resume/i);

    const fakeFile = createFile("pdf data", "resume.pdf", "application/pdf");
    fireEvent.change(input, { target: { files: [fakeFile] } });

    expect(window.alert).toHaveBeenCalledWith("Only plain text resumes supported");
  });

  test("accepts .txt file and shows results", async () => {
    render(<App />);
    const input = screen.getByLabelText(/upload resume/i);

    const txtFile = createFile("Education: B.Tech\nSkills: React\nExperience: 1 year", "resume.txt", "text/plain");
    fireEvent.change(input, { target: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Results/i)).toBeInTheDocument();
      expect(screen.getByText(/education/i)).toBeInTheDocument();
      expect(screen.getByText(/skills/i)).toBeInTheDocument();
      expect(screen.getByText(/experience/i)).toBeInTheDocument();
    });
  });

  test("handles drag & drop upload", async () => {
    render(<App />);
    const dropzone = screen.getByText(/Drag & Drop your resume/i);

    const txtFile = createFile("Projects: Portfolio Website", "resume.txt", "text/plain");
    fireEvent.drop(dropzone, { dataTransfer: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByText(/projects/i)).toBeInTheDocument();
    });
  });

  // 🔹 Expanded ATS score coverage
  test("ATS feedback: Excellent", async () => {
    render(<App />);
    const input = screen.getByLabelText(/upload resume/i);

    // 5 sections → only 1 missing → ATS 85 → Excellent
    const txtFile = createFile(
      "Education: B.Tech\nSkills: React\nExperience: 1 year\nProjects: Website\nContact: email@example.com",
      "resume.txt",
      "text/plain"
    );
    fireEvent.change(input, { target: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Excellent resume structure./i)).toBeInTheDocument();
    });
  });

  test("ATS feedback: Good, but can improve", async () => {
    render(<App />);
    const input = screen.getByLabelText(/upload resume/i);

    // 3 sections → 3 missing → ATS 55 → Good
    const txtFile = createFile(
      "Education: B.Tech\nSkills: React\nExperience: 1 year",
      "resume.txt",
      "text/plain"
    );
    fireEvent.change(input, { target: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Good, but can improve./i)).toBeInTheDocument();
    });
  });

  test("ATS feedback: Low ATS score", async () => {
    render(<App />);
    const input = screen.getByLabelText(/upload resume/i);

    // 2 sections → 4 missing → ATS 40 → Low
    const txtFile = createFile("Education: B.Tech\nSkills: React", "resume.txt", "text/plain");
    fireEvent.change(input, { target: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Low ATS score/i)).toBeInTheDocument();
    });
  });

  test("does not falsely detect 'experience' in 'inexperience'", async () => {
    render(<App />);
    const input = screen.getByLabelText(/upload resume/i);

    const txtFile = createFile("I lack inexperience but willing to learn", "resume.txt", "text/plain");
    fireEvent.change(input, { target: { files: [txtFile] } });

    await waitFor(() => {
      const foundSection = screen.getByText(/Found Sections/i).closest("div");
      expect(within(foundSection).queryByText(/^experience$/i)).not.toBeInTheDocument();
    });
  });

  test("download resume PDF triggers window.print", async () => {
    const printMock = jest.fn();
    const writeMock = jest.fn();
    const closeMock = jest.fn();
    const focusMock = jest.fn();

    window.open = jest.fn(() => ({
      document: { write: writeMock, close: closeMock },
      focus: focusMock,
      print: printMock,
    }));

    render(<App />);
    const input = screen.getByLabelText(/upload resume/i);

    const txtFile = createFile("Education: B.Tech", "resume.txt", "text/plain");
    fireEvent.change(input, { target: { files: [txtFile] } });

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Download Resume PDF/i));
      expect(window.open).toHaveBeenCalled();
      expect(writeMock).toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalled();
      expect(focusMock).toHaveBeenCalled();
      expect(printMock).toHaveBeenCalled();
    });
  });
});
