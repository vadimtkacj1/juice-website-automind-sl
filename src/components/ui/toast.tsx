'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, title: string, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-purple-600',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-600',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
      iconColor: 'text-white'
    }
  }[toast.type];

  const Icon = config.icon;

  return (
    <div 
      className={`${config.bgColor} ${config.textColor} px-6 py-4 rounded-lg shadow-lg min-w-[320px] max-w-md animate-in slide-in-from-top-2 fade-in`}
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{toast.title}</p>
          <p className="text-sm opacity-90 mt-1">{toast.message}</p>
        </div>
        <button 
          onClick={onRemove}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Convenience methods
export const toast = {
  success: (title: string, message: string, duration?: number) => {
    // This will be replaced by the actual context method when provider is available
    console.log('Toast success:', title, message);
  },
  error: (title: string, message: string, duration?: number) => {
    console.log('Toast error:', title, message);
  },
  warning: (title: string, message: string, duration?: number) => {
    console.log('Toast warning:', title, message);
  },
  info: (title: string, message: string, duration?: number) => {
    console.log('Toast info:', title, message);
  }
};
