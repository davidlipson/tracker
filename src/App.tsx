import { useState } from 'react';
import { useTracker } from './hooks/useTracker';
import { Grid } from './components/Grid';
import { Navigation } from './components/Navigation';
import { AddActivityModal } from './components/AddActivityModal';
import { NoteModal } from './components/NoteModal';
import './App.css';

function App() {
  const {
    activities,
    visibleDates,
    allDates,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    toggleLog,
    addActivity,
    deleteActivity,
    editActivity,
    isLogged,
    getNoteForDate,
    saveNote,
    viewInfo,
    isLoading,
  } = useTracker();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteModalDate, setNoteModalDate] = useState<string | null>(null);

  const handleNoteClick = (date: string) => {
    setNoteModalDate(date);
  };

  const handleNoteClose = () => {
    setNoteModalDate(null);
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="app-main">
        <div className="desktop-only">
          <Navigation
            viewInfo={viewInfo}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onBack={goBack}
            onForward={goForward}
          />
        </div>

        <Grid
          activities={activities}
          visibleDates={visibleDates}
          allDates={allDates}
          isLogged={isLogged}
          onToggle={toggleLog}
          onAddActivity={() => setIsModalOpen(true)}
          onDeleteActivity={deleteActivity}
          onEditActivity={editActivity}
          getNoteForDate={getNoteForDate}
          onNoteClick={handleNoteClick}
        />
      </main>

      <AddActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addActivity}
      />

      <NoteModal
        isOpen={!!noteModalDate}
        date={noteModalDate || ''}
        initialText={noteModalDate ? (getNoteForDate(noteModalDate)?.text || '') : ''}
        onClose={handleNoteClose}
        onSave={saveNote}
      />
    </div>
  );
}

export default App;
