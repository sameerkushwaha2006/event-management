import {
  User, Event, Registration, Ticket, EventCategory,
  LoginForm, RegisterForm, EventFilters, SortOption,
  ApiResponse, PaginatedResponse, CreateEventForm,
  EventStatus, RegistrationStatus, PaymentStatus
} from '@/types';

// Mock Data Generators
const generateUsers = (): User[] => {
  const users: User[] = [
    {
      id: '1',
      name: 'John Admin',
      email: 'admin@ems.com',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Jane Organizer',
      email: 'jane@ems.com',
      role: 'user',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      name: 'Bob Attendee',
      email: 'bob@ems.com',
      role: 'user',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    }
  ];

  // Generate more users
  for (let i = 4; i <= 50; i++) {
    users.push({
      id: i.toString(),
      name: `User ${i}`,
      email: `user${i}@ems.com`,
      role: i % 10 === 0 ? 'admin' : 'user',
      createdAt: new Date(2024, 0, i).toISOString(),
      updatedAt: new Date(2024, 0, i).toISOString(),
    });
  }

  return users;
};

const generateCategories = (): EventCategory[] => [
  { id: '1', name: 'Technology', color: '#1976d2', icon: 'computer' },
  { id: '2', name: 'Business', color: '#2e7d32', icon: 'business' },
  { id: '3', name: 'Education', color: '#ed6c02', icon: 'school' },
  { id: '4', name: 'Entertainment', color: '#dc004e', icon: 'music_note' },
  { id: '5', name: 'Sports', color: '#9c27b0', icon: 'sports_soccer' },
  { id: '6', name: 'Health', color: '#0097a7', icon: 'health_and_safety' },
  { id: '7', name: 'Art', color: '#e91e63', icon: 'palette' },
  { id: '8', name: 'Food', color: '#ff5722', icon: 'restaurant' },
];

const generateEvents = (): Event[] => {
  const events: Event[] = [];
  const categories = generateCategories();
  const organizers = generateUsers().filter(u => u.role === 'user');

  for (let i = 1; i <= 100; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90));
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 8) + 2);

    events.push({
      id: i.toString(),
      title: `Event ${i}: ${['Tech Conference', 'Business Summit', 'Art Exhibition', 'Music Festival', 'Sports Tournament'][i % 5]}`,
      description: `This is an amazing event that brings together enthusiasts and professionals. Join us for an unforgettable experience filled with learning, networking, and entertainment.`,
      category: categories[i % categories.length],
      location: {
        type: Math.random() > 0.3 ? 'physical' : 'virtual',
        venue: Math.random() > 0.3 ? `Venue ${i}` : undefined,
        address: Math.random() > 0.3 ? `${i} Main Street, City ${i % 10}` : undefined,
        city: Math.random() > 0.3 ? `City ${i % 10}` : undefined,
        country: 'USA',
        virtualUrl: Math.random() > 0.7 ? `https://zoom.us/event${i}` : undefined,
        virtualPlatform: Math.random() > 0.7 ? 'Zoom' : undefined,
      },
      date: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        timezone: 'America/New_York',
      },
      organizer: organizers[i % organizers.length],
      tickets: [
        {
          id: `${i}-1`,
          name: 'General Admission',
          description: 'Standard access to the event',
          price: Math.random() * 100 + 10,
          currency: 'USD',
          quantity: 100,
          available: Math.floor(Math.random() * 100),
          salesStart: new Date().toISOString(),
          salesEnd: startDate.toISOString(),
          minPerOrder: 1,
          maxPerOrder: 10,
        },
        {
          id: `${i}-2`,
          name: 'VIP Access',
          description: 'Premium experience with exclusive benefits',
          price: Math.random() * 200 + 100,
          currency: 'USD',
          quantity: 20,
          available: Math.floor(Math.random() * 20),
          salesStart: new Date().toISOString(),
          salesEnd: startDate.toISOString(),
          minPerOrder: 1,
          maxPerOrder: 5,
        },
      ],
      bannerImage: `https://picsum.photos/seed/event${i}/800/400.jpg`,
      images: [`https://picsum.photos/seed/event${i}-1/400/300.jpg`],
      settings: {
        isPublic: true,
        requireApproval: Math.random() > 0.7,
        allowRegistrationCancellation: Math.random() > 0.3,
        cancellationDeadline: Math.random() > 0.5 ? new Date(startDate.getTime() - 24 * 60 * 60 * 1000).toISOString() : undefined,
        refundPolicy: 'Full refund available up to 7 days before the event.',
      },
      status: ['draft', 'published', 'published', 'published', 'cancelled'][i % 5] as EventStatus,
      createdAt: new Date(2024, 0, i).toISOString(),
      updatedAt: new Date(2024, 0, i).toISOString(),
      maxAttendees: Math.floor(Math.random() * 500) + 50,
      currentAttendees: Math.floor(Math.random() * 200),
    });
  }

  return events;
};

