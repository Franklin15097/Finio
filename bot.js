require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const webAppUrl = process.env.WEBAPP_URL;

// Start command
bot.start((ctx) => {
  const firstName = ctx.from.first_name || 'User';
  
  return ctx.reply(
    `Привет, ${firstName}! 👋\n\nДобро пожаловать в Studio Finance.`,
    Markup.keyboard([
      Markup.button.webApp('🚀 Открыть приложение', webAppUrl)
    ]).resize()
  );
});

// Handle web app data
bot.on('web_app_data', (ctx) => {
  const data = ctx.webAppData.data.string();
  return ctx.reply(`Получены данные: ${data}`);
});

// Handle errors
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Launch bot
bot.launch()
  .then(() => console.log('✅ Bot is running...'))
  .catch((err) => console.error('❌ Bot launch error:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
