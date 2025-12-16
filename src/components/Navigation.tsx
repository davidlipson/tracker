import './Navigation.css';

interface NavigationProps {
  viewInfo: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}

export function Navigation({
  viewInfo,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: NavigationProps) {
  return (
    <div className="navigation">
      <button
        className="nav-button"
        onClick={onBack}
        disabled={!canGoBack}
        aria-label="Previous week"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      
      <div className="view-info">
        <span className="view-dates">{viewInfo}</span>
      </div>
      
      <button
        className="nav-button"
        onClick={onForward}
        disabled={!canGoForward}
        aria-label="Next week"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

