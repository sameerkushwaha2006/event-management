import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Event,
  EventsState,
  EventFilters,
  SortOption,
  CreateEventForm,
  Registration,
  EventCategory,
} from '@/types';
import { mockApi } from '@/services/mockApi';
import toast from 'react-hot-toast';

interface EventsContextType extends EventsState {
  fetchEvents: (filters?: EventFilters, sort?: SortOption, page?: number) => Promise<void>;
  fetchEvent: (id: string) => Promise<Event | null>;
  createEvent: (eventData: CreateEventForm) => Promise<boolean>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  setCurrentEvent: (event: Event | null) => void;
  setFilters: (filters: EventFilters) => void;
  setSort: (sort: SortOption) => void;
  clearError: () => void;
  fetchCategories: () => Promise<EventCategory[]>;
  categories: EventCategory[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

type EventsAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_EVENTS_SUCCESS'; payload: { events: Event[]; total: number; page: number; limit: number } }
  | { type: 'FETCH_EVENT_SUCCESS'; payload: Event }
  | { type: 'FETCH_CATEGORIES_SUCCESS'; payload: EventCategory[] }
  | { type: 'CREATE_EVENT_SUCCESS'; payload: Event }
  | { type: 'UPDATE_EVENT_SUCCESS'; payload: Event }
  | { type: 'DELETE_EVENT_SUCCESS'; payload: string }
  | { type: 'SET_CURRENT_EVENT'; payload: Event | null }
  | { type: 'SET_FILTERS'; payload: EventFilters }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'SET_PAGINATION'; payload: { page: number; limit: number; total: number } }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' };

const eventsReducer = (state: EventsState, action: EventsAction): EventsState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_EVENTS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        events: action.payload.events,
        pagination: {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        },
        error: null,
      };
    case 'FETCH_EVENT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        currentEvent: action.payload,
        error: null,
      };
    case 'FETCH_CATEGORIES_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    case 'CREATE_EVENT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        events: [action.payload, ...state.events],
        error: null,
      };
    case 'UPDATE_EVENT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
        currentEvent: state.currentEvent?.id === action.payload.id ? action.payload : state.currentEvent,
        error: null,
      };
    case 'DELETE_EVENT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        events: state.events.filter(event => event.id !== action.payload),
        currentEvent: state.currentEvent?.id === action.payload ? null : state.currentEvent,
        error: null,
      };
    case 'SET_CURRENT_EVENT':
      return {
        ...state,
        currentEvent: action.payload,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
      };
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
      };
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,
  filters: {},
  sort: { field: 'date', direction: 'asc' },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
};

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const [categories, setCategories] = React.useState<EventCategory[]>([]);

  const fetchEvents = async (
    filters: EventFilters = {},
    sort: SortOption = { field: 'date', direction: 'asc' },
    page: number = 1
  ) => {
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await mockApi.getEvents(filters, sort, page, state.pagination.limit);

      if (response.success && response.data) {
        dispatch({
          type: 'FETCH_EVENTS_SUCCESS',
          payload: {
            events: response.data.items,
            total: response.data.total,
            page: response.data.page,
            limit: response.data.limit,
          },
        });
      } else {
        dispatch({ type: 'FETCH_FAILURE', payload: response.error || 'Failed to fetch events' });
        toast.error(response.error || 'Failed to fetch events');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  const fetchEvent = async (id: string): Promise<Event | null> => {
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await mockApi.getEvent(id);

      if (response.success && response.data) {
        dispatch({ type: 'FETCH_EVENT_SUCCESS', payload: response.data });
        return response.data;
      } else {
        dispatch({ type: 'FETCH_FAILURE', payload: response.error || 'Event not found' });
        toast.error(response.error || 'Event not found');
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch event';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  };

  const createEvent = async (eventData: CreateEventForm): Promise<boolean> => {
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await mockApi.createEvent(eventData);

      if (response.success && response.data) {
        dispatch({ type: 'CREATE_EVENT_SUCCESS', payload: response.data });
        toast.success('Event created successfully!');
        return true;
      } else {
        dispatch({ type: 'FETCH_FAILURE', payload: response.error || 'Failed to create event' });
        toast.error(response.error || 'Failed to create event');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>): Promise<boolean> => {
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await mockApi.updateEvent(id, eventData);

      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_EVENT_SUCCESS', payload: response.data });
        toast.success('Event updated successfully!');
        return true;
      } else {
        dispatch({ type: 'FETCH_FAILURE', payload: response.error || 'Failed to update event' });
        toast.error(response.error || 'Failed to update event');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await mockApi.deleteEvent(id);

      if (response.success) {
        dispatch({ type: 'DELETE_EVENT_SUCCESS', payload: id });
        toast.success('Event deleted successfully!');
        return true;
      } else {
        dispatch({ type: 'FETCH_FAILURE', payload: response.error || 'Failed to delete event' });
        toast.error(response.error || 'Failed to delete event');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const setCurrentEvent = (event: Event | null) => {
    dispatch({ type: 'SET_CURRENT_EVENT', payload: event });
  };

  const setFilters = (filters: EventFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSort = (sort: SortOption) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const fetchCategories = async (): Promise<EventCategory[]> => {
    try {
      const response = await mockApi.getCategories();

      if (response.success && response.data) {
        setCategories(response.data);
        dispatch({ type: 'FETCH_CATEGORIES_SUCCESS', payload: response.data });
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }

    return [];
  };

  useEffect(() => {
    // Initialize categories on mount
    fetchCategories();
  }, []);

  const value: EventsContextType = {
    ...state,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    setCurrentEvent,
    setFilters,
    setSort,
    clearError,
    fetchCategories,
    categories,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = (): EventsContextType => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};