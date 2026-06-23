let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
if (baseUrl && !baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
  baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
}
const API_BASE_URL = baseUrl;

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
}

export interface Activity {
  time?: string;
  activity: string;
  location?: string;
}

export interface DailyItinerary {
  _id?: string;
  day: number;
  theme?: string;
  activities: string[];
}

export interface EstimatedBudget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface Hotel {
  _id?: string;
  name: string;
  category: 'Budget Friendly' | 'Mid Range' | 'Luxury';
  rating: string;
  priceEstimate?: string;
}

export interface PackingItem {
  _id?: string;
  name: string;
  category: 'Essentials' | 'Clothing' | 'Gear' | 'Toiletries' | 'Other';
  packed: boolean;
}

export interface Trip {
  _id: string;
  destination: string;
  duration: number;
  budgetLevel: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: DailyItinerary[];
  estimatedBudget: EstimatedBudget;
  hotels: Hotel[];
  weatherForecast: string;
  packingChecklist: PackingItem[];
  createdAt: string;
}

// Get JWT token from storage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Set JWT token
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

// Clear JWT token and user info
export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }
};

// Fetch wrapper with auth header
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login?expired=true';
    }
    throw new Error('Session expired. Please log in again.');
  }

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Something went wrong');
  }

  return responseData as T;
};

// Auth API Methods
export const apiAuth = {
  register: async (name: string, email: string, password: string) => {
    const data = await request<{ _id: string; name: string; email: string; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    localStorage.setItem('authUser', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await request<{ _id: string; name: string; email: string; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    localStorage.setItem('authUser', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
    return data;
  },

  logout: () => {
    clearAuth();
  },

  getCurrentUser: async () => {
    if (!getToken()) return null;
    try {
      return await request<UserProfile>('/auth/me');
    } catch {
      return null;
    }
  },

  getLocalUser: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('authUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserProfile;
    } catch {
      return null;
    }
  }
};

// Trips API Methods
export const apiTrips = {
  getAll: async () => {
    return request<Trip[]>('/trips');
  },

  getById: async (id: string) => {
    return request<Trip>(`/trips/${id}`);
  },

  create: async (tripData: { destination: string; duration: number; budgetLevel: 'Low' | 'Medium' | 'High'; interests: string[] }) => {
    return request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  update: async (id: string, tripData: Partial<Trip>) => {
    return request<Trip>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  },

  delete: async (id: string) => {
    return request<{ message: string }>(`/trips/${id}`, {
      method: 'DELETE',
    });
  },

  regenerateDay: async (id: string, day: number, prompt: string) => {
    return request<Trip>(`/trips/${id}/regenerate-day`, {
      method: 'POST',
      body: JSON.stringify({ day, prompt }),
    });
  }
};
