const express = require('express');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN ناقص");
}

app.get('/', (req, res) => {
  res.send('Nader Store Running ✅');
});

app.listen(PORT, () => {
  console.log(Server running on ${PORT});
});

const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply('مرحبا بك في متجر Nader Store\nاختر الخدمة من الأزرار:', {
    reply_markup: {
      keyboard: [
        [{ text: '🏪 المتجر' }, { text: '💰 المحفظة' }],
        [{ text: '👤 حسابي' }, { text: '🎧 الدعم' }]
      ],
      resize_keyboard: true
    }
  });
});

bot.hears('🏪 المتجر', (ctx) => {
  ctx.reply('اختر:', {
    reply_markup: {
      keyboard: [
        [{ text: '➕ إضافة إعلان قلعة' }],
        [{ text: '🏰 مشاهدة القلعة' }],
        [{ text: '⬅️ رجوع' }]
      ],
      resize_keyboard: true
    }
  });
});

bot.hears('➕ إضافة إعلان قلعة', (ctx) => {
  ctx.reply('افتح نموذج الإعلان، اكتب البيانات ثم اضغط حفظ', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'فتح نموذج إعلان القلعة', web_app: { url: 'https://telegram.org' } }]
      ]
    }
  });
});

bot.hears('⬅️ رجوع', (ctx) => {
  ctx.reply('مرحبا بك في متجر Nader Store\nاختر الخدمة من الأزرار:', {
    reply_markup: {
      keyboard: [
        [{ text: '🏪 المتجر' }, { text: '💰 المحفظة' }],
        [{ text: '👤 حسابي' }, { text: '🎧 الدعم' }]
      ],
      resize_keyboard: true
    }
  });
});

bot.hears('🏰 مشاهدة القلعة', (ctx) => ctx.reply('قائمة القلاع قريبا... 🏰'));
bot.hears('💰 المحفظة', (ctx) => ctx.reply('محفظتك: 0 جنيه'));
bot.hears('👤 حسابي', (ctx) => ctx.reply('حسابك تمام 👤'));
bot.hears('🎧 الدعم', (ctx) => ctx.reply('للدعم: @YourUsername'));

bot.launch().then(() => console.log('✅ Bot Started')).catch(e => console.log(e));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
