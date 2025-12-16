import { format, parseISO } from "date-fns";
import { useState, useMemo, useRef } from "react";
import { Activity, Note } from "../types";
import "./Grid.css";

const MOBILE_VISIBLE_ACTIVITIES = 3; // Number of activities visible at once on mobile

interface GridProps {
  activities: Activity[];
  visibleDates: string[];
  allDates: string[];
  isLogged: (activityId: string, date: string) => boolean;
  onToggle: (activityId: string, date: string) => void;
  onAddActivity: () => void;
  onDeleteActivity: (activityId: string) => void;
  onEditActivity: (activityId: string, newName: string) => void;
  getNoteForDate: (date: string) => Note | undefined;
  onNoteClick: (date: string) => void;
}

export function Grid({
  activities,
  visibleDates,
  allDates,
  isLogged,
  onToggle,
  onAddActivity,
  onDeleteActivity,
  onEditActivity,
  getNoteForDate,
  onNoteClick,
}: GridProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [mobileActivityIndex, setMobileActivityIndex] = useState(0);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Calculate visible activities for mobile (notes + activities)
  const mobileVisibleActivities = useMemo(() => {
    return activities.slice(
      mobileActivityIndex,
      mobileActivityIndex + MOBILE_VISIBLE_ACTIVITIES
    );
  }, [activities, mobileActivityIndex]);

  const goLeftMobile = () => {
    if (mobileActivityIndex > 0) {
      setMobileActivityIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const goRightMobile = () => {
    if (mobileActivityIndex + MOBILE_VISIBLE_ACTIVITIES < activities.length) {
      setMobileActivityIndex((prev) =>
        Math.min(activities.length - MOBILE_VISIBLE_ACTIVITIES, prev + 1)
      );
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left - go right (show next activities)
        goRightMobile();
      } else {
        // Swiped right - go left (show previous activities)
        goLeftMobile();
      }
    }
    
    touchStartX.current = null;
  };

  // Start editing an activity name
  const startEditing = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setEditingName(activity.name);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  // Save the edited name
  const saveEdit = () => {
    if (editingActivityId && editingName.trim()) {
      onEditActivity(editingActivityId, editingName.trim());
    }
    setEditingActivityId(null);
    setEditingName("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingActivityId(null);
    setEditingName("");
  };

  // Handle key press in edit input
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // Handle trackpad horizontal scroll (two-finger swipe) for desktop testing
  const wheelAccumulator = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    // Only handle horizontal scroll (deltaX)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      wheelAccumulator.current += e.deltaX;
      const threshold = 100; // Accumulate scroll before triggering
      
      if (wheelAccumulator.current > threshold) {
        goRightMobile();
        wheelAccumulator.current = 0;
      } else if (wheelAccumulator.current < -threshold) {
        goLeftMobile();
        wheelAccumulator.current = 0;
      }
    }
  };

  return (
    <>
      {/* Desktop Grid */}
      <div className="grid-container desktop-grid" onMouseLeave={() => setHoveredCell(null)}>
        <div className="grid">
          {/* Header row with dates */}
          <div className="grid-header">
            <div className="header-cell activity-header"></div>
            {visibleDates.map((date) => {
              const parsedDate = parseISO(date);
              const dayName = format(parsedDate, "EEE");
              const dayNum = format(parsedDate, "d");
              const isToday = date === todayStr;

              return (
                <div
                  key={date}
                  className={`header-cell date-header ${isToday ? "today" : ""}`}
                >
                  <span className="day-name">{dayName}</span>
                  <span className="day-num">{dayNum}</span>
                </div>
              );
            })}
          </div>

          {/* Notes row - first before activities */}
          <div className="grid-row notes-row">
            <div className={`activity-cell notes-cell ${hoveredCell !== null && hoveredCell.row === 0 ? "row-highlighted" : ""}`}>
              <div className="notes-icon">
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
              <span className="activity-name">Notes</span>
            </div>
            {visibleDates.map((date, colIndex) => {
              const note = getNoteForDate(date);
              const hasNote = !!note;
              const isToday = date === todayStr;
              const isRowHighlighted = hoveredCell !== null && hoveredCell.row === 0 && colIndex < hoveredCell.col;
              const isColHighlighted = hoveredCell !== null && hoveredCell.row > 0 && hoveredCell.col === colIndex;

              return (
                <div
                  key={`note-${date}`}
                  className={`log-cell note-cell ${hasNote ? "has-note" : ""} ${isToday ? "today" : ""} ${isRowHighlighted || isColHighlighted ? "cell-highlighted" : ""}`}
                  onClick={() => onNoteClick(date)}
                  onMouseEnter={() => setHoveredCell({ row: 0, col: colIndex })}
                  title={note?.text}
                >
                  {hasNote ? (
                    <div className="note-indicator">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 13H8" strokeLinecap="round" />
                        <path d="M16 17H8" strokeLinecap="round" />
                        <path d="M10 9H8" strokeLinecap="round" />
                      </svg>
                    </div>
                  ) : (
                    <div className="note-add">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Activity rows */}
          {activities.map((activity, rowIndex) => {
            const activityRowIndex = rowIndex + 1; // +1 because notes row is row 0
            const isCurrentRow = hoveredCell !== null && hoveredCell.row === activityRowIndex;
            
            return (
            <div key={activity.id} className="grid-row">
              <div className={`activity-cell ${isCurrentRow ? "row-highlighted" : ""}`}>
                {editingActivityId === activity.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    className="activity-name-input"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleEditKeyDown}
                  />
                ) : (
                  <span
                    className="activity-name editable"
                    onClick={() => startEditing(activity)}
                    title="Click to edit"
                  >
                    {activity.name}
                  </span>
                )}
                <button
                  className="delete-activity-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${activity.name}"?`)) {
                      onDeleteActivity(activity.id);
                    }
                  }}
                  title="Delete activity"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {visibleDates.map((date, colIndex) => {
                const logged = isLogged(activity.id, date);
                const isToday = date === todayStr;
                const isRowHighlighted = hoveredCell !== null && hoveredCell.row === activityRowIndex && colIndex < hoveredCell.col;
                const isColHighlighted = hoveredCell !== null && hoveredCell.col === colIndex && activityRowIndex < hoveredCell.row;

                return (
                  <div
                    key={`${activity.id}-${date}`}
                    className={`log-cell ${logged ? "logged" : ""} ${isToday ? "today" : ""} ${isRowHighlighted || isColHighlighted ? "cell-highlighted" : ""}`}
                    onClick={() => onToggle(activity.id, date)}
                    onMouseEnter={() => setHoveredCell({ row: activityRowIndex, col: colIndex })}
                  >
                    {logged && (
                      <div className="check-mark">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
          })}

          {/* Add activity row */}
          <div className="grid-row add-row">
            <div className="activity-cell add-cell" onClick={onAddActivity}>
              <div className="add-button">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </div>
              <span className="add-text">Add activity</span>
            </div>
            {visibleDates.map((date) => (
              <div key={`add-${date}`} className="log-cell empty-placeholder" />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Grid - Flipped orientation with swipe support */}
      <div 
        className="grid-container mobile-grid"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div className="mobile-grid-inner">
          {/* Sticky header with Notes + activities */}
          <div className="mobile-header">
            <div className="mobile-date-header"></div>
            {/* Notes column header - always first */}
            <div className="mobile-activity-header notes-header">
              <span className="mobile-activity-name">Notes</span>
            </div>
            {mobileVisibleActivities.map((activity) => (
              <div key={activity.id} className="mobile-activity-header">
                <span className="mobile-activity-name">{activity.name}</span>
              </div>
            ))}
          </div>

          {/* Scrollable date rows */}
          <div className="mobile-body">
            {allDates.map((date) => {
              const parsedDate = parseISO(date);
              const dayName = format(parsedDate, "EEE");
              const dayNum = format(parsedDate, "d");
              const month = format(parsedDate, "MMM");
              const isToday = date === todayStr;
              const note = getNoteForDate(date);
              const hasNote = !!note;

              return (
                <div
                  key={date}
                  className={`mobile-row ${isToday ? "today" : ""}`}
                >
                  <div className="mobile-date-cell">
                    <span className="mobile-day-name">{dayName}</span>
                    <span className="mobile-day-num">{dayNum}</span>
                    <span className="mobile-month">{month}</span>
                  </div>
                  {/* Notes column - always first */}
                  <div
                    className={`mobile-log-cell mobile-note-cell ${hasNote ? "has-note" : ""}`}
                    onClick={() => onNoteClick(date)}
                  >
                    {hasNote ? (
                      <div className="note-indicator">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 13H8" strokeLinecap="round" />
                          <path d="M16 17H8" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : (
                      <div className="note-add">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {mobileVisibleActivities.map((activity) => {
                    const logged = isLogged(activity.id, date);
                    return (
                      <div
                        key={`${activity.id}-${date}`}
                        className={`mobile-log-cell ${logged ? "logged" : ""}`}
                        onClick={() => onToggle(activity.id, date)}
                      >
                        {logged && (
                          <div className="check-mark">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path
                                d="M5 13l4 4L19 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Floating Add Button */}
          <button className="mobile-fab" onClick={onAddActivity}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
