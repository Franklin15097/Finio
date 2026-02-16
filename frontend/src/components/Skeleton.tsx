import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'list' | 'text' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  type = 'rect',
  width = '100%',
  height = 'auto',
  className = '',
  count = 1
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => {
    const baseClasses = 'animate-pulse bg-gray-700/50 rounded';
    
    const typeClasses = {
      card: 'rounded-xl p-4 space-y-3',
      list: 'rounded-lg p-3 space-y-2',
      text: 'rounded h-4',
      circle: 'rounded-full',
      rect: 'rounded'
    };

    const style = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    };

    return (
      <div
        key={index}
        className={`${baseClasses} ${typeClasses[type]} ${className}`}
        style={style}
      />
    );
  });

  return <>{skeletons}</>;
};

// Специализированные скелетоны
export const TransactionSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse bg-gray-700/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600/50 rounded-xl" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-gray-600/50 rounded" />
                <div className="w-32 h-3 bg-gray-600/50 rounded" />
              </div>
            </div>
            <div className="w-16 h-4 bg-gray-600/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse bg-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="w-20 h-4 bg-gray-600/50 rounded" />
          <div className="w-32 h-6 bg-gray-600/50 rounded" />
        </div>
        <div className="w-10 h-10 bg-gray-600/50 rounded-xl" />
      </div>
      <div className="h-32 bg-gray-600/50 rounded" />
    </div>
  );
};

export const StatCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse bg-gray-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-16 h-3 bg-gray-600/50 rounded" />
              <div className="w-20 h-6 bg-gray-600/50 rounded" />
            </div>
            <div className="w-10 h-10 bg-gray-600/50 rounded-xl" />
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-600/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const FilterSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse bg-gray-700/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-32 h-5 bg-gray-600/50 rounded" />
        <div className="w-16 h-4 bg-gray-600/50 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-10 bg-gray-600/50 rounded" />
        <div className="h-10 bg-gray-600/50 rounded" />
        <div className="h-10 bg-gray-600/50 rounded" />
      </div>
    </div>
  );
};

export const CategorySkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse bg-gray-700/50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600/50 rounded-lg" />
            <div className="space-y-1 flex-1">
              <div className="w-3/4 h-3 bg-gray-600/50 rounded" />
              <div className="w-1/2 h-2 bg-gray-600/50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const EmptyStateSkeleton: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-700/50 rounded-full mx-auto mb-3" />
      <div className="w-32 h-4 bg-gray-600/50 rounded mx-auto mb-2" />
      <div className="w-48 h-3 bg-gray-600/50 rounded mx-auto" />
    </div>
  );
};

// Компонент для страницы загрузки
export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-700/50 rounded-2xl" />
          <div className="space-y-2">
            <div className="w-32 h-6 bg-gray-600/50 rounded" />
            <div className="w-24 h-3 bg-gray-600/50 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-gray-700/50 rounded-xl" />
          <div className="w-24 h-10 bg-gray-700/50 rounded-xl" />
        </div>
      </div>

      {/* Stats skeleton */}
      <StatCardSkeleton />

      {/* Filter skeleton */}
      <FilterSkeleton />

      {/* Transactions skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-24 h-5 bg-gray-600/50 rounded" />
          <div className="w-16 h-4 bg-gray-600/50 rounded" />
        </div>
        <TransactionSkeleton count={5} />
      </div>
    </div>
  );
};

export default Skeleton;