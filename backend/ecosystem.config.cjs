module.exports = {
  apps: [
    {
      name: 'finio-backend',
      script: './dist/index.js',
      cwd: '/var/www/studiofinance/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USER: 'app_user',
        DB_PASSWORD: 'app_password',
        DB_NAME: 'financial_db',
        JWT_SECRET: 'finio-secret-key-production-18653dc238ae00fe89f8b607575114a2b1a7c3dbe2150080cda70503a928db02',
        TELEGRAM_BOT_TOKEN: '8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34',
        BACKEND_URL: 'http://localhost:5000',
        FRONTEND_URL: 'https://studiofinance.ru'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'finio-bot',
      script: './dist/bot.js',
      cwd: '/var/www/studiofinance/backend',
      env: {
        NODE_ENV: 'production',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USER: 'app_user',
        DB_PASSWORD: 'app_password',
        DB_NAME: 'financial_db',
        TELEGRAM_BOT_TOKEN: '8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34',
        BACKEND_URL: 'http://localhost:5000',
        FRONTEND_URL: 'https://studiofinance.ru'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    }
  ]
};
