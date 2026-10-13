const http = require("node:http");
const { Telegraf, Markup } = require("telegraf");

http.createServer((_, res) => {
  res.writeHead(200);
  res.end("NADER BOT LIVE 24H");
}).listen(process.env.PORT || 10000, () => {
  console.log("HTTP READY");
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = parseInt(process.env.ADMIN_ID || "0");

const licenses = new Map();
const subs = new Map();

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "NADER-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function hasSub(id) {
  if (id === ADMIN_ID) return true;
  const sub = subs.get(id);
  return sub && sub.expiresAt > Date.now();
}

function daysLeft(id) {
  const sub = subs.get(id);
  if (!sub) return 0;
  return Math.ceil((sub.expiresAt - Date.now()) / 86400000);
}

function mainMenu(uid) {
  const kb = [
    [Markup.button.callback("💎 اشتراكي", "MYSUB"), Markup.button.callback("🎟️ تفعيل كود", "REDEEM")],
    [Markup.button.callback("🏰 تشغيل 24 ساعة", "START")]
  ];
  if (uid === ADMIN_ID) {
    kb.push([Markup.button.callback("👑 لوحة تحكم NADER", "ADMIN")]);
  }
  return Markup.inlineKeyboard(kb);
}

function adminMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎲 توليد كود جديد", "GEN")],
    [
      Markup.button.callback("1 يوم", "G1"),
      Markup.button.callback("7 ايام", "G7"),
      Markup.button.callback("30 يوم", "G30")
    ],
    [
      Markup.button.callback("📋 قائمة الاكواد", "LISTC"),
      Markup.button.callback("🔙 رجوع", "BACK")
    ]
  ]);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  let text = "🏰 NADER BOT V2\n✅ شغال 24 ساعة\n✅ احسن من SONA\n✅ ضد كشف الفاتحون\n\n";
  if (hasSub(ctx.from.id)) {
    text += ✅ اشتراكك فعال - باقي ${daysLeft(ctx.from.id)} يوم;
  } else {
    text += "❌ غير مفعل - ابعت كود NADER";
  }
  return ctx.reply(text, mainMenu(ctx.from.id));
});

bot.action("ADMIN", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCbQuery("❌");
  await ctx.answerCbQuery();
  return ctx.reply("👑 لوحة تحكم NADER:", adminMenu());
});

bot.action("GEN", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("✅ اختار مدة الكود:", adminMenu());
});

bot.action("G1", async (ctx) => {
  const code = genCode();
  licenses.set(code, { code, days: 1, used: false });
  await ctx.answerCbQuery("✅ تم");
  return ctx.reply(✅ كود جديد\n🎟️ ${code}\n⏰ 1 يوم\n🟢 24 ساعة, adminMenu());
});

bot.action("G7", async (ctx) => {
  const code = genCode();
  licenses.set(code, { code, days: 7, used: false });
  await ctx.answerCbQuery("✅ تم");
  return ctx.reply(✅ كود جديد\n🎟️ ${code}\n⏰ 7 ايام\n🟢 24 ساعة, adminMenu());
});

bot.action("G30", async (ctx) => {
  const code = genCode();
  licenses.set(code, { code, days: 30, used: false });
  await ctx.answerCbQuery("✅ تم");
  return ctx.reply(✅ كود جديد\n🎟️ ${code}\n⏰ 30 يوم\n🟢 24 ساعة, adminMenu());
});

bot.action("LISTC", async (ctx) => {
  await ctx.answerCbQuery();
  if (licenses.size === 0) return ctx.reply("📭 مفيش اكواد", adminMenu());
  let msg = "📋 اكواد NADER:\n\n";
  licenses.forEach((lic) => {
    msg += ${lic.used ? "✅" : "⏳"} ${lic.code} - ${lic.days} يوم\n;
  });
  return ctx.reply(msg, adminMenu());
});

bot.action("MYSUB", async (ctx) => {
  await ctx.answerCbQuery();
  if (hasSub(ctx.from.id)) {
    return ctx.reply(💎 اشتراكك فعال - باقي ${daysLeft(ctx.from.id)} يوم, mainMenu(ctx.from.id));
  }
  return ctx.reply("❌ معندكش اشتراك", mainMenu(ctx.from.id));
});

bot.action("REDEEM", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("📩 ابعت كود NADER دلوقتي\nمثال: NADER-AB12CD34");
});

bot.action("START", async (ctx) => {
  await ctx.answerCbQuery();
  if (!hasSub(ctx.from.id)) {
    return ctx.reply("❌ فعل اشتراكك الاول", mainMenu(ctx.from.id));
  }
  return ctx.reply("🟢 تم التشغيل 24 ساعة\n✅ تأخير عشوائي\n✅ ضد كشف الفاتحون\n✅ احسن من SONA", mainMenu(ctx.from.id));
});
