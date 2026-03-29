'use client';
import { useEffect } from 'react';

type SnackbarType = 'success' | 'error' | 'warning';

interface SnackbarProps {
  message: string;
  type: SnackbarType;
  onClose: () => void;
}

const colors: Record<SnackbarType, string> = {
  success: 'bg-assa-green',
  error: 'bg-red-600',
  warning: 'bg-orange-500',
};

export default function Snackbar({ message, type, onClose }: SnackbarProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-24 left-4 right-4 z-50 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg text-center font-medium animate-fade-in`}>
      {message}
    </div>
  );
}

export function useSnackbar() {
  return null; // handled at page level
}
