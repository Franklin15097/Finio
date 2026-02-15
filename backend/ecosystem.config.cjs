module.exports = {
  apps: [{
    name: 'finio-backend',
    script: './dist/index.js',
    cwd: '/var/www/studiofinance/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: '.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};
