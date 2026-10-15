const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

console.log("TOKEN EXISTS?", !!BOT_TOKEN);

app.get('/', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log("Server on " + PORT));

if (BOT_TOKEN) {
  const bot = new Telegraf(BOT_TOKEN);
  bot.start((ctx) => ctx.reply('مرحبا بك في متجر Nader Store'));
  bot.launch().then(()=>console.log("Bot started"));
}
