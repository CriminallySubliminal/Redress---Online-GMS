import api from './api';
import type { GrievanceInteraction, Comment } from '../types';

export const interactionService = {
  // Votes
  getVotes: async (grievanceId: string): Promise<GrievanceInteraction[]> => {
    const response = await api.get('/votes/', { params: { grievance: grievanceId } });
    return response.data.results || response.data;
  },

  submitVote: async (grievanceId: string, type: 'upvote' | 'downvote'): Promise<GrievanceInteraction> => {
    const response = await api.post('/votes/', { grievance: grievanceId, type });
    return response.data;
  },

  removeVote: async (id: number): Promise<void> => {
    await api.delete(`/votes/${id}/`);
  },

  // Comments
  getComments: async (grievanceId: string): Promise<Comment[]> => {
    const response = await api.get('/comments/', { params: { grievance: grievanceId } });
    return response.data.results || response.data;
  },

  submitComment: async (data: { grievance: string; content: string; is_anonymous: boolean }): Promise<Comment> => {
    const response = await api.post('/comments/', data);
    return response.data;
  },

  deleteComment: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}/`);
  },
};
