telegrafttp from "node:http";
import { Telegraf } from "telegraf";

http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is alive");
}).listen(process.env.PORT || 10000, "0.0.0.0", () => {
  console.log("Server listening");
});

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.log("❌ BOT_TOKEN not found");
} else {
  const bot = new Telegraf(BOT_TOKEN);
  bot.start((ctx) => ctx.reply("اهلا يا نادر! البوت اشتغل ✅"));
  bot.help((ctx) => ctx.reply("البوت شغال تمام"));
  bot.on("text", (ctx) => ctx.reply("استقبلت: " + ctx.message.text));
  bot.launch().then(() => console.log("🤖 Telegram Bot Started"));
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
