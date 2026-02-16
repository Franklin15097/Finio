import { ReactNode, useRef, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { RefreshCw, Check } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export default function PullToRefresh({ children, onRefresh, threshold = 80 }: PullToRefreshProps) {
  const { theme } = useTheme();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      if (distance > threshold) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPullDistance(0);
          setIsRefreshing(false);
        }, 1000);
      } catch (error) {
        setPullDistance(0);
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
    
    startY.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const rotation = (pullDistance / threshold) * 360;

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full"
          style={{
            background: theme.colors.surfaceGlass,
            border: `2px solid ${theme.colors.primary}`,
            transform: `scale(${Math.min(pullDistance / threshold, 1)})`,
          }}
        >
          {isSuccess ? (
            <Check size={24} color={theme.colors.success} />
          ) : (
            <RefreshCw
              size={24}
              color={theme.colors.primary}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.3s ease',
              }}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
