import { isTelegramWebApp } from '../utils/telegram';
import TelegramAnalytics from './telegram/TelegramAnalytics';

export default function Analytics() {
  if (isTelegramWebApp()) {
    return <TelegramAnalytics />;
  }

  // Desktop version - same component works for both
  return <TelegramAnalytics />;
}
