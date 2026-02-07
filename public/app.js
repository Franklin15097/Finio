// Initialize Telegram Web App
let tg = window.Telegram.WebApp;

// Expand the app to full height
tg.expand();

// Set theme colors
document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
document.body.style.color = tg.themeParams.text_color || '#000000';

// Ready signal
tg.ready();

console.log('Telegram Web App initialized');
