import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { User, MessageSquare, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser, linkTelegram } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [telegramId, setTelegramId] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || ''
    }
  });

  const onSubmitProfile = async (data) => {
    const result = await updateUser(data);
    if (result.success) {
      toast.success('Профиль обновлен');
    }
  };

  const handleLinkTelegram = async () => {
    if (!telegramId.trim()) {
      toast.error('Введите Telegram ID');
      return;
    }

    setIsLinking(true);
    const result = await linkTelegram(telegramId);
    setIsLinking(false);

    if (result.success) {
      setTelegramId('');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Профиль', icon: User },
    { id: 'telegram', name: 'Telegram', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Настройки</h1>
        <p className="text-gray-400 mt-1">Управление профилем и интеграциями</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Информация профиля</h2>
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Полное имя
                </label>
                <input
                  {...register('full_name', {
                    required: 'Имя обязательно',
                    minLength: {
                      value: 2,
                      message: 'Имя должно содержать минимум 2 символа'
                    }
                  })}
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email адрес
                </label>
                <input
                  {...register('email')}
                  type="email"
                  disabled
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-400">Email нельзя изменить</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'telegram' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Интеграция с Telegram</h2>
            
            {user?.telegram_id ? (
              <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-300 font-medium">
                    Telegram аккаунт привязан
                  </span>
                </div>
                <p className="text-green-200 text-sm mt-1">
                  ID: {user.telegram_id}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                  <h3 className="text-blue-300 font-medium mb-2">Как привязать Telegram?</h3>
                  <ol className="text-blue-200 text-sm space-y-1">
                    <li>1. Найдите бота @FinioBot в Telegram</li>
                    <li>2. Отправьте команду /start</li>
                    <li>3. Скопируйте ваш Telegram ID из сообщения бота</li>
                    <li>4. Вставьте ID в поле ниже и нажмите "Привязать"</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telegram ID
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      placeholder="Например: 123456789"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleLinkTelegram}
                      disabled={isLinking}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLinking ? 'Привязка...' : 'Привязать'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;