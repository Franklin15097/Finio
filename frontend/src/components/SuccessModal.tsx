import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import Button from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  autoClose?: number;
  showConfetti?: boolean;
}

export default function SuccessModal({
  isOpen,
  onClose,
  type = 'success',
  title,
  message,
  autoClose = 2000,
  showConfetti = false,
}: SuccessModalProps) {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      if (autoClose > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle size={64} color={theme.colors.success} />,
    error: <XCircle size={64} color={theme.colors.error} />,
    warning: <AlertCircle size={64} color={theme.colors.warning} />,
    info: <Info size={64} color={theme.colors.primary} />,
  };

  const colors = {
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
    info: theme.colors.primary,
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={handleClose}
    >
      <div
        className={`relative max-w-sm w-full p-8 rounded-3xl transition-all duration-300 ${
          show ? 'scale-100' : 'scale-90'
        }`}
        style={{
          background: theme.colors.surface,
          border: `2px solid ${colors[type]}40`,
          boxShadow: `0 20px 60px ${colors[type]}40`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti effect */}
        {showConfetti && type === 'success' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 animate-bounce">{icons[type]}</div>
          
          <h3
            className="text-2xl font-bold mb-2"
            style={{ color: theme.colors.text }}
          >
            {title}
          </h3>
          
          {message && (
            <p
              className="text-sm mb-6"
              style={{ color: theme.colors.textSecondary }}
            >
              {message}
            </p>
          )}

          <Button onClick={handleClose} variant="primary" fullWidth>
            Отлично
          </Button>
        </div>
      </div>
    </div>
  );
}
