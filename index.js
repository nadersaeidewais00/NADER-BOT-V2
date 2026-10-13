const http = require("node:http");
const { Telegraf, Markup } = require("telegraf");

http.createServer((_, res) => res.end("NADER BOT LIVE"))
.listen(process.env.PORT || 10000);

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = parseInt(process.env.ADMIN_ID || "0");

const licenses = new Map();
const subs = new Map();

function genCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "NADER-";
  for (let i = 0; i < 8; i++) {
    s += c[Math.floor(Math.random() * c.length)];
  }
  return s;
}

function hasSub(id) {
  if (id == ADMIN_ID) return true;
  const sub = subs.get(id);
  return sub && sub.expiresAt > Date.now();
}

function daysLeft(id) {
  const s = subs.get(id);
  if (!s) return 0;
  return Math.ceil((s.expiresAt - Date.now()) / 86400000);
}

function mainMenu(uid) {
  const kb = [
    [Markup.button.callback("💎 اشتراكي", "MYSUB"), Markup.button.callback("🎟️ تفعيل كود", "REDEEM")],
    [Markup.button.callback("🏰 تشغيل", "START")]
  ];
  if (uid == ADMIN_ID) {
    kb.push([Markup.button.callback("👑 لوحة NADER - توليد كود عشوائي", "ADMIN")]);
  }
  return Markup.inlineKeyboard(kb);
}

function adminMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎲 توليد كود NADER عشوائي", "GEN_RAND")],
    [Markup.button.callback("1 يوم", "G1"), Markup.button.callback("7 ايام", "G7"), Markup.button.callback("30 يوم", "G30")],
    [Markup.button.callback("📋 اكواد NADER", "LISTC"), Markup.button.callback("🔙 رجوع", "BACK")]
  ]);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  const uid = ctx.from.id;
  let txt = "🏰 NADER BOT\nمثل SONA BOT\n\n";
  if (uid == ADMIN_ID) txt += "👑 انت المالك NADER\n\n";
  if (hasSub(uid)) {
    txt += "✅ فعال باقي " + daysLeft(uid) + " يوم";
  } else {
    txt += "❌ غير مفعل - ابعت كود NADER";
  }
  return ctx.reply(txt, mainMenu(uid));
});

bot.action("ADMIN", async (ctx) => {
  if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("❌");
  await ctx.answerCbQuery();
  return ctx.reply("👑 لوحة NADER BOT - دوس توليد كود عشوائي:", adminMenu());
});

async function doGen(ctx, days) {
  const code = genCode();
  licenses.set(code, { code: code, days: days, used: false });
  await ctx.answerCbQuery("تم");
  return ctx.reply("✅ كود NADER BOT جديد\n\n🎟️ الكود: " + code + "\n⏰ المدة: " + days + " يوم\n🔒 مرة واحدة بس - ضد النصب\n\nانسخه وابعته للعميل", adminMenu());
}

bot.action("GEN_RAND", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("اختار مدة كود NADER العشوائي:", adminMenu());
});

bot.action("G1", (ctx) => doGen(ctx, 1));
bot.action("G7", (ctx) => doGen(ctx, 7));
bot.action("G30", (ctx) => doGen(ctx, 30));

bot.action("LISTC", async (ctx) => {
  await ctx.answerCbQuery();
  if (licenses.size == 0) return ctx.reply("مفيش اكواد", adminMenu());
  let m = "📋 اكواد NADER (" + licenses.size + "):\n\n";
  licenses.forEach((l) => {
    m += (l.used ? "✅" : "⏳") + " " + l.code + " - " + l.days + " يوم\n";
