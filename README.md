# Tracker

A beautiful React TypeScript web app for tracking daily activities and building habits.

![Tracker App](https://via.placeholder.com/800x400?text=Tracker+App)

## Features

- **Grid View**: Visual calendar grid showing activities vs. days
- **Activity Tracking**: Click cells to toggle activity completion
- **Time Navigation**: Navigate forward/backward through weeks (bounded by start date and today)
- **Add Activities**: Easily add new activities with the plus button
- **Today Highlighting**: Current day is highlighted in the grid
- **Sample Data**: Comes with pre-populated sample activities and logs for demonstration

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **date-fns** for date manipulation
- **DM Sans** font for a modern look
- **CSS Variables** for theming

## Data Structure

The app is designed with a future PostgreSQL database in mind:

### Activities Table
```typescript
interface Activity {
  id: string;           // UUID primary key
  name: string;         // Activity name
  created_at: Date;     // When it was created
  order_index: number;  // Display order
}
```

### Logs Table
```typescript
interface Log {
  id: string;          // UUID primary key
  activity_id: string; // Foreign key to activities
  logged_date: string; // Date in 'YYYY-MM-DD' format
  is_logged: boolean;  // Whether activity was completed
  created_at: Date;    // When it was logged
}
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

1. **View Activities**: The grid shows your activities on the left and days across the top
2. **Toggle Completion**: Click on any cell to mark an activity as done/undone for that day
3. **Navigate Time**: Use the left/right arrows to navigate between weeks
4. **Add Activity**: Click the "Add activity" button at the bottom to create a new activity

## Project Structure

```
src/
├── components/
│   ├── AddActivityModal.tsx   # Modal for adding new activities
│   ├── AddActivityModal.css
│   ├── Grid.tsx               # Main activity grid component
│   ├── Grid.css
│   ├── Navigation.tsx         # Time navigation controls
│   └── Navigation.css
├── hooks/
│   └── useTracker.ts          # Main hook for tracker logic
├── store/
│   └── dataStore.ts           # In-memory data store (future: API calls)
├── types/
│   └── index.ts               # TypeScript interfaces
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## Future Improvements

- [ ] PostgreSQL database integration
- [ ] User authentication
- [ ] Activity streaks and statistics
- [ ] Activity categories/colors
- [ ] Export data as CSV
- [ ] Mobile-responsive design improvements

## License

MIT
