const { Telegraf } = require('telegraf');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

if (!token) {
  console.log('❌ مفيش توكن! حط TELEGRAM_BOT_TOKEN في Render Environment');
} else {
  const bot = new Telegraf(token);

  bot.start((ctx) => {
    ctx.reply('أهلا بيك في Nader Store 🏰\n\nاختار من القايمة:', {
      reply_markup: {
        keyboard: [
          [{ text: '🏪 المتجر' }, { text: '💰 المحفظة' }],
          [{ text: '👤 حسابي' }, { text: '🎧 الدعم' }]
        ],
        resize_keyboard: true
      }
    });
  });

  bot.hears('🏪 المتجر', (ctx) => ctx.reply('المتجر قريباً... 🏪'));
  bot.hears('💰 المحفظة', (ctx) => ctx.reply('محفظتك: 0 جنيه 💰'));
  bot.hears('👤 حسابي', (ctx) => ctx.reply('حسابك... 👤'));
  bot.hears('🎧 الدعم', (ctx) => ctx.reply('الدعم الفني @... 🎧'));

  bot.launch().then(() => {
    console.log('✅ Nader Store Bot Started');
  });

  // عشان Render ميفصلش
  const http = require('http');
  http.createServer((req, res) => res.end('Bot Running ✅')).listen(process.env.PORT || 10000);
}
