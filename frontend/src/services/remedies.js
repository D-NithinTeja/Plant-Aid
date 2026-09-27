import api from './api';

export const remedyService = {
  async getDiseases() {
    const response = await api.get('/diseases');
    return response.data;
  },

  async getDiseaseById(id) {
    const response = await api.get(`/diseases/${id}`);
    return response.data;
  },

  async getRemedies(diseaseId) {
    const response = await api.get(`/remedies/${diseaseId}`);
    return response.data;
  },
};
