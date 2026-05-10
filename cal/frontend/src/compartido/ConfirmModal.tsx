import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from './storeUI';
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConfirmModal() {
  const {
    isOpen,
    titulo,
    mensaje,
    textoConfirmar,
    textoCancelar,
    tipo,
    onConfirmar,
    cerrarConfirmacion,
  } = useUIStore();

  if (!isOpen) return null;

  const tipoStyles = {
    peligro: {
      bgIcon: 'bg-red-100',
      glow: 'bg-red-500/20',
      btnConfirmo: 'bg-red-600 hover:bg-red-700 shadow-red-500/30 hover:shadow-red-500/50 text-white',
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />
    },
    info: {
      bgIcon: 'bg-blue-100',
      glow: 'bg-blue-500/20',
      btnConfirmo: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:shadow-blue-500/50 text-white',
      icon: <Info className="w-8 h-8 text-blue-600" />
    },
    exito: {
      bgIcon: 'bg-green-100',
      glow: 'bg-green-500/20',
      btnConfirmo: 'bg-green-600 hover:bg-green-700 shadow-green-500/30 hover:shadow-green-500/50 text-white',
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />
    },
    advertencia: {
      bgIcon: 'bg-amber-100',
      glow: 'bg-amber-500/20',
      btnConfirmo: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 hover:shadow-amber-500/50 text-white',
      icon: <AlertCircle className="w-8 h-8 text-amber-600" />
    }
  };

  const style = tipoStyles[tipo as keyof typeof tipoStyles] || tipoStyles.info;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
          onClick={cerrarConfirmacion}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-white/20"
        >
          {/* Fondo difuminado arriba para darle un look vivo */}
          <div className={`absolute top-0 left-0 w-full h-32 ${style.glow} blur-3xl opacity-50 pointer-events-none -translate-y-1/2`} />
          
          <div className="p-8 pt-10 text-center relative z-10 flex-1">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/50 ${style.bgIcon}`}
            >
              {style.icon}
            </motion.div>
            
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">{titulo}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium px-2">{mensaje}</p>
          </div>

          <div className="p-6 pt-0 flex gap-3 relative z-10">
            <button
              onClick={cerrarConfirmacion}
              className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100/80 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
            >
              {textoCancelar || 'Cancelar'}
            </button>
            <button
              onClick={() => {
                if (onConfirmar) onConfirmar();
                cerrarConfirmacion();
              }}
              className={`flex-1 px-5 py-3 text-sm font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${style.btnConfirmo}`}
            >
              {textoConfirmar || 'Confirmar'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
