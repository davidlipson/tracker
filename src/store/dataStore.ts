import { v4 as uuidv4 } from "uuid";
import { Activity, Log, Note } from "../types";
import { format, subDays } from "date-fns";
import { supabase, DbActivity, DbLog, DbNote } from "../lib/supabase";

// Data store that uses Supabase when available, falls back to in-memory
class DataStore {
  private activities: Activity[] = [];
  private logs: Log[] = [];
  private notes: Note[] = [];
  private startDate: Date;
  private initialized = false;
  private useSupabase = !!supabase;

  constructor() {
    this.startDate = subDays(new Date(), 30);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.useSupabase && supabase) {
      try {
        await this.loadFromSupabase();
        this.initialized = true;
        return;
      } catch (error) {
        console.error("Failed to load from Supabase, using local data:", error);
        this.useSupabase = false;
      }
    }

    // Fallback to sample data
    this.initializeSampleData();
    this.initialized = true;
  }

  private async loadFromSupabase(): Promise<void> {
    if (!supabase) return;

    // Load activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from("activities")
      .select("*")
      .order("order_index");

    if (activitiesError) throw activitiesError;

    this.activities = (activitiesData as DbActivity[]).map((a) => ({
      id: a.id,
      name: a.name,
      created_at: new Date(a.created_at),
      order_index: a.order_index,
    }));

    // Load logs
    const { data: logsData, error: logsError } = await supabase
      .from("logs")
      .select("*");

    if (logsError) throw logsError;

    this.logs = (logsData as DbLog[]).map((l) => ({
      id: l.id,
      activity_id: l.activity_id,
      logged_date: l.logged_date,
      created_at: new Date(l.created_at),
    }));

    // Load notes
    const { data: notesData, error: notesError } = await supabase
      .from("notes")
      .select("*");

    if (notesError) throw notesError;

    this.notes = (notesData as DbNote[]).map((n) => ({
      id: n.id,
      logged_date: n.logged_date,
      text: n.text,
      created_at: new Date(n.created_at),
      updated_at: new Date(n.updated_at),
    }));

    // Set start date based on earliest log or 30 days ago
    if (this.logs.length > 0) {
      const dates = this.logs.map((l) => new Date(l.logged_date));
      const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
      this.startDate = earliest;
    }
  }

  private initializeSampleData() {
    // Add some sample activities
    const sampleActivities = [
      "Exercise",
      "Reading",
      "Music",
      "Work",
      "Friends",
      "Family",
      "Something Different",
    ];
    sampleActivities.forEach((name, index) => {
      this.activities.push({
        id: uuidv4(),
        name,
        created_at: new Date(),
        order_index: index,
      });
    });

    // Add some sample logs for demonstration
    const today = new Date();
    this.activities.forEach((activity) => {
      for (let i = 0; i < 30; i++) {
        if (Math.random() > 0.6) {
          const logDate = subDays(today, i);
          this.logs.push({
            id: uuidv4(),
            activity_id: activity.id,
            logged_date: format(logDate, "yyyy-MM-dd"),
            created_at: new Date(),
          });
        }
      }
    });

    // Add some sample notes
    const sampleNotes = [
      { daysAgo: 0, text: "Feeling productive today!" },
      { daysAgo: 2, text: "Started a new project" },
      { daysAgo: 5, text: "Great workout session" },
    ];
    sampleNotes.forEach(({ daysAgo, text }) => {
      const noteDate = subDays(today, daysAgo);
      this.notes.push({
        id: uuidv4(),
        logged_date: format(noteDate, "yyyy-MM-dd"),
        text,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getActivities(): Activity[] {
    return [...this.activities].sort((a, b) => a.order_index - b.order_index);
  }

  getLogs(): Log[] {
    return [...this.logs];
  }

  getNotes(): Note[] {
    return [...this.notes];
  }

  getLogsForActivity(activityId: string): Log[] {
    return this.logs.filter((log) => log.activity_id === activityId);
  }

  getLogForActivityAndDate(activityId: string, date: string): Log | undefined {
    return this.logs.find(
      (log) => log.activity_id === activityId && log.logged_date === date
    );
  }

  getNoteForDate(date: string): Note | undefined {
    return this.notes.find((note) => note.logged_date === date);
  }

  async addActivity(name: string): Promise<Activity> {
    const maxOrder = Math.max(...this.activities.map((a) => a.order_index), -1);
    const newActivity: Activity = {
      id: uuidv4(),
      name,
      created_at: new Date(),
      order_index: maxOrder + 1,
    };

    if (this.useSupabase && supabase) {
      const { data, error } = await supabase
        .from("activities")
        .insert({
          name: newActivity.name,
          order_index: newActivity.order_index,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to add activity to Supabase:", error);
      } else if (data) {
        newActivity.id = data.id;
        newActivity.created_at = new Date(data.created_at);
      }
    }

    this.activities.push(newActivity);
    return newActivity;
  }

  async toggleLog(activityId: string, date: string): Promise<Log | null> {
    const existingLog = this.getLogForActivityAndDate(activityId, date);

    if (existingLog) {
      // Remove the log (toggle off)
      if (this.useSupabase && supabase) {
        const { error } = await supabase
          .from("logs")
          .delete()
          .eq("id", existingLog.id);

        if (error) {
          console.error("Failed to delete log from Supabase:", error);
        }
      }

      this.logs = this.logs.filter((log) => log.id !== existingLog.id);
      return null;
    } else {
      // Create new log (toggle on)
      const newLog: Log = {
        id: uuidv4(),
        activity_id: activityId,
        logged_date: date,
        created_at: new Date(),
      };

      if (this.useSupabase && supabase) {
        const { data, error } = await supabase
          .from("logs")
          .insert({
            activity_id: activityId,
            logged_date: date,
          })
          .select()
          .single();

        if (error) {
          console.error("Failed to add log to Supabase:", error);
        } else if (data) {
          newLog.id = data.id;
          newLog.created_at = new Date(data.created_at);
        }
      }

      this.logs.push(newLog);
      return newLog;
    }
  }

  async saveNote(date: string, text: string): Promise<Note> {
    const existingNote = this.getNoteForDate(date);

    if (existingNote) {
      // Update existing note
      existingNote.text = text;
      existingNote.updated_at = new Date();

      if (this.useSupabase && supabase) {
        const { error } = await supabase
          .from("notes")
          .update({ text, updated_at: new Date().toISOString() })
          .eq("id", existingNote.id);

        if (error) {
          console.error("Failed to update note in Supabase:", error);
        }
      }

      return existingNote;
    } else {
      // Create new note
      const newNote: Note = {
        id: uuidv4(),
        logged_date: date,
        text,
        created_at: new Date(),
        updated_at: new Date(),
      };

      if (this.useSupabase && supabase) {
        const { data, error } = await supabase
          .from("notes")
          .insert({
            logged_date: date,
            text,
          })
          .select()
          .single();

        if (error) {
          console.error("Failed to add note to Supabase:", error);
        } else if (data) {
          newNote.id = data.id;
          newNote.created_at = new Date(data.created_at);
          newNote.updated_at = new Date(data.updated_at);
        }
      }

      this.notes.push(newNote);
      return newNote;
    }
  }

  async deleteNote(date: string): Promise<void> {
    const note = this.getNoteForDate(date);

    if (note && this.useSupabase && supabase) {
      const { error } = await supabase.from("notes").delete().eq("id", note.id);

      if (error) {
        console.error("Failed to delete note from Supabase:", error);
      }
    }

    this.notes = this.notes.filter((note) => note.logged_date !== date);
  }

  async deleteActivity(activityId: string): Promise<void> {
    if (this.useSupabase && supabase) {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);

      if (error) {
        console.error("Failed to delete activity from Supabase:", error);
      }
    }

    this.activities = this.activities.filter((a) => a.id !== activityId);
    this.logs = this.logs.filter((l) => l.activity_id !== activityId);
  }

  async editActivity(activityId: string, newName: string): Promise<void> {
    const activity = this.activities.find((a) => a.id === activityId);
    if (!activity) return;

    activity.name = newName;

    if (this.useSupabase && supabase) {
      const { error } = await supabase
        .from("activities")
        .update({ name: newName })
        .eq("id", activityId);

      if (error) {
        console.error("Failed to update activity in Supabase:", error);
      }
    }
  }
}

// Singleton instance
export const dataStore = new DataStore();
