import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://studiofinance.ru';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
    };
    text?: string;
  };
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
  };
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  return response.json();
}

async function generateAuthToken(telegramId: number): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/auth/generate-auth-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramId }),
  });
  
  const data: any = await response.json();
  return data.authToken;
}

async function handleUpdate(update: TelegramUpdate) {
  if (!update.message || !update.message.text) return;
  
  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text;
  const telegramId = message.from.id;
  const firstName = message.from.first_name;
  
  console.log(`Received message from ${firstName} (${telegramId}): ${text}`);
  
  if (text === '/start') {
    try {
      // Generate auth token
      const authToken = await generateAuthToken(telegramId);
      const authUrl = `${FRONTEND_URL}?auth=${authToken}`;
      const miniAppUrl = `https://t.me/FinanceStudio_bot/app`;
      
      await sendMessage(
        chatId,
        `🎉 <b>Добро пожаловать в Finio!</b>\n\n` +
        `👋 Привет, ${firstName}!\n\n` +
        `<b>Finio</b> — это ваш личный финансовый помощник, который поможет:\n\n` +
        `💰 Отслеживать доходы и расходы\n` +
        `📊 Анализировать финансы с помощью графиков\n` +
        `🎯 Достигать финансовых целей\n` +
        `💳 Управлять несколькими счетами\n\n` +
        `<b>Выберите, как хотите использовать Finio:</b>`,
        {
          inline_keyboard: [
            [
              {
                text: '🌐 Открыть Сайт',
                url: authUrl
              }
            ],
            [
              {
                text: '📱 Открыть Mini App',
                url: miniAppUrl
              }
            ]
          ]
        }
      );
      
      console.log(`Sent welcome message to user ${telegramId}`);
    } catch (error) {
      console.error('Error handling /start:', error);
      await sendMessage(
        chatId,
        '❌ Произошла ошибка. Попробуйте позже.'
      );
    }
  } else if (text === '/help') {
    await sendMessage(
      chatId,
      `📖 <b>Помощь по Finio</b>\n\n` +
      `<b>Доступные команды:</b>\n\n` +
      `/start - Начать работу с Finio\n` +
      `/help - Показать эту справку\n\n` +
      `<b>Возможности Finio:</b>\n\n` +
      `• Учёт доходов и расходов\n` +
      `• Категории транзакций\n` +
      `• Несколько счетов\n` +
      `• Графики и аналитика\n` +
      `• Бюджеты и цели\n\n` +
      `Используйте /start чтобы открыть приложение!`
    );
  }
}

async function getUpdates(offset: number = 0): Promise<TelegramUpdate[]> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;
  
  try {
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (data.ok) {
      return data.result;
    }
    
    console.error('Error getting updates:', data);
    return [];
  } catch (error) {
    console.error('Error fetching updates:', error);
    return [];
  }
}

async function setCommands() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`;
  
  const commands = [
    { command: 'start', description: '🚀 Начать работу с Finio' },
    { command: 'help', description: '📖 Помощь и информация' }
  ];
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
    });
    
    const data: any = await response.json();
    if (data.ok) {
      console.log('✅ Bot commands set successfully');
    } else {
      console.error('Failed to set commands:', data);
    }
  } catch (error) {
    console.error('Error setting commands:', error);
  }
}

async function startBot() {
  console.log('🤖 Telegram bot started');
  console.log('Bot token configured:', !!TELEGRAM_BOT_TOKEN);
  console.log('Backend URL:', BACKEND_URL);
  console.log('Frontend URL:', FRONTEND_URL);
  
  // Set bot commands
  await setCommands();
  
  let offset = 0;
  
  while (true) {
    try {
      const updates = await getUpdates(offset);
      
      for (const update of updates) {
        await handleUpdate(update);
        offset = update.update_id + 1;
      }
    } catch (error) {
      console.error('Error in bot loop:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startBot();
