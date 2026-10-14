const http = require("http");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(BOT_TOKEN);
let castles = [];
let waitingSupport = new Set();

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const html = fs.readFileSync(path.join(__dirname, "form.html"), "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  } catch (e) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("NADER STORE LIVE");
  }
});
server.listen(PORT, "0.0.0.0");

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
  if (castles.length === 0) return ctx.reply("لا يوجد قلاع حاليا");
  let t = "🏰 القلاع:\n\n";
  castles.slice(-10).reverse().forEach((c,i)=>{ t+=${i+1}. ${c.sellerName} | لفل ${c.level} | ${c.price}\n; });
  return ctx.reply(t);
});
bot.action("ACCOUNT", (ctx) => { ctx.answerCbQuery(); return ctx.reply("👤 حسابك\nID: " + ctx.from.id); });
bot.action("WALLET", (ctx) => { ctx.answerCbQuery(); return ctx.reply("💳 المحفظة"); });
bot.action("SUPPORT", (ctx) => { ctx.answerCbQuery(); waitingSupport.add(ctx.from.id); return ctx.reply("📩 ارسل رسالتك:"); });
bot.action("MAIN", (ctx) => { ctx.answerCbQuery(); return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu(ctx.from.id === ADMIN_ID)); });
bot.action("ADMIN", (ctx) => { if(ctx.from.id!==ADMIN_ID) return; ctx.answerCbQuery(); return ctx.reply("ادمن"); });

bot.on("message", (ctx,next)=>{
  if(ctx.message?.web_app_data){
    try{ const d=JSON.parse(ctx.message.web_app_data.data); castles.push(d); return ctx.reply("✅ تم النشر بنجاح!"); } catch(e){ return ctx.reply("❌ خطأ"); }
  }
  if(waitingSupport.has(ctx.from.id) && ctx.message?.text){ waitingSupport.delete(ctx.from.id); return ctx.reply("✅ تم الارسال"); }
  return next();
});
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
