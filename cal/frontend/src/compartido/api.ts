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

// Response: ONLY on 401 (token expired/invalid) clear session and redirect.
// 403 = valid token but insufficient role — DO NOT logout, let components handle it.
clienteApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token_acceso');
      localStorage.removeItem('token_refresco');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
