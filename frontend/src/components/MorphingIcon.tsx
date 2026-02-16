import { useEffect, useState } from 'react';

interface MorphingIconProps {
  icons: string[];
  interval?: number;
  className?: string;
}

export default function MorphingIcon({ icons, interval = 3000, className = '' }: MorphingIconProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % icons.length);
        setIsTransitioning(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [icons.length, interval]);

  return (
    <div
      className={`transition-all duration-300 ${
        isTransitioning ? 'scale-0 rotate-180 opacity-0' : 'scale-100 rotate-0 opacity-100'
      } ${className}`}
    >
      {icons[currentIndex]}
    </div>
  );
}
