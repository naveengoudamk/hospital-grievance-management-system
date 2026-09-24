import apiClient from './client';
import {
  ApiResponse,
  PagedResponse,
  ComplaintSummary,
  ComplaintDetail,
  DashboardMetrics,
  User,
  Category,
  LocationItem,
  QrConfig,
  AuditLog,
  ComplaintStatus,
  Priority,
  Role,
} from '../types';

export const adminApi = {
  getDashboard: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get<ApiResponse<DashboardMetrics>>('/api/admin/dashboard');
    return res.data.data;
  },

  getComplaints: async (params?: {
    status?: string;
    priority?: string;
    categoryId?: number;
    locationId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }): Promise<PagedResponse<ComplaintSummary>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ComplaintSummary>>>('/api/admin/complaints', {
      params,
    });
    return res.data.data;
  },

  getComplaintById: async (id: number): Promise<ComplaintDetail> => {
    const res = await apiClient.get<ApiResponse<ComplaintDetail>>(`/api/admin/complaints/${id}`);
    return res.data.data;
  },

  updatePriority: async (id: number, priority: Priority, remarks?: string): Promise<ComplaintDetail> => {
    const res = await apiClient.put<ApiResponse<ComplaintDetail>>(`/api/admin/complaints/${id}/priority`, {
      priority,
      remarks,
    });
    return res.data.data;
  },

  updateStatus: async (id: number, status: ComplaintStatus, remarks?: string): Promise<ComplaintDetail> => {
    const res = await apiClient.put<ApiResponse<ComplaintDetail>>(`/api/admin/complaints/${id}/status`, {
      status,
      remarks,
    });
    return res.data.data;
  },

  assignComplaint: async (id: number, committeeMemberId: number, remarks?: string): Promise<ComplaintDetail> => {
    const res = await apiClient.put<ApiResponse<ComplaintDetail>>(`/api/admin/complaints/${id}/assign`, {
      committeeMemberId,
      remarks,
    });
    return res.data.data;
  },

  exportComplaintsCsvUrl: (params?: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    return `/api/admin/complaints/export?${searchParams.toString()}`;
  },

  getUsers: async (params?: {
    role?: Role;
    active?: boolean;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<User>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<User>>>('/api/admin/users', { params });
    return res.data.data;
  },

  getCommitteeMembers: async (): Promise<User[]> => {
    const res = await apiClient.get<ApiResponse<User[]>>('/api/admin/committee-members');
    return res.data.data;
  },

  createUser: async (userData: {
    fullName: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
    role: Role;
  }): Promise<User> => {
    const res = await apiClient.post<ApiResponse<User>>('/api/admin/users', userData);
    return res.data.data;
  },

  updateUser: async (
    id: number,
    userData: {
      fullName: string;
      email: string;
      phone?: string;
      role?: Role;
      active?: boolean;
      newPassword?: string;
    }
  ): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>(`/api/admin/users/${id}`, userData);
    return res.data.data;
  },

  toggleUserStatus: async (id: number, active: boolean): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>(`/api/admin/users/${id}/toggle-status`, null, {
      params: { active },
    });
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/api/admin/categories');
    return res.data.data;
  },

  createCategory: async (categoryData: {
    name: string;
    description?: string;
    severityDefault?: string;
    active?: boolean;
  }): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/api/admin/categories', categoryData);
    return res.data.data;
  },

  updateCategory: async (
    id: number,
    categoryData: {
      name: string;
      description?: string;
      severityDefault?: string;
      active?: boolean;
    }
  ): Promise<Category> => {
    const res = await apiClient.put<ApiResponse<Category>>(`/api/admin/categories/${id}`, categoryData);
    return res.data.data;
  },

  getLocations: async (): Promise<LocationItem[]> => {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>('/api/admin/locations');
    return res.data.data;
  },

  createLocation: async (locationData: {
    name: string;
    description?: string;
    floorNumber?: string;
    active?: boolean;
  }): Promise<LocationItem> => {
    const res = await apiClient.post<ApiResponse<LocationItem>>('/api/admin/locations', locationData);
    return res.data.data;
  },

  updateLocation: async (
    id: number,
    locationData: {
      name: string;
      description?: string;
      floorNumber?: string;
      active?: boolean;
    }
  ): Promise<LocationItem> => {
    const res = await apiClient.put<ApiResponse<LocationItem>>(`/api/admin/locations/${id}`, locationData);
    return res.data.data;
  },

  getAuditLogs: async (params?: {
    action?: string;
    entityType?: string;
    entityId?: string;
    username?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<AuditLog>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<AuditLog>>>('/api/admin/audit-logs', { params });
    return res.data.data;
  },

  getQrConfig: async (): Promise<QrConfig> => {
    const res = await apiClient.get<ApiResponse<QrConfig>>('/api/admin/qr');
    return res.data.data;
  },

  generateQr: async (name: string, publicUrl: string): Promise<QrConfig> => {
    const res = await apiClient.post<ApiResponse<QrConfig>>('/api/admin/qr/generate', { name, publicUrl });
    return res.data.data;
  },
};
