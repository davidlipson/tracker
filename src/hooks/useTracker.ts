import { useState, useCallback, useMemo, useEffect } from "react";
import {
  format,
  addDays,
  subDays,
  startOfDay,
  differenceInDays,
} from "date-fns";
import { dataStore } from "../store/dataStore";
import { Activity, Log, Note } from "../types";

const VISIBLE_DAYS = 7; // Number of days visible at once on desktop

export function useTracker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewStartDate, setViewStartDate] = useState<Date>(() => {
    return subDays(startOfDay(new Date()), VISIBLE_DAYS - 1);
  });

  // Initialize data store
  useEffect(() => {
    const init = async () => {
      await dataStore.initialize();
      setActivities(dataStore.getActivities());
      setLogs(dataStore.getLogs());
      setNotes(dataStore.getNotes());
      setIsLoading(false);
    };
    init();
  }, []);

  const startDate = dataStore.getStartDate();
  const today = startOfDay(new Date());

  // Calculate visible date range for desktop
  const visibleDates = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < VISIBLE_DAYS; i++) {
      const date = addDays(viewStartDate, i);
      dates.push(format(date, "yyyy-MM-dd"));
    }
    return dates;
  }, [viewStartDate]);

  // Calculate all dates from start to today (for mobile - reversed so today is first)
  const allDates = useMemo(() => {
    const dates: string[] = [];
    const totalDays = differenceInDays(today, startDate) + 1;
    for (let i = 0; i < totalDays; i++) {
      const date = subDays(today, i);
      dates.push(format(date, "yyyy-MM-dd"));
    }
    return dates;
  }, [startDate, today]);

  // Check if we can navigate forward/backward
  const canGoBack = useMemo(() => {
    return viewStartDate > startDate;
  }, [viewStartDate, startDate]);

  const canGoForward = useMemo(() => {
    const lastVisibleDate = addDays(viewStartDate, VISIBLE_DAYS - 1);
    return lastVisibleDate < today;
  }, [viewStartDate, today]);

  // Navigation functions
  const goBack = useCallback(() => {
    if (canGoBack) {
      setViewStartDate((prev) => {
        const newDate = subDays(prev, VISIBLE_DAYS);
        if (newDate < startDate) {
          return startDate;
        }
        return newDate;
      });
    }
  }, [canGoBack, startDate]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      setViewStartDate((prev) => {
        const newDate = addDays(prev, VISIBLE_DAYS);
        const maxStartDate = subDays(today, VISIBLE_DAYS - 1);
        if (newDate > maxStartDate) {
          return maxStartDate;
        }
        return newDate;
      });
    }
  }, [canGoForward, today]);

  // Toggle a log for a specific activity and date
  const toggleLog = useCallback(async (activityId: string, date: string) => {
    await dataStore.toggleLog(activityId, date);
    setLogs(dataStore.getLogs());
  }, []);

  // Add a new activity
  const addActivity = useCallback(async (name: string) => {
    if (name.trim()) {
      await dataStore.addActivity(name.trim());
      setActivities(dataStore.getActivities());
    }
  }, []);

  // Delete an activity
  const deleteActivity = useCallback(async (activityId: string) => {
    await dataStore.deleteActivity(activityId);
    setActivities(dataStore.getActivities());
    setLogs(dataStore.getLogs());
  }, []);

  // Edit an activity name
  const editActivity = useCallback(async (activityId: string, newName: string) => {
    if (newName.trim()) {
      await dataStore.editActivity(activityId, newName.trim());
      setActivities(dataStore.getActivities());
    }
  }, []);

  // Check if a specific activity/date combo is logged
  const isLogged = useCallback(
    (activityId: string, date: string): boolean => {
      return logs.some(
        (log) => log.activity_id === activityId && log.logged_date === date
      );
    },
    [logs]
  );

  // Get note for a specific date
  const getNoteForDate = useCallback(
    (date: string): Note | undefined => {
      return notes.find((note) => note.logged_date === date);
    },
    [notes]
  );

  // Save a note for a specific date
  const saveNote = useCallback(async (date: string, text: string) => {
    if (text.trim()) {
      await dataStore.saveNote(date, text.trim());
    } else {
      await dataStore.deleteNote(date);
    }
    setNotes(dataStore.getNotes());
  }, []);

  // Get current view info for display
  const viewInfo = useMemo(() => {
    const start = format(viewStartDate, "MMM d");
    const end = format(addDays(viewStartDate, VISIBLE_DAYS - 1), "MMM d, yyyy");
    return `${start} - ${end}`;
  }, [viewStartDate]);

  return {
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
  };
}
