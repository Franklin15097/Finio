import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import IconPicker, { getIconComponent } from '../../components/IconPicker';
import { Plus, Tag, Edit2, Trash2, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TelegramCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'income' as 'income' | 'expense',
    icon: 'DollarSign'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const color = categoryForm.type === 'income' ? '#10b981' : '#ef4444';
      
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          ...categoryForm,
          color
        });
      } else {
        await api.createCategory({
          ...categoryForm,
          color
        });
      }
      setShowModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', type: 'income', icon: 'DollarSign' });
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Ошибка при сохранении категории');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить категорию? Все транзакции с этой категорией останутся без категории.')) {
      try {
        await api.deleteCategory(id);
        loadCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Ошибка при удалении категории');
      }
    }
  };

  const openEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      icon: category.icon
    });
    setShowModal(true);
  };

  const filteredCategories = categories.filter(cat => 
    selectedType === 'all' || cat.type === selectedType
  );

  const incomeCount = categories.filter(c => c.type === 'income').length;
  const expenseCount = categories.filter(c => c.type === 'expense').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Категории</h1>
          <p className="text-white/60 text-xs">Управление категориями</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', type: 'income', icon: 'DollarSign' });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-xl text-white font-semibold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setSelectedType('all')}
          className={`glass-card rounded-2xl p-3 border transition-all ${
            selectedType === 'all' ? 'border-purple-500/50 bg-purple-500/10' : 'border-border/30'
          }`}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center mb-2">
            <Tag className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-[10px] mb-1">Всего</p>
          <p className="text-lg font-bold text-white">{categories.length}</p>
        </button>

        <button
          onClick={() => setSelectedType('income')}
          className={`glass-card rounded-2xl p-3 border transition-all ${
            selectedType === 'income' ? 'border-green-500/50 bg-green-500/10' : 'border-border/30'
          }`}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-[10px] mb-1">Доходы</p>
          <p className="text-lg font-bold text-white">{incomeCount}</p>
        </button>

        <button
          onClick={() => setSelectedType('expense')}
          className={`glass-card rounded-2xl p-3 border transition-all ${
            selectedType === 'expense' ? 'border-red-500/50 bg-red-500/10' : 'border-border/30'
          }`}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-[10px] mb-1">Расходы</p>
          <p className="text-lg font-bold text-white">{expenseCount}</p>
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-white">
          {selectedType === 'all' && `Все категории (${filteredCategories.length})`}
          {selectedType === 'income' && `Категории доходов (${filteredCategories.length})`}
          {selectedType === 'expense' && `Категории расходов (${filteredCategories.length})`}
        </h2>
        
        {filteredCategories.length > 0 ? (
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              const isIncome = category.type === 'income';
              
              return (
                <div
                  key={category.id}
                  className="glass-card rounded-2xl p-4 border border-border/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        isIncome 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                          : 'bg-gradient-to-r from-red-500 to-pink-600'
                      }`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{category.name}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          {isIncome ? (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              Доход
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3" />
                              Расход
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(category)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-400 text-sm">Нет категорий</p>
            <p className="text-gray-500 text-xs mt-1">Создайте первую категорию</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', type: 'income', icon: 'DollarSign' });
        }} 
        title={editingCategory ? 'Редактировать категорию' : 'Новая категория'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Название</label>
            <input
              type="text"
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
              placeholder="Например: Зарплата"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Тип</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategoryForm({ ...categoryForm, type: 'income' })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  categoryForm.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Доход
              </button>
              <button
                type="button"
                onClick={() => setCategoryForm({ ...categoryForm, type: 'expense' })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  categoryForm.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                <TrendingDown className="w-4 h-4 inline mr-1" />
                Расход
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Иконка</label>
            <IconPicker
              selectedIcon={categoryForm.icon}
              onSelectIcon={(icon) => setCategoryForm({ ...categoryForm, icon })}
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-xl font-semibold text-sm"
          >
            {editingCategory ? 'Сохранить' : 'Создать категорию'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
