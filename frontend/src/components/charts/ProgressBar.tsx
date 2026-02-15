interface ProgressBarProps {
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  totalLabel?: string;
  totalValue?: number;
}

export default function ProgressBar({
  leftValue,
  rightValue,
  leftLabel,
  rightLabel,
  leftColor = '#10b981',
  rightColor = '#ef4444',
  totalLabel,
  totalValue
}: ProgressBarProps) {
  const total = leftValue + rightValue;
  const leftPercent = total > 0 ? (leftValue / total) * 100 : 50;
  const rightPercent = total > 0 ? (rightValue / total) * 100 : 50;

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} млн ₽`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} тыс ₽`;
    }
    return `${value.toFixed(0)} ₽`;
  };

  return (
    <div className="w-full">
      {totalLabel && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-400">{totalLabel}</p>
          <p className="text-lg font-bold text-white">{formatValue(totalValue || total)}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${leftPercent}%`,
            backgroundColor: leftColor
          }}
        />
        <div
          className="absolute right-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${rightPercent}%`,
            backgroundColor: rightColor
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span style={{ color: leftColor }} className="font-semibold">
            {leftLabel}
          </span>
          <span className="text-gray-400">·</span>
          <span style={{ color: leftColor }} className="font-bold">
            {formatValue(leftValue)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span style={{ color: rightColor }} className="font-bold">
            {formatValue(rightValue)}
          </span>
          <span className="text-gray-400">·</span>
          <span style={{ color: rightColor }} className="font-semibold">
            {rightLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
