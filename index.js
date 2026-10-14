const http = require("http");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(BOT_TOKEN);
let castles = [];

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const fp = path.join(__dirname, "form.html");
  if (fs.existsSync(fp)) {
    const html = fs.readFileSync(fp, "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  return res.end("NADER STORE LIVE");
});
server.listen(PORT, "0.0.0.0", () => console.log("Live "+PORT));

function mainMenu(isAdmin) {
  const kb = [
    [Markup.button.callback("المتجر 🏪", "STORE")],
    [Markup.button.callback("حسابي 👤", "ACCOUNT"), Markup.button.callback("المحفظة 💳", "WALLET")],
    [Markup.button.callback("الدعم 📩", "SUPPORT")]
  ];
  if (isAdmin) kb.push([Markup.button.callback("لوحة الادمن ⚙️", "ADMIN")]);
  return Markup.inlineKeyboard(kb);
}

bot.start((ctx) => ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu(ctx.from.id === ADMIN_ID)));

bot.action("STORE", (ctx) => {
  ctx.answerCbQuery();
  const HOST = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
  return ctx.reply("اختر الخدمة:", Markup.inlineKeyboard([
    [Markup.button.webApp("اضافة اعلان قلعة 🏰", "https://" + HOST)],
    [Markup.button.callback("مشاهدة القلاع 👀", "VIEW")],
    [Markup.button.callback("رجوع 🔙", "MAIN")]
  ]));
});

bot.action("VIEW", (ctx) => {
  ctx.answerCbQuery();
  if (castles.length === 0) return ctx.reply("لا يوجد قلاع");
  let t = ""; castles.slice(-10).forEach((c,i)=>{ t+=${i+1}. ${c.sellerName} - لفل ${c.level}\n; });
  return ctx.reply(t);
});
bot.action("MAIN", (ctx) => { ctx.answerCbQuery(); return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu(ctx.from.id === ADMIN_ID)); });
bot.action("ACCOUNT", (ctx) => { ctx.answerCbQuery(); return ctx.reply("حسابك: "+ctx.from.id); });
bot.action("WALLET", (ctx) => { ctx.answerCbQuery(); return ctx.reply("المحفظة"); });
bot.action("SUPPORT", (ctx) => { ctx.answerCbQuery(); return ctx.reply("ابعت رسالتك"); });

bot.on("message", (ctx, next) => {
  if (ctx.message?.web_app_data) {
    try { castles.push(JSON.parse(ctx.message.web_app_data.data)); return ctx.reply("✅ تم النشر!"); } catch(e){ return ctx.reply("❌ خطأ"); }
  }
  return next();
});

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
