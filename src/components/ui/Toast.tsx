import { X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => {
        const bgColor = {
          info: 'bg-blue-500',
          success: 'bg-green-500',
          warning: 'bg-yellow-500',
          error: 'bg-red-500'
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center justify-between fade-in`}
          >
            <p>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
              aria-label="Close toast"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};