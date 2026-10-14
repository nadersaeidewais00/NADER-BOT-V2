const http = require("http");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(BOT_TOKEN);
let castles = [];
let supportMessages = [];
let waitingSupport = new Set();

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const fp = path.join(__dirname, "form.html");
    const html = fs.readFileSync(fp, "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  } catch (e) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("NADER STORE LIVE");
  }
});

server.listen(PORT, "0.0.0.0", () => console.log("Live " + PORT));

function mainMenu(isAdmin) {
  const kb = [
    [Markup.button.callback("NADER STORE - المتجر 🏪", "STORE")],
    [Markup.button.callback("حسابي 👤", "ACCOUNT"), Markup.button.callback("المحفظة 💳", "WALLET")],
    [Markup.button.callback("الدعم 📩", "SUPPORT")]
  ];
  if (isAdmin) kb.push([Markup.button.callback("لوحة الادمن ⚙️", "ADMIN")]);
  return Markup.inlineKeyboard(kb);
}

bot.start((ctx) => {
  return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu(ctx.from.id === ADMIN_ID));
});

bot.action("STORE", (ctx) => {
  ctx.answerCbQuery();
  const HOST = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
  return ctx.reply("NADER STORE:", Markup.inlineKeyboard([
    [Markup.button.webApp("اضافة اعلان قلعة 🏰", "https://" + HOST)],
    [Markup.button.callback("مشاهدة القلاع 👀", "VIEW")],
    [Markup.button.callback("رجوع 🔙", "MAIN")]
  ]));
});

bot.action("VIEW", (ctx) => {
  ctx.answerCbQuery();
  if (castles.length === 0) return ctx.reply("لا يوجد قلاع حاليا");
  let t = "🏰 القلاع (" + castles.length + "):\n\n";
  castles.slice(-10).reverse().forEach((c, i) => { t += (i + 1) + ". " + c.sellerName + " | لفل " + c.level + " | " + c.price + "\n"; });
  return ctx.reply(t);
});

bot.action("ACCOUNT", (ctx) => { ctx.answerCbQuery(); return ctx.reply("👤 حسابك\nالايدي: " + ctx.from.id); });
bot.action("WALLET", (ctx) => { ctx.answerCbQuery(); return ctx.reply("💳 المحفظة"); });
bot.action("SUPPORT", (ctx) => { ctx.answerCbQuery(); waitingSupport.add(ctx.from.id); return ctx.reply("📩 ارسل رسالة الدعم الان:"); });
bot.action("ADMIN", (ctx) => { if (ctx.from.id !== ADMIN_ID) return ctx.reply("للادمن فقط"); ctx.answerCbQuery(); return ctx.reply("⚙️ ادمن", Markup.inlineKeyboard([[Markup.button.callback("📋 الاعلانات", "AD_LIST")], [Markup.button.callback("رجوع", "MAIN")]])); });
bot.action("AD_LIST", (ctx) => { ctx.answerCbQuery(); if (castles.length === 0) return ctx.reply("لا يوجد"); let txt = ""; castles.slice(-5).reverse().forEach((c, i) => { txt += (i + 1) + ". " + c.sellerName + " - " + c.phone + "\n"; }); return ctx.reply(txt); });
bot.action("MAIN", (ctx) => { ctx.answerCbQuery(); return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu(ctx.from.id === ADMIN_ID)); });

bot.on("message", (ctx, next) => {
  if (ctx.message && ctx.message.web_app_data) {
    try {
      const d = JSON.parse(ctx.message.web_app_data.data);
      castles.push(d);
      return ctx.reply("✅ تم عرض قلعتك بنجاح!");
    } catch (e) { return ctx.reply("❌ خطأ"); }
  }
  if (waitingSupport.has(ctx.from.id) && ctx.message && ctx.message.text) {
    supportMessages.push({ fromId: ctx.from.id, text: ctx.message.text });
    waitingSupport.delete(ctx.from.id);
    return ctx.reply("✅ تم ارسال رسالة الدعم");
  }
  return next();
});

bot.launch().then(() => console.log("BOT LIVE"));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
