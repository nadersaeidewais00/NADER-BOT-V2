const http = require("http");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 10000;

if (!BOT_TOKEN) console.log("NO BOT_TOKEN");

const bot = new Telegraf(BOT_TOKEN || "123");
let castles = [];

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const p = path.join(__dirname, "form.html");
    const html = fs.readFileSync(p, "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (e) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("NADER STORE LIVE");
  }
});

server.listen(PORT, "0.0.0.0", () => console.log("HTTP LIVE " + PORT));

function menu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("المتجر 🏪", "STORE")],
    [Markup.button.callback("حسابي 👤", "ACCOUNT"), Markup.button.callback("المحفظة 💳", "WALLET")],
    [Markup.button.callback("الدعم 📩", "SUPPORT")]
  ]);
}

bot.start((ctx) => ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", menu()));
bot.action("STORE", (ctx) => {
  ctx.answerCbQuery();
  const h = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
  ctx.reply("اختر الخدمة:", Markup.inlineKeyboard([
    [Markup.button.webApp("اضافة اعلان قلعة 🏰", "https://" + h)],
    [Markup.button.callback("مشاهدة القلاع 👀", "VIEW")],
    [Markup.button.callback("رجوع 🔙", "MAIN")]
  ]));
});
bot.action("VIEW", (ctx) => {
  ctx.answerCbQuery();
  if (castles.length === 0) return ctx.reply("لا يوجد قلاع حاليا");
  let t = "🏰 القلاع:\n"; castles.forEach((c,i)=>{ t+=${i+1}. ${c.sellerName} لفل ${c.level}\n; });
  ctx.reply(t);
});
bot.action("MAIN", (ctx) => { ctx.answerCbQuery(); ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", menu()); });
bot.action("ACCOUNT", (ctx) => { ctx.answerCbQuery(); ctx.reply("ID: "+ctx.from.id); });
bot.action("WALLET", (ctx) => { ctx.answerCbQuery(); ctx.reply("المحفظة"); });
bot.action("SUPPORT", (ctx) => { ctx.answerCbQuery(); ctx.reply("ابعت رسالتك"); });

bot.on("message", (ctx, next) => {
  if (ctx.message?.web_app_data) {
    try { const d = JSON.parse(ctx.message.web_app_data.data); castles.push(d); return ctx.reply("✅ تم النشر!"); } catch(e){ return ctx.reply("❌ خطأ"); }
  }
  return next();
});

bot.launch().then(()=>console.log("BOT LAUNCHED"));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
