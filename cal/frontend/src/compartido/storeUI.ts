import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'peligro' | 'info' | 'exito' | 'advertencia';
  onConfirmar?: () => void;
  abrirConfirmacion: (opciones: Omit<ConfirmState, 'isOpen' | 'abrirConfirmacion' | 'cerrarConfirmacion'>) => void;
  cerrarConfirmacion: () => void;
}

export const useUIStore = create<ConfirmState>((set) => ({
  isOpen: false,
  titulo: '',
  mensaje: '',
  textoConfirmar: 'Confirmar',
  textoCancelar: 'Cancelar',
  tipo: 'info',
  onConfirmar: undefined,
  abrirConfirmacion: (opciones) => set({ ...opciones, isOpen: true }),
  cerrarConfirmacion: () => set({ isOpen: false }),
}));
