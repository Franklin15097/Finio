# 🎨 Design System v3.0

Полное руководство по дизайн-системе Finio v3.0 с Glassmorphism, анимациями и темами.

## 📋 Содержание

- [Цветовые темы](#цветовые-темы)
- [Компоненты](#компоненты)
- [Анимации](#анимации)
- [Использование](#использование)

## 🎨 Цветовые темы

### Доступные темы

#### 1. Ocean Breeze 🌊
```typescript
primary: '#0EA5E9' (Sky Blue)
secondary: '#06B6D4' (Cyan)
accent: '#8B5CF6' (Purple)
background: Gradient от #0F172A к #1E293B
```
**Использование**: Профессиональный, спокойный, технологичный

#### 2. Sunset Glow 🌅
```typescript
primary: '#F59E0B' (Amber)
secondary: '#EF4444' (Red)
accent: '#EC4899' (Pink)
background: Gradient от #7C2D12 к #1C1917
```
**Использование**: Энергичный, теплый, мотивирующий

#### 3. Forest Green 🌲
```typescript
primary: '#10B981' (Emerald)
secondary: '#059669' (Green)
accent: '#14B8A6' (Teal)
background: Gradient от #064E3B к #1F2937
```
**Использование**: Природный, успокаивающий, финансовый

#### 4. Midnight Purple 🌙
```typescript
primary: '#8B5CF6' (Violet)
secondary: '#A78BFA' (Purple)
accent: '#EC4899' (Pink)
background: Gradient от #1E1B4B к #0F172A
```
**Использование**: Премиум, креативный, ночной режим

#### 5. Cherry Blossom 🌸
```typescript
primary: '#F472B6' (Pink)
secondary: '#FB7185' (Rose)
accent: '#FCA5A5' (Red)
background: Gradient от #500724 к #1F2937
```
**Использование**: Нежный, романтичный, весенний

### Переключение темы

```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, themeName, setTheme, availableThemes } = useTheme();
  
  return (
    <select value={themeName} onChange={(e) => setTheme(e.target.value)}>
      {Object.keys(availableThemes).map(name => (
        <option key={name} value={name}>
          {availableThemes[name].displayName}
        </option>
      ))}
    </select>
  );
}
```

## 🧩 Компоненты

### GlassCard

Карточка с эффектом glassmorphism.

```typescript
import GlassCard from '../components/GlassCard';

<GlassCard hover onClick={() => console.log('clicked')}>
  <p>Контент карточки</p>
</GlassCard>
```

**Props:**
- `children`: ReactNode - содержимое
- `className`: string - дополнительные классы
- `hover`: boolean - эффект при наведении
- `onClick`: () => void - обработчик клика
- `style`: CSSProperties - дополнительные стили

### CircularProgress

Круговой прогресс-бар с анимацией.

```typescript
import CircularProgress from '../components/CircularProgress';

<CircularProgress
  value={750}
  max={1000}
  size={120}
  label="Еда"
  animated
  gradient
/>
```

**Props:**
- `value`: number - текущее значение
- `max`: number - максимальное значение
- `size`: number - размер (default: 120)
- `strokeWidth`: number - толщина линии (default: 8)
- `label`: string - подпись
- `showPercentage`: boolean - показывать процент (default: true)
- `animated`: boolean - анимация (default: true)
- `gradient`: boolean - градиент (default: true)

### StatCard

Карточка статистики с иконкой и трендом.

```typescript
import StatCard from '../components/StatCard';
import { Wallet } from 'lucide-react';

<StatCard
  title="Общий баланс"
  value="125,430 ₽"
  icon={<Wallet />}
  trend={{ value: 12.5, isPositive: true }}
  subtitle="За последний месяц"
  gradient
  onClick={() => navigate('/balance')}
/>
```

**Props:**
- `title`: string - заголовок
- `value`: string - значение
- `icon`: ReactNode - иконка
- `trend`: { value: number, isPositive: boolean } - тренд
- `subtitle`: string - подзаголовок
- `onClick`: () => void - обработчик клика
- `gradient`: boolean - градиентный текст

### Timeline

Временная шкала транзакций.

```typescript
import Timeline, { TimelineDay, TimelineItem } from '../components/Timeline';

<Timeline>
  <TimelineDay date="16 февраля 2024">
    <TimelineItem
      icon="🍕"
      title="Доставка еды"
      amount="850 ₽"
      time="14:30"
      category="Еда"
      type="expense"
      onClick={() => console.log('clicked')}
    />
  </TimelineDay>
</Timeline>
```

### HeatmapCalendar

Календарь с тепловой картой активности.

```typescript
import HeatmapCalendar from '../components/HeatmapCalendar';

const data = [
  { date: '2024-02-16', amount: 2500 },
  { date: '2024-02-15', amount: 1200 },
];

<HeatmapCalendar
  data={data}
  title="Активность расходов"
  type="expense"
/>
```

### Button

Кнопка с различными вариантами.

```typescript
import Button from '../components/Button';
import { Plus } from 'lucide-react';

<Button variant="primary" size="lg" icon={<Plus />} fullWidth>
  Добавить транзакцию
</Button>
```

**Варианты:**
- `primary` - основная кнопка с градиентом
- `secondary` - вторичная с обводкой
- `ghost` - прозрачная
- `icon` - только иконка

**Размеры:**
- `sm` - маленькая
- `md` - средняя (default)
- `lg` - большая

### SuccessModal

Модальное окно успеха/ошибки.

```typescript
import SuccessModal from '../components/SuccessModal';

<SuccessModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  type="success"
  title="Транзакция добавлена!"
  message="Данные обновлены"
  autoClose={2000}
  showConfetti
/>
```

**Типы:**
- `success` - успех (зеленый)
- `error` - ошибка (красный)
- `warning` - предупреждение (желтый)
- `info` - информация (синий)

### SwipeableCard

Карточка с swipe-действиями.

```typescript
import SwipeableCard from '../components/SwipeableCard';

<SwipeableCard
  onDelete={() => handleDelete()}
  onEdit={() => handleEdit()}
>
  <div>Контент карточки</div>
</SwipeableCard>
```

**Жесты:**
- Свайп влево - удалить (красный)
- Свайп вправо - редактировать (синий)

### PullToRefresh

Обновление по pull-down жесту.

```typescript
import PullToRefresh from '../components/PullToRefresh';

<PullToRefresh onRefresh={async () => await loadData()}>
  <div>Контент для обновления</div>
</PullToRefresh>
```

### BottomNavigation

Нижняя навигация для мобильных.

```typescript
import BottomNavigation from '../components/BottomNavigation';

<BottomNavigation />
```

**Автоматически:**
- Определяет активную страницу
- Подсвечивает текущий раздел
- Центральная кнопка "+" для быстрого добавления

### ParticlesBackground

Анимированный фон с частицами.

```typescript
import ParticlesBackground from '../components/ParticlesBackground';

<ParticlesBackground />
```

**Особенности:**
- Интерактивность с мышью
- Соединение близких частиц
- Адаптация к теме
- Оптимизация производительности

## 🎬 Анимации

### CSS классы

```css
/* Появление */
.animate-fade-in
.animate-fade-in-scale
.animate-slide-in-right
.animate-slide-in-left

/* Циклические */
.animate-bounce
.animate-pulse
.animate-shimmer
.animate-glow
.animate-float
.animate-rotate

/* Hover эффекты */
.hover-lift
.hover-scale
.hover-glow

/* Переходы */
.transition-smooth
.transition-bounce
```

### Использование

```typescript
<div className="animate-fade-in hover-lift">
  Контент с анимацией
</div>
```

## 🎯 Примеры использования

### Полный Dashboard

```typescript
import { useTheme } from '../context/ThemeContext';
import ParticlesBackground from '../components/ParticlesBackground';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import CircularProgress from '../components/CircularProgress';
import BottomNavigation from '../components/BottomNavigation';

export default function Dashboard() {
  const { theme } = useTheme();

  return (
    <div style={{ background: theme.colors.backgroundGradient }}>
      <ParticlesBackground />
      
      <div className="relative z-10 p-6">
        <GlassCard className="p-6 mb-4">
          <h1 style={{ color: theme.colors.text }}>
            Привет! 👋
          </h1>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Баланс"
            value="125,430 ₽"
            icon={<Wallet />}
            gradient
          />
        </div>

        <CircularProgress
          value={750}
          max={1000}
          label="Бюджет"
        />
      </div>

      <BottomNavigation />
    </div>
  );
}
```

### Список с Timeline

```typescript
import Timeline, { TimelineDay, TimelineItem } from '../components/Timeline';
import SwipeableCard from '../components/SwipeableCard';

export default function TransactionsList() {
  return (
    <Timeline>
      <TimelineDay date="Сегодня">
        <SwipeableCard
          onDelete={() => handleDelete()}
          onEdit={() => handleEdit()}
        >
          <TimelineItem
            icon="🍕"
            title="Обед"
            amount="850 ₽"
            time="14:30"
            type="expense"
          />
        </SwipeableCard>
      </TimelineDay>
    </Timeline>
  );
}
```

## 🎨 Кастомизация

### Создание своей темы

```typescript
// frontend/src/styles/themes.ts

export const themes: Record<string, Theme> = {
  // ... существующие темы
  
  myCustomTheme: {
    name: 'myCustomTheme',
    displayName: '✨ My Theme',
    colors: {
      primary: '#YOUR_COLOR',
      secondary: '#YOUR_COLOR',
      accent: '#YOUR_COLOR',
      background: '#YOUR_COLOR',
      backgroundGradient: 'linear-gradient(...)',
      surface: 'rgba(...)',
      surfaceGlass: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: '#AAAAAA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px 0 rgba(...)',
      glow: '0 0 20px rgba(...)',
    },
  },
};
```

### Переопределение стилей компонента

```typescript
<GlassCard
  style={{
    background: 'rgba(255, 0, 0, 0.1)',
    border: '2px solid red',
  }}
  className="custom-class"
>
  Контент
</GlassCard>
```

## 📱 Адаптивность

Все компоненты адаптивны и работают на:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

### Рекомендации

- Используйте `BottomNavigation` на мобильных
- `SwipeableCard` и `PullToRefresh` только на touch-устройствах
- `ParticlesBackground` автоматически оптимизируется

## 🚀 Производительность

### Оптимизация

1. **Lazy loading компонентов**
```typescript
const HeatmapCalendar = lazy(() => import('../components/HeatmapCalendar'));
```

2. **Мемоизация**
```typescript
const MemoizedStatCard = memo(StatCard);
```

3. **Виртуализация списков**
```typescript
import { FixedSizeList } from 'react-window';
```

## 📚 Дополнительные ресурсы

- [Glassmorphism Generator](https://glassmorphism.com/)
- [Lucide Icons](https://lucide.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) (опционально)

---

**Версия**: 3.0.0  
**Дата**: 16 февраля 2026  
**Автор**: Finio Team
