import React from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Tag, 
  Wallet, 
  BarChart3,
  Search,
  Filter,
  Plus,
  Download,
  Calendar
} from 'lucide-react';

interface EmptyStateProps {
  type: 'transactions' | 'categories' | 'accounts' | 'analytics' | 'search' | 'filter' | 'export';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  showAction = true
}) => {
  const config = {
    transactions: {
      icon: FileText,
      defaultTitle: 'Нет транзакций',
      defaultDescription: 'Добавьте первую транзакцию, чтобы начать отслеживать свои финансы',
      defaultActionLabel: 'Добавить транзакцию',
      color: 'from-purple-500 to-pink-600',
      iconColor: 'text-purple-400'
    },
    categories: {
      icon: Tag,
      defaultTitle: 'Нет категорий',
      defaultDescription: 'Создайте категории для удобной сортировки транзакций',
      defaultActionLabel: 'Создать категорию',
      color: 'from-blue-500 to-cyan-600',
      iconColor: 'text-blue-400'
    },
    accounts: {
      icon: Wallet,
      defaultTitle: 'Нет счетов',
      defaultDescription: 'Добавьте счета для управления несколькими источниками средств',
      defaultActionLabel: 'Добавить счет',
      color: 'from-green-500 to-emerald-600',
      iconColor: 'text-green-400'
    },
    analytics: {
      icon: BarChart3,
      defaultTitle: 'Нет данных для анализа',
      defaultDescription: 'Добавьте транзакции, чтобы увидеть аналитику и графики',
      defaultActionLabel: 'Добавить транзакции',
      color: 'from-yellow-500 to-orange-600',
      iconColor: 'text-yellow-400'
    },
    search: {
      icon: Search,
      defaultTitle: 'Ничего не найдено',
      defaultDescription: 'Попробуйте изменить поисковый запрос или фильтры',
      defaultActionLabel: 'Сбросить фильтры',
      color: 'from-gray-500 to-gray-600',
      iconColor: 'text-gray-400'
    },
    filter: {
      icon: Filter,
      defaultTitle: 'Нет результатов',
      defaultDescription: 'Попробуйте изменить параметры фильтрации',
      defaultActionLabel: 'Сбросить фильтры',
      color: 'from-indigo-500 to-violet-600',
      iconColor: 'text-indigo-400'
    },
    export: {
      icon: Download,
      defaultTitle: 'Нет данных для экспорта',
      defaultDescription: 'Добавьте транзакции, чтобы экспортировать их в различных форматах',
      defaultActionLabel: 'Добавить транзакции',
      color: 'from-red-500 to-pink-600',
      iconColor: 'text-red-400'
    }
  };

  const { 
    icon: Icon, 
    defaultTitle, 
    defaultDescription, 
    defaultActionLabel, 
    color, 
    iconColor 
  } = config[type];

  return (
    <div className="text-center py-12 px-4">
      {/* Иконка */}
      <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
        <Icon className="w-10 h-10 text-white" />
      </div>

      {/* Заголовок и описание */}
      <h3 className="text-xl font-bold text-white mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
        {description || defaultDescription}
      </p>

      {/* Действие */}
      {showAction && onAction && (
        <button
          onClick={onAction}
          className={`px-6 py-2.5 bg-gradient-to-r ${color} text-white rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity`}
        >
          <Plus className="w-4 h-4" />
          {actionLabel || defaultActionLabel}
        </button>
      )}

      {/* Советы в зависимости от типа */}
      {type === 'transactions' && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">Доходы</span>
            </div>
            <p className="text-gray-400 text-xs">
              Добавляйте зарплату, подработки, инвестиционные доходы
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">Расходы</span>
            </div>
            <p className="text-gray-400 text-xs">
              Отслеживайте покупки, счета, развлечения и другие траты
            </p>
          </div>
        </div>
      )}

      {type === 'search' && (
        <div className="mt-6 space-y-2 max-w-md mx-auto">
          <p className="text-gray-500 text-xs">Попробуйте:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
              Поиск по описанию
            </span>
            <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
              Фильтр по дате
            </span>
            <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
              Выбор категории
            </span>
          </div>
        </div>
      )}

      {type === 'analytics' && (
        <div className="mt-6 space-y-3 max-w-md mx-auto">
          <p className="text-gray-500 text-xs">После добавления транзакций вы увидите:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-300 text-xs">Графики</span>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-300 text-xs">Статистику</span>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-300 text-xs">Тренды</span>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                <Download className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-300 text-xs">Отчёты</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Специализированные компоненты
export const TransactionsEmptyState: React.FC<{
  hasFilters?: boolean;
  onAddTransaction?: () => void;
  onResetFilters?: () => void;
}> = ({ hasFilters = false, onAddTransaction, onResetFilters }) => {
  if (hasFilters) {
    return (
      <EmptyState
        type="filter"
        title="Нет транзакций по фильтрам"
        description="Попробуйте изменить параметры поиска или сбросить фильтры"
        actionLabel="Сбросить фильтры"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <EmptyState
      type="transactions"
      onAction={onAddTransaction}
    />
  );
};

export const CategoriesEmptyState: React.FC<{
  type?: 'income' | 'expense' | 'all';
  onAddCategory?: () => void;
}> = ({ type = 'all', onAddCategory }) => {
  const title = type === 'income' 
    ? 'Нет категорий доходов' 
    : type === 'expense' 
    ? 'Нет категорий расходов' 
    : 'Нет категорий';

  const description = type === 'income'
    ? 'Создайте категории для удобного отслеживания источников дохода'
    : type === 'expense'
    ? 'Создайте категории для удобного отслеживания расходов'
    : 'Создайте категории для удобной сортировки транзакций';

  return (
    <EmptyState
      type="categories"
      title={title}
      description={description}
      onAction={onAddCategory}
    />
  );
};

export const SearchEmptyState: React.FC<{
  query?: string;
  onReset?: () => void;
}> = ({ query, onReset }) => {
  return (
    <EmptyState
      type="search"
      title={query ? `По запросу "${query}" ничего не найдено` : 'Ничего не найдено'}
      description="Попробуйте изменить поисковый запрос или параметры фильтрации"
      actionLabel="Сбросить поиск"
      onAction={onReset}
    />
  );
};

export const AnalyticsEmptyState: React.FC<{
  onAddTransaction?: () => void;
}> = ({ onAddTransaction }) => {
  return (
    <EmptyState
      type="analytics"
      onAction={onAddTransaction}
    />
  );
};

export const ExportEmptyState: React.FC<{
  onAddTransaction?: () => void;
}> = ({ onAddTransaction }) => {
  return (
    <EmptyState
      type="export"
      onAction={onAddTransaction}
    />
  );
};

export default EmptyState;