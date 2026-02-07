import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../api/categories';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await categoriesAPI.deleteCategory(id);
        toast.success('Категория удалена');
        loadCategories();
      } catch (error) {
        toast.error('Ошибка при удалении категории');
      }
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Категории</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Добавить категорию
        </button>
      </div>

      {/* Income Categories */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          Категории доходов
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomeCategories.map((category) => (
            <div key={category.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-white font-medium">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  {!category.is_default && (
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {category.icon && (
                <div className="text-2xl mb-2">{category.icon}</div>
              )}
              {category.is_default && (
                <span className="text-xs text-gray-400">По умолчанию</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          Категории расходов
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseCategories.map((category) => (
            <div key={category.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-white font-medium">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  {!category.is_default && (
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {category.icon && (
                <div className="text-2xl mb-2">{category.icon}</div>
              )}
              {category.is_default && (
                <span className="text-xs text-gray-400">По умолчанию</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;