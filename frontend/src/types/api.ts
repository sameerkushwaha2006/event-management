export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EventFilters {
  category?: string;
  eventType?: 'in-person' | 'virtual' | 'hybrid';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}