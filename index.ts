import http from "node:http";
import { Telegraf, Markup } from "telegraf";

http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("NADER BOT - Conquerors Golden Age Official");
}).listen(process.env.PORT || 10000, "0.0.0.0", () => console.log("✅ NADER BOT ONLINE"));

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = parseInt(process.env.ADMIN_ID || "0"); // حط ايدي بتاعك من @userinfobot

if (!BOT_TOKEN) console.log("❌ BOT_TOKEN Missing");
else {
  const bot = new Telegraf(BOT_TOKEN);

  type Account = { email: string; password: string; castleId: string; active: boolean; lastRun?: string };
  type License = { code: string; days: number; used: boolean; usedBy?: number; usedAt?: number; createdAt: number };
  type Sub = { expiresAt: number };

  const db = new Map<number, Account[]>();
  const timers = new Map<number, NodeJS.Timeout[]>();
  const licenses = new Map<string, License>();
  const subs = new Map<number, Sub>();

  // حماية ضد الاوتو كليكر والنصب
  const clicks = new Map<number, number[]>();
  const captcha = new Map<number, { q: string; a: number }>();

  const isClicker = (id: number) => {
    const now = Date.now();
    const arr = clicks.get(id) || [];
    arr.push(now);
    if (arr.length > 8) arr.shift();
    clicks.set(id, arr);
    if (arr.length >= 5 && arr[4] - arr[0] < 2500) return true;
    return false;
  };

  const genCode = () => {
    const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "NADER-";
    for (let i = 0; i < 8; i++) s += c[Math.floor(Math.random() * c.length)];
    return s;
  };
  const hasSub = (id: number) => id === ADMIN_ID  (subs.get(id)?.expiresAt  0) > Date.now();
  const daysLeft = (id: number) => {
    const s = subs.get(id);
    if (!s) return 0;
    return Math.max(0, Math.ceil((s.expiresAt - Date.now()) / 86400000));
  };

  const mainKeyboard = (uid: number) => {
    const active = hasSub(uid);
    return Markup.inlineKeyboard([
      [Markup.button.callback("👤 حساباتي", "MY_ACCOUNTS"), Markup.button.callback("➕ اضافة حساب", "ADD_ACCOUNT")],
      [Markup.button.callback("🎮 حدث النداء", "NIDAA_EVENT"), Markup.button.callback("⚙️ اعدادات", "SETTINGS")],
      [Markup.button.callback("💎 اشتراكي", "MY_SUB"), Markup.button.callback("🎟️ تفعيل كود", "REDEEM_CODE")],
     ...(uid === ADMIN_ID? [[Markup.button.callback("👑 NADER ADMIN PANEL", "ADMIN_PANEL")]] : []),
      [Markup.button.callback("📞 الدعم", "SUPPORT")]
    ]);
  };

  const adminKeyboard = () => Markup.inlineKeyboard([
    [Markup.button.callback("🎲 توليد كود NADER عشوائي", "ADMIN_GEN")],
    [Markup.button.callback("1 يوم", "GEN_1"), Markup.button.callback("3 ايام", "GEN_3"), Markup.button.callback("7 ايام", "GEN_7")],
    [Markup.button.callback("15 يوم", "GEN_15"), Markup.button.callback("30 يوم", "GEN_30"), Markup.button.callback("90 يوم", "GEN_90")],
    [Markup.button.callback("📋 كل اكواد NADER", "LIST_CODES"), Markup.button.callback("👥 كل العملاء", "LIST_CLIENTS")],
    [Markup.button.callback("🔙 رجوع", "BACK_HOME")]
  ]);

  // حماية عامة من الاوتو كليكر
  bot.use(async (ctx, next) => {
    const uid = ctx.from?.id;
    if (!uid) return next();
    if (captcha.has(uid)) return next();
    if (ctx.callbackQuery && isClicker(uid)) {
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      captcha.set(uid, { q: ${a}+${b}, a: a + b });
      await ctx.answerCbQuery("🚨 كشف اوتو كليكر", true);
      return ctx.reply(🛡️ *نظام NADER BOT لمكافحة النصب*\n\nتم كشف ضغط تلقائي\nحل: *${a} + ${b} = ؟*\n\nاكتب الناتج, { parse_mode: "Markdown" });
    }
    return next();
  });

  bot.start((ctx) => {
    const uid = ctx.from.id;
    const isAdm = uid === ADMIN_ID;
    return ctx.replyWithMarkdown(
