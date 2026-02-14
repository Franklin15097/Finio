import { useState } from 'react';
import {
  DollarSign, TrendingUp, Briefcase, Home, Car, ShoppingCart, Coffee,
  Utensils, Film, Gamepad2, Heart, Plane, Gift, Book, Music,
  Smartphone, Laptop, Shirt, Zap, Droplet, Wifi, CreditCard,
  PiggyBank, Wallet, Building, GraduationCap, Stethoscope, Wrench,
  ShoppingBag, Pizza, IceCream, Fuel, Bus, Train, Bike
} from 'lucide-react';

const ICONS = [
  { name: 'DollarSign', component: DollarSign, label: 'Деньги' },
  { name: 'TrendingUp', component: TrendingUp, label: 'Рост' },
  { name: 'Briefcase', component: Briefcase, label: 'Работа' },
  { name: 'Home', component: Home, label: 'Дом' },
  { name: 'Car', component: Car, label: 'Авто' },
  { name: 'ShoppingCart', component: ShoppingCart, label: 'Покупки' },
  { name: 'Coffee', component: Coffee, label: 'Кофе' },
  { name: 'Utensils', component: Utensils, label: 'Еда' },
  { name: 'Film', component: Film, label: 'Кино' },
  { name: 'Gamepad2', component: Gamepad2, label: 'Игры' },
  { name: 'Heart', component: Heart, label: 'Здоровье' },
  { name: 'Plane', component: Plane, label: 'Путешествия' },
  { name: 'Gift', component: Gift, label: 'Подарки' },
  { name: 'Book', component: Book, label: 'Книги' },
  { name: 'Music', component: Music, label: 'Музыка' },
  { name: 'Smartphone', component: Smartphone, label: 'Телефон' },
  { name: 'Laptop', component: Laptop, label: 'Компьютер' },
  { name: 'Shirt', component: Shirt, label: 'Одежда' },
  { name: 'Zap', component: Zap, label: 'Электричество' },
  { name: 'Droplet', component: Droplet, label: 'Вода' },
  { name: 'Wifi', component: Wifi, label: 'Интернет' },
  { name: 'CreditCard', component: CreditCard, label: 'Карта' },
  { name: 'PiggyBank', component: PiggyBank, label: 'Накопления' },
  { name: 'Wallet', component: Wallet, label: 'Кошелёк' },
  { name: 'Building', component: Building, label: 'Здание' },
  { name: 'GraduationCap', component: GraduationCap, label: 'Образование' },
  { name: 'Stethoscope', component: Stethoscope, label: 'Медицина' },
  { name: 'Wrench', component: Wrench, label: 'Ремонт' },
  { name: 'ShoppingBag', component: ShoppingBag, label: 'Магазин' },
  { name: 'Pizza', component: Pizza, label: 'Пицца' },
  { name: 'IceCream', component: IceCream, label: 'Десерт' },
  { name: 'Fuel', component: Fuel, label: 'Топливо' },
  { name: 'Bus', component: Bus, label: 'Автобус' },
  { name: 'Train', component: Train, label: 'Поезд' },
  { name: 'Bike', component: Bike, label: 'Велосипед' },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  onUploadImage?: (file: File) => void;
}

export default function IconPicker({ selectedIcon, onSelectIcon, onUploadImage }: IconPickerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100KB)
      if (file.size > 100 * 1024) {
        alert('Файл слишком большой. Максимум 100KB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/png')) {
        alert('Только PNG файлы');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadedImage(dataUrl);
        onSelectIcon(dataUrl);
        if (onUploadImage) {
          onUploadImage(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const SelectedIconComponent = ICONS.find(i => i.name === selectedIcon)?.component;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
          {selectedIcon.startsWith('data:') ? (
            <img src={selectedIcon} alt="Custom" className="w-10 h-10 object-contain" />
          ) : SelectedIconComponent ? (
            <SelectedIconComponent className="w-8 h-8 text-white" />
          ) : (
            <DollarSign className="w-8 h-8 text-white" />
          )}
        </div>
        <div>
          <p className="text-white font-medium">Выбранная иконка</p>
          <p className="text-gray-400 text-sm">Выберите из списка или загрузите свою</p>
        </div>
      </div>

      {/* Icon Grid */}
      <div className="max-h-48 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 pr-2">
          {ICONS.map((icon) => {
            const IconComponent = icon.component;
            const isSelected = selectedIcon === icon.name;
            return (
              <button
                key={icon.name}
                type="button"
                onClick={() => onSelectIcon(icon.name)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 scale-105'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                title={icon.label}
              >
                <IconComponent className="w-6 h-6 text-white flex-shrink-0" />
                <span className="text-white text-sm font-medium truncate">{icon.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Custom Image */}
      <div className="border-t border-white/10 pt-4">
        <label className="block">
          <div className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all text-center">
            <p className="text-white font-medium">📁 Загрузить свою иконку</p>
            <p className="text-gray-400 text-xs mt-1">PNG, макс. 100KB, 64x64px</p>
          </div>
          <input
            type="file"
            accept="image/png"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

// Export icon component getter
export function getIconComponent(iconName: string) {
  if (iconName.startsWith('data:')) {
    return () => <img src={iconName} alt="Custom" className="w-full h-full object-contain" />;
  }
  const icon = ICONS.find(i => i.name === iconName);
  return icon?.component || DollarSign;
}
