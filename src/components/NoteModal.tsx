import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import "./NoteModal.css";

interface NoteModalProps {
  isOpen: boolean;
  date: string;
  initialText: string;
  onClose: () => void;
  onSave: (date: string, text: string) => void;
}

export function NoteModal({
  isOpen,
  date,
  initialText,
  onClose,
  onSave,
}: NoteModalProps) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(date, text);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    // Cmd/Ctrl + Enter to save
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  const parsedDate = parseISO(date);
  const formattedDate = format(parsedDate, "EEEE, MMMM d, yyyy");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal note-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="modal-header">
          <div className="note-modal-title">
            <div className="note-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2>Note</h2>
              <span className="note-date">{formattedDate}</span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your note for this day..."
              rows={5}
            />
            <span className="hint">Press ⌘+Enter to save</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

