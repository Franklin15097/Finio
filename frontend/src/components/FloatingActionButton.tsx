import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface FABAction {
  icon: string;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  mainIcon?: string;
}

export default function FloatingActionButton({
  actions,
  mainIcon = '+',
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-20 right-6 z-40">
      {/* Action buttons */}
      <div className="flex flex-col-reverse gap-3 mb-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className={`
              flex items-center gap-3 transition-all duration-300
              ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
            `}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
          >
            {/* Label */}
            <span
              className="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
              style={{
                background: theme.colors.surfaceGlass,
                backdropFilter: theme.effects.blur,
                color: theme.colors.text,
                boxShadow: theme.effects.shadow,
              }}
            >
              {action.label}
            </span>

            {/* Action button */}
            <button
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl
                       transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                background: action.color || theme.colors.secondary,
                boxShadow: theme.effects.shadow,
                color: '#fff',
              }}
            >
              {action.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
          transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
          boxShadow: `${theme.effects.shadow}, ${theme.effects.glow}`,
          color: '#fff',
        }}
      >
        {mainIcon}
      </button>
    </div>
  );
}
