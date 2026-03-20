import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const changePassword = (data) => API.put('/auth/password', data);
export const updatePassword = changePassword; // alias
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => API.put(`/auth/reset-password/${token}`, data);

// User
export const getDashboard = () => API.get('/users/dashboard');
export const updateProfile = (data) => API.put('/users/profile', data);
export const updateCharityPercent = (data) => API.put('/users/charity-percent', data);

// Scores
export const getScores = () => API.get('/scores');
export const addScore = (data) => API.post('/scores', data);
export const editScore = (id, data) => API.put(`/scores/${id}`, data);
export const deleteScore = (id) => API.delete(`/scores/${id}`);

// Charities
export const getCharities = (params) => API.get('/charities', { params });
export const getCharity = (id) => API.get(`/charities/${id}`);
export const selectCharity = (id, data) => API.put(`/charities/select/${id}`, data);

// Draws
export const getDraws = () => API.get('/draws');
export const getLatestDraw = () => API.get('/draws/latest');
export const getMyDrawHistory = () => API.get('/draws/my-history');

// Payments
export const createCheckoutSession = (data) => API.post('/payments/create-session', data);
export const createPortalSession = () => API.post('/payments/portal');
export const getSubscription = () => API.get('/payments/subscription');

// Winners
export const getMyWinnings = () => API.get('/winners/my-winnings');
export const uploadProof = (drawId, winnerId, formData) =>
  API.post(`/winners/${drawId}/${winnerId}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Admin
export const adminGetAnalytics = () => API.get('/admin/analytics');
export const adminGetUsers = (params) => API.get('/admin/users', { params });
export const adminGetUserDetail = (id) => API.get(`/admin/users/${id}`);
export const adminUpdateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const adminEditUserScores = (id, data) => API.put(`/admin/users/${id}/scores`, data);
export const adminGetDraws = () => API.get('/admin/draws');
export const adminSimulateDraw = (data) => API.post('/draws/simulate', data);
export const adminPublishDraw = (id) => API.put(`/draws/${id}/publish`);
export const adminGetWinners = (params) => API.get('/admin/winners', { params });
export const adminUpdateWinnerStatus = (drawId, winnerId, data) =>
  API.put(`/admin/winners/${drawId}/${winnerId}`, data);
export const adminGetCharities = (params) => API.get('/charities', { params });
export const adminCreateCharity = (data) => API.post('/charities', data);
export const adminUpdateCharity = (id, data) => API.put(`/charities/${id}`, data);
export const adminDeleteCharity = (id) => API.delete(`/charities/${id}`);
export const adminGetReports = (params) => API.get('/admin/reports', { params });

export default API;

export const syncSubscription = (data) => API.post('/payments/sync-subscription', data);
