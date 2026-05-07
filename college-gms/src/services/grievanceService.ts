import api from './api';
import type { Grievance, Category, Attachment } from '../types';

export const grievanceService = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories/');
    return response.data.results || response.data;
  },

  // Grievances
  getGrievances: async (params?: Record<string, any>): Promise<Grievance[]> => {
    const response = await api.get('/grievances/', { params });
    return response.data.results || response.data;
  },

  getGrievance: async (id: string): Promise<Grievance> => {
    const response = await api.get(`/grievances/${id}/`);
    return response.data;
  },

  createGrievance: async (data: Partial<Grievance>): Promise<Grievance> => {
    const response = await api.post('/grievances/', data);
    return response.data;
  },

  updateGrievance: async (id: string, data: Partial<Grievance>): Promise<Grievance> => {
    const response = await api.patch(`/grievances/${id}/`, data);
    return response.data;
  },

  deleteGrievance: async (id: string): Promise<void> => {
    await api.delete(`/grievances/${id}/`);
  },

  takeUpGrievance: async (id: string): Promise<Grievance> => {
    const response = await api.post(`/grievances/${id}/take_up/`);
    return response.data;
  },

  // Attachments
  uploadAttachment: async (grievanceId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('grievance', grievanceId);
    formData.append('file', file);
    
    const response = await api.post('/attachments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
