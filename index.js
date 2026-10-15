const http = require('http');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const PORT = process.env.PORT || 10000;

// سيرفر واحد بس عشان Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Nader Store is Running ✅');
});

server.listen(PORT, () => {
  console.log('Server Running on ' + PORT);
});

if (!token) {
  console.log('❌ TELEGRAM_BOT_TOKEN is missing in Render Environment');
} else {
  const bot = new Telegraf(token);

  bot.start((ctx) => {
    ctx.reply('أهلا بيك في Nader Store 🏰\nاختار من القايمة:', {
      reply_markup: {
        keyboard: [
          [{ text: '🏪 المتجر' }, { text: '💰 المحفظة' }],
          [{ text: '👤 حسابي' }, { text: '🎧 الدعم' }]
        ],
        resize_keyboard: true
      }
    });
  });

  bot.hears('🏪 المتجر', (ctx) => ctx.reply('المتجر قريبا... 🏪'));
  bot.hears('💰 المحفظة', (ctx) => ctx.reply('محفظتك: 0 جنيه 💰'));
  bot.hears('👤 حسابي', (ctx) => ctx.reply('حسابك... 👤'));
  bot.hears('🎧 الدعم', (ctx) => ctx.reply('الدعم الفني 🎧'));

  bot.launch().then(() => console.log('✅ Bot Started'));

  console.log('✅ Bot trying to start...');
}
