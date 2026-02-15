import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Info, HelpCircle, Shield, Bell, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TelegramSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* User Profile Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 mt-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            {user?.telegram_id && (
              <p className="text-purple-400 text-xs mt-1">Telegram ID: {user.telegram_id}</p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-2">
        {/* Account Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Аккаунт</h2>
          </div>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">Профиль</p>
              <p className="text-gray-400 text-xs">Управление данными профиля</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-t border-white/10">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">Безопасность</p>
              <p className="text-gray-400 text-xs">Настройки безопасности</p>
            </div>
          </button>
        </div>

        {/* Finance Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Финансы</h2>
          </div>
          <button 
            onClick={() => navigate('/telegram/categories')}
            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">Категории</p>
              <p className="text-gray-400 text-xs">Управление категориями доходов и расходов</p>
            </div>
          </button>
        </div>

        {/* Notifications Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Уведомления</h2>
          </div>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">Настройки уведомлений</p>
              <p className="text-gray-400 text-xs">Управление уведомлениями</p>
            </div>
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Поддержка</h2>
          </div>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">Помощь</p>
              <p className="text-gray-400 text-xs">Часто задаваемые вопросы</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-t border-white/10">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">О приложении</p>
              <p className="text-gray-400 text-xs">Версия и информация</p>
            </div>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-red-500/20 to-pink-600/20 hover:from-red-500/30 hover:to-pink-600/30 text-red-300 hover:text-white rounded-2xl transition-all font-semibold border border-red-400/20 backdrop-blur-sm"
      >
        <LogOut className="w-5 h-5" />
        Выйти из аккаунта
      </button>

      {/* App Info */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img 
            src="/logo.png" 
            alt="Finio" 
            className="h-8 w-auto opacity-80"
          />
        </div>
        <p className="text-white/60 text-xs">Finio Finance Studio</p>
        <p className="text-white/40 text-[10px] mt-1">© 2026 Все права защищены</p>
        <p className="text-purple-400/60 text-[10px] mt-2">Версия 1.0.0</p>
      </div>
    </div>
  );
}
