import { useState } from "react";
import { FiChevronRight, FiChevronLeft, FiX } from "react-icons/fi";

interface Step {
  title: string;
  description: string;
  highlight: string;
  tooltipPos: { top: string; left: string; transform?: string };
  arrowDir: "left" | "right" | "top" | "bottom";
}

const STEPS: Step[] = [
  {
    title: "Journals",
    description: "Create and organize your journals here. Each journal holds chapters and entries. Click the + button to add a new journal, or click a journal to select it.",
    highlight: "sidebar",
    tooltipPos: { top: "50%", left: "220px", transform: "translateY(-50%)" },
    arrowDir: "left",
  },
  {
    title: "Chapters & Entries",
    description: "Chapters help you structure your entries within a journal. Click a chapter to see its entries, or click an entry to open it in the editor.",
    highlight: "chapter-list",
    tooltipPos: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    arrowDir: "top",
  },
  {
    title: "Note Editor",
    description: "Write your thoughts here with the rich text editor. Use the toolbar above to format text, add lists, insert images, and more.",
    highlight: "editor",
    tooltipPos: { top: "50%", right: "80px", transform: "translateY(-50%)" },
    arrowDir: "right",
  },
  {
    title: "Title Bar",
    description: "Use the top bar to search across all entries, pin the window to stay on top, or open settings for backup and restore options.",
    highlight: "title-bar",
    tooltipPos: { top: "60px", left: "50%", transform: "translateX(-50%)" },
    arrowDir: "top",
  },
  {
    title: "Formatting Toolbar",
    description: "Bold, italic, underline, headings, lists, text alignment, task lists, and images — format your notes exactly how you want.",
    highlight: "editor-toolbar",
    tooltipPos: { top: "160px", left: "50%", transform: "translateX(-50%)" },
    arrowDir: "top",
  },
];

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export default function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onDismiss();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="tutorial-overlay">
      {STEPS.map((s, i) => (
        <div
          key={i}
          className={`tutorial-highlight tutorial-highlight--${s.highlight} ${i === step ? "active" : ""}`}
        />
      ))}
      <div
        className="tutorial-tooltip"
        style={
          current.tooltipPos as React.CSSProperties
        }
      >
        <div className={`tutorial-arrow tutorial-arrow--${current.arrowDir}`} />
        <div className="tutorial-step-indicator">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`tutorial-dot ${i === step ? "active" : i < step ? "done" : ""}`}
            />
          ))}
        </div>
        <h3 className="tutorial-title">{current.title}</h3>
        <p className="tutorial-desc">{current.description}</p>
        <div className="tutorial-actions">
          <button className="btn tutorial-skip" onClick={onDismiss}>
            <FiX size={14} /> Skip
          </button>
          <div className="tutorial-nav">
            {step > 0 && (
              <button className="btn" onClick={handlePrev}>
                <FiChevronLeft size={16} /> Back
              </button>
            )}
            <button className="btn btn-primary" onClick={handleNext}>
              {step < STEPS.length - 1 ? "Next" : "Got it!"} <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
