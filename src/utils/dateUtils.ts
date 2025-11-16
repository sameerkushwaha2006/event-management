import { format, formatDistanceToNow, isAfter, isBefore, addDays, startOfDay, endOfDay } from 'date-fns';

export const formatDate = (date: string | Date, formatString: string = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'PPp');
};

export const formatShortDate = (date: string | Date): string => {
  return formatDate(date, 'MMM d, yyyy');
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'p');
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const isEventUpcoming = (eventDate: string): boolean => {
  return isAfter(new Date(eventDate), new Date());
};

export const isEventPast = (eventDate: string): boolean => {
  return isBefore(new Date(eventDate), new Date());
};

export const isEventToday = (eventDate: string): boolean => {
  const event = new Date(eventDate);
  const today = new Date();
  return (
    event.getDate() === today.getDate() &&
    event.getMonth() === today.getMonth() &&
    event.getFullYear() === today.getFullYear()
  );
};

export const isEventThisWeek = (eventDate: string): boolean => {
  const event = new Date(eventDate);
  const today = new Date();
  const weekFromNow = addDays(today, 7);
  return isAfter(event, startOfDay(today)) && isBefore(event, endOfDay(weekFromNow));
};

export const getEventStatus = (eventDate: string, status: string): string => {
  if (status === 'cancelled' || status === 'postponed') {
    return status;
  }

  if (isEventPast(eventDate)) {
    return 'completed';
  }

  return status;
};

export const getDateRangeForFilter = (range: 'today' | 'week' | 'month' | 'year') => {
  const now = new Date();
  let start = startOfDay(now);
  let end = endOfDay(now);

  switch (range) {
    case 'today':
      break; // Already set
    case 'week':
      end = endOfDay(addDays(now, 7));
      break;
    case 'month':
      end = endOfDay(addDays(now, 30));
      break;
    case 'year':
      end = endOfDay(addDays(now, 365));
      break;
  }

  return { start: start.toISOString(), end: end.toISOString() };
};

export const isValidEventDate = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Start date must be in the future
  if (isBefore(start, now)) {
    return false;
  }

  // End date must be after start date
  if (isBefore(end, start)) {
    return false;
  }

  return true;
};