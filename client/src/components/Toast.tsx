import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle size={24} />,
    error: <XCircle size={24} />,
    warning: <AlertCircle size={24} />,
    info: <Info size={24} />,
  };

  const colors = {
    success: "bg-green-500 border-green-600",
    error: "bg-red-500 border-red-600",
    warning: "bg-amber-500 border-amber-600",
    info: "bg-blue-500 border-blue-600",
  };

  return (
    <div
      className={`flex items-center gap-3 ${
        colors[type]
      } text-white px-6 py-4 rounded-xl shadow-2xl border-2 transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } min-w-[300px] max-w-md`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 font-semibold text-base">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:bg-white/20 p-1 rounded-lg transition-colors"
        aria-label="Close notification"
      >
        <X size={20} />
      </button>
    </div>
  );
}

// Toast container component
interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastCallback: ((toast: ToastMessage) => void) | null = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastCallback = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(${index * 80}px)` }}
          className="transition-transform duration-300"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Helper function to show toasts
export function showToast(message: string, type: ToastType = "info") {
  if (addToastCallback) {
    addToastCallback({
      id: toastId++,
      message,
      type,
    });
  }
}
