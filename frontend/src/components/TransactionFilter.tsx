import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TransactionFilterProps {
  categories: Array<{ id: number; name: string; type: string }>;
  onFilterChange: (filters: TransactionFilters) => void;
  initialFilters?: Partial<TransactionFilters>;
}

export interface TransactionFilters {
  search: string;
  startDate: Date | null;
  endDate: Date | null;
  categoryIds: number[];
  type: 'all' | 'income' | 'expense';
  minAmount: number | null;
  maxAmount: number | null;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  categories,
  onFilterChange,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    startDate: null,
    endDate: null,
    categoryIds: [],
    type: 'all',
    minAmount: null,
    maxAmount: null,
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Сохраняем фильтры в localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('transactionFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        // Преобразуем строки дат обратно в Date объекты
        if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
        if (parsed.endDate) parsed.endDate = new Date(parsed.endDate);
        setFilters(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Сохраняем фильтры при изменении
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('transactionFilters', JSON.stringify({
        ...filters,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString()
      }));
      onFilterChange(filters);
    }, 300); // debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
  };

  const handleCategoryToggle = (categoryId: number) => {
    setFilters(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const handleTypeChange = (type: 'all' | 'income' | 'expense') => {
    setFilters(prev => ({ ...prev, type }));
  };

  const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setFilters(prev => ({ ...prev, [field]: numValue }));
  };

  const handleReset = () => {
    const resetFilters: TransactionFilters = {
      search: '',
      startDate: null,
      endDate: null,
      categoryIds: [],
      type: 'all',
      minAmount: null,
      maxAmount: null
    };
    setFilters(resetFilters);
    localStorage.removeItem('transactionFilters');
    onFilterChange(resetFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.categoryIds.length > 0) count++;
    if (filters.type !== 'all') count++;
    if (filters.minAmount !== null || filters.maxAmount !== null) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      {/* Заголовок и кнопки */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Фильтры транзакций
          </h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {activeFilterCount} активных
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
          >
            {isExpanded ? 'Свернуть' : 'Развернуть'}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Основные фильтры (всегда видимые) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Поиск */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Поиск по описанию
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Найти транзакцию..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Диапазон дат */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Период
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <DatePicker
              selected={filters.startDate}
              onChange={handleDateChange}
              startDate={filters.startDate}
              endDate={filters.endDate}
              selectsRange
              placeholderText="Выберите период"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="dd.MM.yyyy"
              isClearable
            />
          </div>
        </div>

        {/* Тип транзакции */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Тип
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeChange('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.type === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => handleTypeChange('income')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.type === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Доходы
            </button>
            <button
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.type === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Расходы
            </button>
          </div>
        </div>
      </div>

      {/* Расширенные фильтры (раскрывающиеся) */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Расширенные фильтры
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Категории */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Категории
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Нет категорий</p>
                ) : (
                  categories.map(category => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categoryIds.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        category.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {category.type === 'income' ? 'Доход' : 'Расход'}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Сумма */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Сумма
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    От
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₽
                    </span>
                    <input
                      type="number"
                      value={filters.minAmount || ''}
                      onChange={(e) => handleAmountChange('minAmount', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    До
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₽
                    </span>
                    <input
                      type="number"
                      value={filters.maxAmount || ''}
                      onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
                      placeholder="∞"
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Активные фильтры (чипсы) */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Поиск: "{filters.search}"
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {(filters.startDate || filters.endDate) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Период: {filters.startDate?.toLocaleDateString('ru-RU') || '...'} - {filters.endDate?.toLocaleDateString('ru-RU') || '...'}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, startDate: null, endDate: null }))}
                  className="text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.type !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Тип: {filters.type === 'income' ? 'Доходы' : 'Расходы'}
                <button
                  onClick={() => handleTypeChange('all')}
                  className="text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.categoryIds.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Категории: {filters.categoryIds.length}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, categoryIds: [] }))}
                  className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {(filters.minAmount !== null || filters.maxAmount !== null) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Сумма: {filters.minAmount || '0'} - {filters.maxAmount || '∞'} ₽
                <button
                  onClick={() => setFilters(prev => ({ ...prev, minAmount: null, maxAmount: null }))}
                  className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;