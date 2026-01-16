'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  message,
  type = 'info',
}: AlertDialogProps) {
  
  // Настройки цветов в зависимости от типа (success теперь фиолетовый)
  const config = {
    info: {
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      icon: <Info className="h-8 w-8" />
    },
    success: {
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      buttonBg: 'bg-purple-600 hover:bg-purple-700', // Фиолетовая кнопка
      icon: <CheckCircle2 className="h-8 w-8" />
    },
    error: {
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      icon: <XCircle className="h-8 w-8" />
    },
    warning: {
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      buttonBg: 'bg-amber-500 hover:bg-amber-600',
      icon: <AlertTriangle className="h-8 w-8" />
    },
  }[type];

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        {/* Затемнение фона с легким размытием */}
        <AlertDialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        />
        
        {/* Само окно: закругленное, с мягкой тенью и аккуратной рамкой */}
        <AlertDialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[45%] z-50 w-[95vw] max-w-md translate-x-[-50%] translate-y-[-50%]",
            "bg-white p-8 rounded-[24px] border border-slate-100 shadow-2xl",
            "animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-2"
          )}
        >
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Круглая иконка с мягким фоном */}
            <div className={cn("p-5 rounded-full transition-transform duration-500 scale-110", config.bgColor, config.iconColor)}>
              {config.icon}
            </div>

            <div className="space-y-2">
              <AlertDialogPrimitive.Title className="text-2xl font-bold text-slate-900">
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="text-slate-500 text-base leading-relaxed">
                {message}
              </AlertDialogPrimitive.Description>
            </div>

            <div className="pt-4 w-full">
              <AlertDialogPrimitive.Action asChild>
                <button
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all active:scale-95 uppercase tracking-wide",
                    config.buttonBg
                  )}
                >
                  הבנתי, תודה / OK
                </button>
              </AlertDialogPrimitive.Action>
            </div>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}