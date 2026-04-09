import axios from 'axios';

// API base URL - now pointing to IIS Express
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44385/api';
console.log('?? API Base URL:', apiBaseUrl);
console.log('?? Environment Variables:', import.meta.env);

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
api.interceptors.request.use((config) => {
console.log('?? API Request:', config.method?.toUpperCase(), config.url);
console.log('?? Full URL:', (config.baseURL || '') + (config.url || ''));
  
const token = localStorage.getItem('authToken');
console.log('?? Token exists:', !!token);
console.log('?? Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');

if (token) {
  config.headers.Authorization = `Bearer ${token}`;
  console.log('? Authorization header added');
} else {
  console.log('? No token found in localStorage');
}
return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
