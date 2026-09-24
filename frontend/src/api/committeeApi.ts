import apiClient from './client';
import {
  ApiResponse,
  PagedResponse,
  ComplaintSummary,
  ComplaintDetail,
  Investigation,
  Attachment,
  ComplaintStatus,
  Priority,
  InvestigationStatus,
} from '../types';

export const committeeApi = {
  getDashboard: async (): Promise<Record<string, any>> => {
    const res = await apiClient.get<ApiResponse<Record<string, any>>>('/api/committee/dashboard');
    return res.data.data;
  },

  getAssignedComplaints: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }): Promise<PagedResponse<ComplaintSummary>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ComplaintSummary>>>('/api/committee/complaints', {
      params,
    });
    return res.data.data;
  },

  getComplaintById: async (id: number): Promise<ComplaintDetail> => {
    const res = await apiClient.get<ApiResponse<ComplaintDetail>>(`/api/committee/complaints/${id}`);
    return res.data.data;
  },

  recordInvestigation: async (
    id: number,
    data: {
      investigationSummary: string;
      findings?: string;
      actionTaken?: string;
      status?: InvestigationStatus;
      completeInvestigation?: boolean;
    }
  ): Promise<Investigation> => {
    const res = await apiClient.post<ApiResponse<Investigation>>(`/api/committee/complaints/${id}/investigation`, data);
    return res.data.data;
  },

  updateStatus: async (id: number, status: ComplaintStatus, remarks?: string): Promise<ComplaintDetail> => {
    const res = await apiClient.put<ApiResponse<ComplaintDetail>>(`/api/committee/complaints/${id}/status`, {
      status,
      remarks,
    });
    return res.data.data;
  },

  uploadAttachment: async (id: number, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<Attachment>>(
      `/api/committee/complaints/${id}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  },
};
