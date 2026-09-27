import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(identifier, password) {
    const isEmail = identifier.includes('@');
    const payload = isEmail
      ? { email_address: identifier, password }
      : { phone_number: identifier, password };
    
    const response = await api.post('/auth/login', payload);
    return response.data; // { session_id, message, requires_2fa, channel }
  },

  async verify2FA(sessionId, otpCode) {
    const response = await api.post('/auth/verify-2fa', {
      session_id: sessionId,
      otp_code: otpCode,
    });
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem('plant_aid_token', access_token);
      // Fetch user profile
      const user = await this.getCurrentUser();
      localStorage.setItem('plant_aid_user', JSON.stringify(user));
      window.dispatchEvent(new Event('plant_aid_auth_changed'));
      return { token: access_token, user };
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('plant_aid_token');
    localStorage.removeItem('plant_aid_user');
    window.dispatchEvent(new Event('plant_aid_auth_changed'));
  },

  getStoredUser() {
    try {
      const stored = localStorage.getItem('plant_aid_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('plant_aid_token');
  },
};
