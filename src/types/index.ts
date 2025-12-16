// Types modeled for future PostgreSQL database schema

// Represents a row in the 'activities' table
export interface Activity {
  id: string; // UUID primary key
  name: string;
  created_at: Date;
  order_index: number; // For maintaining display order
}

// Represents a row in the 'logs' table
export interface Log {
  id: string; // UUID primary key
  activity_id: string; // Foreign key to activities.id
  logged_date: string; // Date in 'YYYY-MM-DD' format
  created_at: Date;
}

// Represents a row in the 'notes' table
export interface Note {
  id: string; // UUID primary key
  logged_date: string; // Date in 'YYYY-MM-DD' format
  text: string; // The note content
  created_at: Date;
  updated_at: Date;
}

// Composite type for easier grid rendering
export interface ActivityWithLogs extends Activity {
  logs: Map<string, Log>; // Map of date string to log
}
