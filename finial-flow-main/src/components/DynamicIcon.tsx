import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Wallet: LucideIcons.Wallet,
  TrendingUp: LucideIcons.TrendingUp,
  TrendingDown: LucideIcons.TrendingDown,
  PiggyBank: LucideIcons.PiggyBank,
  Briefcase: LucideIcons.Briefcase,
  Laptop: LucideIcons.Laptop,
  Gift: LucideIcons.Gift,
  ShoppingCart: LucideIcons.ShoppingCart,
  Car: LucideIcons.Car,
  Film: LucideIcons.Film,
  Coffee: LucideIcons.Coffee,
  Shirt: LucideIcons.Shirt,
  Heart: LucideIcons.Heart,
  Smartphone: LucideIcons.Smartphone,
  Home: LucideIcons.Home,
  DollarSign: LucideIcons.DollarSign,
  CreditCard: LucideIcons.CreditCard,
  Bus: LucideIcons.Bus,
  Train: LucideIcons.Train,
  Bike: LucideIcons.Bike,
  Plane: LucideIcons.Plane,
  Fuel: LucideIcons.Fuel,
  ShoppingBag: LucideIcons.ShoppingBag,
  Utensils: LucideIcons.Utensils,
  Music: LucideIcons.Music,
  Book: LucideIcons.Book,
  Gamepad2: LucideIcons.Gamepad2,
  GraduationCap: LucideIcons.GraduationCap,
  Wrench: LucideIcons.Wrench,
  Zap: LucideIcons.Zap,
  Pizza: LucideIcons.Pizza,
  IceCreamCone: LucideIcons.IceCreamCone,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = iconMap[name] || LucideIcons.CircleDot;
  return <Icon {...props} />;
}

export const availableIcons = Object.keys(iconMap);
