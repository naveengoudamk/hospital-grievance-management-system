import apiClient from './client';
import { ApiResponse, Category, LocationItem, PublicComplaintResponse, TrackComplaintResponse } from '../types';

export const publicApi = {
  getPublicConfig: async (): Promise<Record<string, string>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string>>>('/api/public/config');
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/api/public/categories');
    return res.data.data;
  },

  getLocations: async (): Promise<LocationItem[]> => {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>('/api/public/locations');
    return res.data.data;
  },

  submitComplaint: async (
    complaintData: {
      categoryId: number;
      locationId?: number;
      description: string;
      isAnonymous: boolean;
      complainantName?: string;
      complainantPhone?: string;
      complainantEmail?: string;
      preferredContactMethod?: string;
      incidentDate?: string;
    },
    files?: File[]
  ): Promise<PublicComplaintResponse> => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('complaint', JSON.stringify(complaintData));
      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await apiClient.post<ApiResponse<PublicComplaintResponse>>(
        '/api/public/complaints',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data.data;
    } else {
      const res = await apiClient.post<ApiResponse<PublicComplaintResponse>>(
        '/api/public/complaints/json',
        complaintData
      );
      return res.data.data;
    }
  },

  trackComplaint: async (complaintReference: string, trackingToken: string): Promise<TrackComplaintResponse> => {
    const res = await apiClient.post<ApiResponse<TrackComplaintResponse>>('/api/public/complaints/track', {
      complaintReference,
      trackingToken,
    });
    return res.data.data;
  },
};