// Local Storage Helpers
const getStorageData = <T>(key: string, defaultData: T[]): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
  } catch {
    return defaultData;
  }
};

const setStorageData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Initialize mock data if not exists
const initializeMockData = () => {
  if (!localStorage.getItem('users')) {
    setStorageData('users', generateUsers());
  }
  if (!localStorage.getItem('events')) {
    setStorageData('events', generateEvents());
  }
  if (!localStorage.getItem('categories')) {
    setStorageData('categories', generateCategories());
  }
  if (!localStorage.getItem('registrations')) {
    setStorageData('registrations', []);
  }
  if (!localStorage.getItem('tickets')) {
    setStorageData('tickets', []);
  }
};

// API Simulation
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const simulateError = (errorRate: number = 0.1) => {
  if (Math.random() < errorRate) {
    throw new Error('Network error occurred. Please try again.');
  }
};

// Mock API Class
class MockApi {
  constructor() {
    initializeMockData();
  }

  // Authentication APIs
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    await simulateDelay();
    simulateError();

    const users = getStorageData<User>('users', []);
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Mock password check (always success for demo)
    const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));

    // Store auth state
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { success: true, data: { user, token } };
  }

  async register(userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> {
    await simulateDelay();
    simulateError();

    const users = getStorageData<User>('users', []);
    const existingUser = users.find(u => u.email === userData.email);

    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      name: userData.name,
      email: userData.email,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorageData('users', users);

    const token = btoa(JSON.stringify({ userId: newUser.id, timestamp: Date.now() }));

    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return { success: true, data: { user: newUser, token } };
  }

  async logout(): Promise<ApiResponse<null>> {
    await simulateDelay();

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    return { success: true, data: null };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await simulateDelay();

    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
      return { success: false, error: 'No authenticated user' };
    }

    const user = JSON.parse(currentUserData) as User;
    return { success: true, data: user };
  }

  // Event APIs
  async getEvents(
    filters: EventFilters = {},
    sort: SortOption = { field: 'date', direction: 'asc' },
    page: number = 1,
    limit: number = 12
  ): Promise<ApiResponse<PaginatedResponse<Event>>> {
    await simulateDelay();
    simulateError();

    let events = getStorageData<Event>('events', []);

    // Apply filters
    if (filters.category) {
      events = events.filter(e => e.category.id === filters.category);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm) ||
        e.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateRange) {
      events = events.filter(e => {
        const eventDate = new Date(e.date.start);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    if (filters.isVirtual !== undefined) {
      events = events.filter(e => {
        if (filters.isVirtual) {
          return e.location.type === 'virtual' || e.location.type === 'hybrid';
        }
        return e.location.type === 'physical' || e.location.type === 'hybrid';
      });
    }

    // Apply sorting
    events.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sort.field) {
        case 'date':
          aVal = new Date(a.date.start);
          bVal = new Date(b.date.start);
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'price':
          aVal = Math.min(...a.tickets.map(t => t.price));
          bVal = Math.min(...b.tickets.map(t => t.price));
          break;
        case 'popularity':
          aVal = a.currentAttendees;
          bVal = b.currentAttendees;
          break;
        default:
          return 0;
      }

      if (sort.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const total = events.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = events.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        items: paginatedEvents,
        total,
        page,
        limit,
        hasNext: endIndex < total,
        hasPrev: page > 1,
      },
    };
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    await simulateDelay();
    simulateError();

    const events = getStorageData<Event>('events', []);
    const event = events.find(e => e.id === id);

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    return { success: true, data: event };
  }

  async createEvent(eventData: CreateEventForm): Promise<ApiResponse<Event>> {
    await simulateDelay();
    simulateError();

    const events = getStorageData<Event>('events', []);
    const currentUserData = localStorage.getItem('currentUser');

    if (!currentUserData) {
      return { success: false, error: 'User not authenticated' };
    }

    const currentUser = JSON.parse(currentUserData) as User;

    const newEvent: Event = {
      id: (events.length + 1).toString(),
      ...eventData,
      tickets: eventData.tickets.map((ticket, index) => ({
        ...ticket,
        id: `${events.length + 1}-${index + 1}`,
        available: ticket.quantity,
      })),
      organizer: currentUser,
      bannerImage: eventData.bannerImage || `https://picsum.photos/seed/event${events.length + 1}/800/400.jpg`,
      images: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentAttendees: 0,
    };

    events.push(newEvent);
    setStorageData('events', events);

    return { success: true, data: newEvent };
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> {
    await simulateDelay();
    simulateError();

    const events = getStorageData<Event>('events', []);
    const eventIndex = events.findIndex(e => e.id === id);

    if (eventIndex === -1) {
      return { success: false, error: 'Event not found' };
    }

    events[eventIndex] = {
      ...events[eventIndex],
      ...eventData,
      updatedAt: new Date().toISOString(),
    };

    setStorageData('events', events);

    return { success: true, data: events[eventIndex] };
  }

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    await simulateDelay();
    simulateError();

    const events = getStorageData<Event>('events', []);
    const filteredEvents = events.filter(e => e.id !== id);

    if (events.length === filteredEvents.length) {
      return { success: false, error: 'Event not found' };
    }

    setStorageData('events', filteredEvents);

    return { success: true, data: null };
  }

  // Registration APIs
  async registerForEvent(
    eventId: string,
    ticketTypeId: string,
    quantity: number,
    registrationData: any
  ): Promise<ApiResponse<Registration>> {
    await simulateDelay();
    simulateError();

    const events = getStorageData<Event>('events', []);
    const event = events.find(e => e.id === eventId);

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const ticketType = event.tickets.find(t => t.id === ticketTypeId);
    if (!ticketType) {
      return { success: false, error: 'Ticket type not found' };
    }

    if (ticketType.available < quantity) {
      return { success: false, error: 'Not enough tickets available' };
    }

    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
      return { success: false, error: 'User not authenticated' };
    }

    const currentUser = JSON.parse(currentUserData) as User;
    const registrations = getStorageData<Registration>('registrations', []);

    const newRegistration: Registration = {
      id: (registrations.length + 1).toString(),
      eventId,
      userId: currentUser.id,
      ticketTypeId,
      quantity,
      totalPaid: ticketType.price * quantity,
      currency: ticketType.currency,
      status: 'confirmed',
      registrationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    registrations.push(newRegistration);
    setStorageData('registrations', registrations);

    // Update available tickets
    ticketType.available -= quantity;
    event.currentAttendees += quantity;
    setStorageData('events', events);

    return { success: true, data: newRegistration };
  }

  async getUserRegistrations(userId: string): Promise<ApiResponse<Registration[]>> {
    await simulateDelay();

    const registrations = getStorageData<Registration>('registrations', []);
    const userRegistrations = registrations.filter(r => r.userId === userId);

    return { success: true, data: userRegistrations };
  }

  async getEventRegistrations(eventId: string): Promise<ApiResponse<Registration[]>> {
    await simulateDelay();

    const registrations = getStorageData<Registration>('registrations', []);
    const eventRegistrations = registrations.filter(r => r.eventId === eventId);

    return { success: true, data: eventRegistrations };
  }

  // Categories API
  async getCategories(): Promise<ApiResponse<EventCategory[]>> {
    await simulateDelay();

    const categories = getStorageData<EventCategory>('categories', []);

    return { success: true, data: categories };
  }

  // Dashboard APIs
  async getDashboardStats(userId?: string): Promise<ApiResponse<any>> {
    await simulateDelay();

    const events = getStorageData<Event>('events', []);
    const registrations = getStorageData<Registration>('registrations', []);
    const users = getStorageData<User>('users', []);

    let userEvents = events;
    let userRegistrations = registrations;

    if (userId) {
      userEvents = events.filter(e => e.organizer.id === userId);
      userRegistrations = registrations.filter(r => r.userId === userId);
    }

    const stats = {
      totalEvents: userEvents.length,
      totalRegistrations: userRegistrations.length,
      totalRevenue: userRegistrations.reduce((sum, r) => sum + r.totalPaid, 0),
      activeUsers: users.length,
      upcomingEvents: userEvents.filter(e => new Date(e.date.start) > new Date()).length,
    };

    return { success: true, data: stats };
  }
}

// Export singleton instance
export const mockApi = new MockApi();