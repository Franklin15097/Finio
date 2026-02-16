import { useTheme } from '../context/ThemeContext';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  budget: number;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
}

export default function CategoryGrid({ categories, onCategoryClick }: CategoryGridProps) {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category, index) => {
        const percentage = (category.spent / category.budget) * 100;
        const isOverBudget = percentage > 100;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryClick?.(category)}
            className="relative overflow-hidden rounded-2xl p-4 transition-all duration-300
                     hover:scale-105 hover:-translate-y-1 active:scale-95
                     animate-fade-in"
            style={{
              background: theme.colors.surfaceGlass,
              backdropFilter: theme.effects.blur,
              border: `1px solid ${theme.colors.surfaceGlass}`,
              boxShadow: theme.effects.shadow,
              animationDelay: `${index * 50}ms`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `${theme.effects.shadow}, 0 0 20px ${category.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = theme.effects.shadow;
            }}
          >
            {/* Background gradient */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(135deg, ${category.color}, transparent)`,
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3
                         transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `${category.color}20`,
                  color: category.color,
                }}
              >
                {category.icon}
              </div>

              {/* Name */}
              <h3
                className="font-semibold text-sm mb-2 truncate"
                style={{ color: theme.colors.text }}
              >
                {category.name}
              </h3>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: theme.colors.textSecondary }}>
                    {category.spent.toLocaleString()} ₽
                  </span>
                  <span
                    style={{
                      color: isOverBudget ? theme.colors.error : theme.colors.textSecondary,
                    }}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: `${category.color}20` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: isOverBudget
                        ? theme.colors.error
                        : `linear-gradient(90deg, ${category.color}, ${theme.colors.accent})`,
                    }}
                  />
                </div>
              </div>

              {/* Over budget indicator */}
              {isOverBudget && (
                <div
                  className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                  style={{ background: theme.colors.error }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
