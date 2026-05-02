import axios from 'axios';

export const clienteApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request: attach JWT token
clienteApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_acceso');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: on 401/403 clear tokens and redirect to login
clienteApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token_acceso');
      localStorage.removeItem('token_refresco');
      // Redirect to login only if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
