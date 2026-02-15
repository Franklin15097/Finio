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
}

export default function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const SelectedIconComponent = ICONS.find(i => i.name === selectedIcon)?.component;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
          {SelectedIconComponent ? (
            <SelectedIconComponent className="w-8 h-8 text-white" />
          ) : (
            <DollarSign className="w-8 h-8 text-white" />
          )}
        </div>
        <div>
          <p className="text-white font-medium">Выбранная иконка</p>
          <p className="text-gray-400 text-sm">Выберите из списка ниже</p>
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
    </div>
  );
}

// Export icon component getter
export function getIconComponent(iconName: string) {
  const icon = ICONS.find(i => i.name === iconName);
  return icon?.component || DollarSign;
}
