const express = require('express');
const path = require('path');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const PORT = process.env.PORT || 10000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req,res)=> res.send('Running'));

app.listen(PORT, ()=> console.log('Server '+PORT));

const bot = new Telegraf(token);

// 1- البداية - 4 ازرار
bot.start((ctx)=>{
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

// 2- لما يدوس المتجر - يظهر زرارين بس
bot.hears('🏪 المتجر', (ctx)=>{
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

bot.hears('⬅️ رجوع', (ctx)=> ctx.scene?.leave() || bot.start(ctx));

// 3- إضافة إعلان - يفتح الفورم
bot.hears('➕ إضافة إعلان قلعة', (ctx)=>{
  ctx.reply('افتح نموذج الإعلان، اكتب البيانات واختر الأبطال ثم اضغط حفظ وإرسال الإعلان', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'فتح نموذج إعلان القلعة', web_app: { url: https://${process.env.RENDER_EXTERNAL_HOSTNAME} } }]
      ]
    }
  });
});

bot.hears('🏰 مشاهدة القلعة', (ctx)=> ctx.reply('قائمة القلاع قريبا...'));
bot.hears('💰 المحفظة', (ctx)=> ctx.reply('محفظتك: 0'));
bot.hears('👤 حسابي', (ctx)=> ctx.reply('حسابك: 👤'));
bot.hears('🎧 الدعم', (ctx)=> ctx.reply('الدعم: @YourUsername'));

bot.on('web_app_data', (ctx)=>{
  const data = JSON.parse(ctx.webAppData.data);
  ctx.reply(✅ تم استلام إعلانك: ${JSON.stringify(data)});
});

bot.launch();
