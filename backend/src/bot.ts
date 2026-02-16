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
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
    };
    message: {
      message_id: number;
      chat: {
        id: number;
      };
    };
    data: string;
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

async function editMessage(chatId: number, messageId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
  
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
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

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text,
    }),
  });
  
  return response.json();
}

async function getUserToken(telegramId: number): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/telegram-user-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId }),
    });
    
    const data: any = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
}

async function getUserBalance(token: string): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error getting balance:', error);
    return null;
  }
}

async function addTransaction(token: string, type: string, amount: number, description: string, categoryId?: number) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        amount,
        description,
        category_id: categoryId,
        transaction_date: new Date().toISOString().split('T')[0],
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
}

async function getCategories(token: string, type: string): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const categories = await response.json();
    return categories.filter((c: any) => c.type === type);
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
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
  // Handle callback queries (button clicks)
  if (update.callback_query) {
    const callbackQuery = update.callback_query;
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const telegramId = callbackQuery.from.id;
    
    console.log(`Received callback from ${telegramId}: ${data}`);
    
    const token = await getUserToken(telegramId);
    
    if (!token) {
      await answerCallbackQuery(callbackQuery.id, 'Ошибка авторизации');
      return;
    }
    
    // Handle category selection for adding transaction
    if (data.startsWith('add_expense_') || data.startsWith('add_income_')) {
      const parts = data.split('_');
      const type = parts[1]; // expense or income
      const categoryId = parseInt(parts[2]);
      const amount = parseFloat(parts[3]);
      const description = parts.slice(4).join('_');
      
      const result = await addTransaction(token, type, amount, description, categoryId);
      
      if (result && result.id) {
        await editMessage(
          chatId,
          messageId,
          `✅ <b>Транзакция добавлена!</b>\n\n` +
          `${type === 'income' ? '💰 Доход' : '💸 Расход'}: <b>${amount} ₽</b>\n` +
          `📝 ${description}\n\n` +
          `Используйте /balance для просмотра баланса`
        );
        await answerCallbackQuery(callbackQuery.id, '✅ Добавлено!');
      } else {
        await answerCallbackQuery(callbackQuery.id, '❌ Ошибка при добавлении');
      }
    }
    
    return;
  }
  
  if (!update.message || !update.message.text) return;
  
  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text;
  const telegramId = message.from.id;
  const firstName = message.from.first_name;
  
  console.log(`Received message from ${firstName} (${telegramId}): ${text}`);
  
  // Handle /add command: /add 500 продукты
  if (text.startsWith('/add ')) {
    const token = await getUserToken(telegramId);
    
    if (!token) {
      await sendMessage(chatId, '❌ Сначала авторизуйтесь через /start');
      return;
    }
    
    const parts = text.slice(5).trim().split(' ');
    
    if (parts.length < 2) {
      await sendMessage(
        chatId,
        `❌ <b>Неверный формат команды</b>\n\n` +
        `<b>Использование:</b>\n` +
        `/add [сумма] [описание]\n\n` +
        `<b>Примеры:</b>\n` +
        `/add 500 продукты\n` +
        `/add 1000 зарплата\n` +
        `/add 150 кофе`
      );
      return;
    }
    
    const amount = parseFloat(parts[0]);
    const description = parts.slice(1).join(' ');
    
    if (isNaN(amount) || amount <= 0) {
      await sendMessage(chatId, '❌ Неверная сумма. Укажите положительное число.');
      return;
    }
    
    // Ask user to choose type and category
    await sendMessage(
      chatId,
      `💰 <b>Добавление транзакции</b>\n\n` +
      `<b>Сумма:</b> ${amount} ₽\n` +
      `<b>Описание:</b> ${description}\n\n` +
      `Выберите тип транзакции:`,
      {
        inline_keyboard: [
          [
            {
              text: '💸 Расход',
              callback_data: `choose_expense_${amount}_${description}`
            },
            {
              text: '💰 Доход',
              callback_data: `choose_income_${amount}_${description}`
            }
          ]
        ]
      }
    );
    
    return;
  }
  
  // Handle category selection
  if (text.startsWith('choose_expense_') || text.startsWith('choose_income_')) {
    const token = await getUserToken(telegramId);
    
    if (!token) {
      await sendMessage(chatId, '❌ Ошибка авторизации');
      return;
    }
    
    const parts = text.split('_');
    const type = parts[1]; // expense or income
    const amount = parseFloat(parts[2]);
    const description = parts.slice(3).join('_');
    
    const categories = await getCategories(token, type);
    
    if (categories.length === 0) {
      // Add without category
      const result = await addTransaction(token, type, amount, description);
      
      if (result && result.id) {
        await sendMessage(
          chatId,
          `✅ <b>Транзакция добавлена!</b>\n\n` +
          `${type === 'income' ? '💰 Доход' : '💸 Расход'}: <b>${amount} ₽</b>\n` +
          `📝 ${description}`
        );
      } else {
        await sendMessage(chatId, '❌ Ошибка при добавлении транзакции');
      }
      
      return;
    }
    
    // Show categories
    const keyboard = categories.slice(0, 10).map(cat => [{
      text: `${cat.icon} ${cat.name}`,
      callback_data: `add_${type}_${cat.id}_${amount}_${description}`
    }]);
    
    // Add "Without category" button
    keyboard.push([{
      text: '📝 Без категории',
      callback_data: `add_${type}_0_${amount}_${description}`
    }]);
    
    await sendMessage(
      chatId,
      `📂 <b>Выберите категорию</b>\n\n` +
      `${type === 'income' ? '💰 Доход' : '💸 Расход'}: <b>${amount} ₽</b>\n` +
      `📝 ${description}`,
      { inline_keyboard: keyboard }
    );
    
    return;
  }
  
  // Handle /balance command
  if (text === '/balance') {
    const token = await getUserToken(telegramId);
    
    if (!token) {
      await sendMessage(chatId, '❌ Сначала авторизуйтесь через /start');
      return;
    }
    
    const stats = await getUserBalance(token);
    
    if (!stats) {
      await sendMessage(chatId, '❌ Ошибка при получении баланса');
      return;
    }
    
    const balance = parseFloat(stats.balance || 0);
    const income = parseFloat(stats.totalIncome || 0);
    const expense = parseFloat(stats.totalExpense || 0);
    
    await sendMessage(
      chatId,
      `💰 <b>Ваш баланс</b>\n\n` +
      `<b>Текущий баланс:</b> ${balance.toFixed(0)} ₽\n\n` +
      `📈 <b>Доходы:</b> ${income.toFixed(0)} ₽\n` +
      `📉 <b>Расходы:</b> ${expense.toFixed(0)} ₽\n\n` +
      `💡 Используйте /add для быстрого добавления транзакции`,
      {
        inline_keyboard: [
          [
            {
              text: '📱 Открыть приложение',
              web_app: { url: FRONTEND_URL }
            }
          ]
        ]
      }
    );
    
    return;
  }
  
  if (text === '/start') {
    try {
      // Generate auth token
      const authToken = await generateAuthToken(telegramId);
      const authUrl = `${FRONTEND_URL}?auth=${authToken}`;
      
      await sendMessage(
        chatId,
        `🎉 <b>Добро пожаловать в Finio!</b>\n\n` +
        `👋 Привет, ${firstName}!\n\n` +
        `<b>Finio</b> — это ваш личный финансовый помощник, который поможет:\n\n` +
        `💰 Отслеживать доходы и расходы\n` +
        `📊 Анализировать финансы с помощью графиков\n` +
        `🎯 Достигать финансовых целей\n` +
        `💳 Управлять несколькими счетами\n\n` +
        `<b>Быстрые команды:</b>\n` +
        `/add 500 продукты - добавить транзакцию\n` +
        `/balance - посмотреть баланс\n\n` +
        `<b>Выберите, как хотите использовать Finio:</b>`,
        {
          inline_keyboard: [
            [
              {
                text: '📱 Открыть Mini App',
                web_app: { url: FRONTEND_URL }
              }
            ],
            [
              {
                text: '🌐 Открыть Сайт',
                url: authUrl
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
  } else if (text === '/app') {
    // Open Mini App
    await sendMessage(
      chatId,
      `📱 <b>Открыть Finio Mini App</b>\n\n` +
      `Нажмите кнопку ниже, чтобы открыть приложение прямо в Telegram:`,
      {
        inline_keyboard: [
          [
            {
              text: '📱 Открыть Mini App',
              web_app: { url: FRONTEND_URL }
            }
          ]
        ]
      }
    );
  } else if (text === '/site') {
    // Open website with auth
    try {
      const authToken = await generateAuthToken(telegramId);
      const authUrl = `${FRONTEND_URL}?auth=${authToken}`;
      
      await sendMessage(
        chatId,
        `🌐 <b>Открыть Finio в браузере</b>\n\n` +
        `Нажмите кнопку ниже, чтобы открыть сайт с автоматической авторизацией:`,
        {
          inline_keyboard: [
            [
              {
                text: '🌐 Открыть Сайт',
                url: authUrl
              }
            ]
          ]
        }
      );
    } catch (error) {
      console.error('Error generating auth token:', error);
      await sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
    }
  } else if (text === '/help') {
    await sendMessage(
      chatId,
      `📖 <b>Помощь по Finio</b>\n\n` +
      `<b>Доступные команды:</b>\n\n` +
      `/start - Начать работу с Finio\n` +
      `/add [сумма] [описание] - Добавить транзакцию\n` +
      `/balance - Посмотреть баланс\n` +
      `/app - Открыть Mini App в Telegram\n` +
      `/site - Открыть сайт в браузере\n` +
      `/help - Показать эту справку\n` +
      `/about - О приложении\n\n` +
      `<b>Примеры использования:</b>\n\n` +
      `/add 500 продукты\n` +
      `/add 1000 зарплата\n` +
      `/add 150 кофе\n\n` +
      `<b>Возможности Finio:</b>\n\n` +
      `• Учёт доходов и расходов\n` +
      `• Категории транзакций\n` +
      `• Несколько счетов\n` +
      `• Графики и аналитика\n` +
      `• Бюджеты и цели\n\n` +
      `💡 <b>Совет:</b> Используйте кнопку Menu (☰) для быстрого доступа к командам!`
    );
  } else if (text === '/about') {
    await sendMessage(
      chatId,
      `ℹ️ <b>О Finio</b>\n\n` +
      `<b>Finio</b> — современный финансовый помощник для управления личными финансами.\n\n` +
      `<b>Версия:</b> 1.0.0\n` +
      `<b>Платформа:</b> Web + Telegram Mini App\n\n` +
      `<b>Основные функции:</b>\n\n` +
      `💰 <b>Учёт финансов</b>\n` +
      `Отслеживайте все доходы и расходы в одном месте\n\n` +
      `📊 <b>Аналитика</b>\n` +
      `Красивые графики и статистика по вашим финансам\n\n` +
      `💳 <b>Счета</b>\n` +
      `Управляйте несколькими счетами и картами\n\n` +
      `🎯 <b>Цели</b>\n` +
      `Ставьте финансовые цели и достигайте их\n\n` +
      `🔒 <b>Безопасность</b>\n` +
      `Все данные защищены и хранятся надёжно\n\n` +
      `Используйте /start чтобы начать!`
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
    { command: 'add', description: '💰 Добавить транзакцию' },
    { command: 'balance', description: '💳 Посмотреть баланс' },
    { command: 'app', description: '📱 Открыть приложение' },
    { command: 'site', description: '🌐 Открыть сайт' },
    { command: 'help', description: '📖 Помощь и информация' },
    { command: 'about', description: 'ℹ️ О приложении' }
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

async function setMenuButton() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`;
  
  // Set default menu button (shows commands)
  const menuButton = {
    type: 'commands'
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu_button: menuButton }),
    });
    
    const data: any = await response.json();
    if (data.ok) {
      console.log('✅ Menu button set to commands');
    } else {
      console.error('Failed to set menu button:', data);
    }
  } catch (error) {
    console.error('Error setting menu button:', error);
  }
}

async function startBot() {
  console.log('🤖 Telegram bot started');
  console.log('Bot token configured:', !!TELEGRAM_BOT_TOKEN);
  console.log('Backend URL:', BACKEND_URL);
  console.log('Frontend URL:', FRONTEND_URL);
  
  // Set bot commands
  await setCommands();
  
  // Set menu button
  await setMenuButton();
  
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
