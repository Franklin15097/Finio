import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

export const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    'Добро пожаловать в Studio Finance!',
    Markup.keyboard([
      Markup.button.webApp('Открыть Mini App', process.env.MINI_APP_URL)
    ]).resize()
  );
});

bot.command('app', (ctx) => {
  ctx.reply(
    'Нажмите кнопку ниже, чтобы открыть приложение:',
    Markup.inlineKeyboard([
      Markup.button.webApp('Открыть Mini App', process.env.MINI_APP_URL)
    ])
  );
});

bot.on('message', (ctx) => {
  ctx.reply('Используйте команду /start или /app');
});

console.log('Bot initialized');
