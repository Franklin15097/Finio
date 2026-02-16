import { ReactNode, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Trash2, Edit2 } from 'lucide-react';

interface SwipeableCardProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  className?: string;
}

export default function SwipeableCard({ children, onDelete, onEdit, className = '' }: SwipeableCardProps) {
  const { theme } = useTheme();
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Ограничиваем свайп
    if (diff < 0 && onDelete) {
      setSwipeX(Math.max(diff, -120));
    } else if (diff > 0 && onEdit) {
      setSwipeX(Math.min(diff, 120));
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    // Если свайп больше порога, выполняем действие
    if (swipeX < -80 && onDelete) {
      onDelete();
    } else if (swipeX > 80 && onEdit) {
      onEdit();
    }
    
    // Возвращаем карточку на место
    setSwipeX(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons background */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        {onEdit && (
          <div
            className="flex items-center justify-center w-16 h-full rounded-l-xl"
            style={{
              background: theme.colors.primary,
              opacity: Math.min(swipeX / 80, 1),
            }}
          >
            <Edit2 size={24} color="#FFFFFF" />
          </div>
        )}
        
        {onDelete && (
          <div
            className="flex items-center justify-center w-16 h-full rounded-r-xl ml-auto"
            style={{
              background: theme.colors.error,
              opacity: Math.min(Math.abs(swipeX) / 80, 1),
            }}
          >
            <Trash2 size={24} color="#FFFFFF" />
          </div>
        )}
      </div>

      {/* Card content */}
      <div
        ref={cardRef}
        className={`relative ${className}`}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
