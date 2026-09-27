import api from './api';

export const historyService = {
  async getHistory(params = {}) {
    const response = await api.get('/history', { params });
    return response.data; // { items, total, page, limit, total_pages }
  },

  async getHistoryItem(id) {
    const response = await api.get(`/history/${id}`);
    return response.data;
  },

  async deleteHistoryItem(id) {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  },
};
