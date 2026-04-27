import { create } from 'zustand';
import type { UsuarioAutenticado } from './tipos';

interface EstadoAuth {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  tokenRefresco: string | null;
  estaAutenticado: boolean;
  iniciarSesion: (token: string, tokenRefresco: string, rol: UsuarioAutenticado['rol'], email: string) => void;
  cerrarSesion: () => void;
}

export const useAuthStore = create<EstadoAuth>((set) => ({
  usuario: null,
  token: localStorage.getItem('token_acceso'),
  tokenRefresco: localStorage.getItem('token_refresco'),
  estaAutenticado: !!localStorage.getItem('token_acceso'),

  iniciarSesion: (token, tokenRefresco, rol, email) => {
    localStorage.setItem('token_acceso', token);
    localStorage.setItem('token_refresco', tokenRefresco);
    set({ token, tokenRefresco, estaAutenticado: true, usuario: { email, rol } });
  },

  cerrarSesion: () => {
    localStorage.removeItem('token_acceso');
    localStorage.removeItem('token_refresco');
    set({ token: null, tokenRefresco: null, estaAutenticado: false, usuario: null });
  },
}));
