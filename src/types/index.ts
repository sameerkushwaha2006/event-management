// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  ...User;
  phone?: string;
  bio?: string;
  organization?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  newsletterSubscription: boolean;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: Location;
  date: {
    start: string;
    end: string;
    timezone: string;
  };
  organizer: User;
  tickets: TicketType[];
  bannerImage?: string;
  images: string[];
  settings: EventSettings;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  maxAttendees?: number;
  currentAttendees: number;
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Location {
  type: 'physical' | 'virtual' | 'hybrid';
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  virtualUrl?: string;
  virtualPlatform?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  available: number;
  salesStart: string;
  salesEnd: string;
  minPerOrder: number;
  maxPerOrder: number;
}

export interface EventSettings {
  isPublic: boolean;
  requireApproval: boolean;
  allowRegistrationCancellation: boolean;
  cancellationDeadline?: string;
  refundPolicy?: string;
  customFields?: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'postponed' | 'completed';

// Registration Types
export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  ticketTypeId: string;
  quantity: number;
  totalPaid: number;
  currency: string;
  status: RegistrationStatus;
  registrationData: RegistrationData;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dietary?: string;
  accessibility?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  customFields?: Record<string, any>;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';

// Ticket Types
export interface Ticket {
  id: string;
  registrationId: string;
  eventId: string;
  ticketId: string;
  qrCode: string;
  attendeeName: string;
  attendeeEmail: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
}

// Payment Types (Mock)
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter and Search Types
export interface EventFilters {
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  isVirtual?: boolean;
  search?: string;
}

export interface SortOption {
  field: 'date' | 'title' | 'price' | 'popularity';
  direction: 'asc' | 'desc';
}

// Context Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: 'user' | 'admin' | null;
}

export interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;
  sort: SortOption;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface CreateEventForm {
  title: string;
  description: string;
  categoryId: string;
  location: Location;
  date: {
    start: string;
    end: string;
    timezone: string;
  };
  tickets: Omit<TicketType, 'id' | 'available'>[];
  settings: EventSettings;
  bannerImage?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  activeUsers: number;
  upcomingEvents: number;
}

export interface EventAnalytics {
  eventId: string;
  views: number;
  registrations: number;
  revenue: number;
  conversionRate: number;
  dailyStats: {
    date: string;
    views: number;
    registrations: number;
  }[];
}