import http from "node:http";
import { Telegraf, Markup } from "telegraf";

http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("NADER STORE LIVE");
}).listen(process.env.PORT || 10000, "0.0.0.0", () => {
  console.log("Server LIVE");
});

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_ID = 8604068151;

const bot = new Telegraf(BOT_TOKEN);

const users = new Map<number, any>();
const bans = new Map<number, any>();
const payments = new Map<number, any>();
const paymentMethods: any = { vodafone: null };
const userState = new Map<number, string>();

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[ـًٌٍَُِّْ]/g, "")
    .replace(/آ|أ|إ/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/[\s\.\-_،,|!@#$%^&*()+=~'";:<>?\/\\\[\]{}]+/g, "");
}

const INSULT_PATTERNS = [
  /كسم/, /شرموط/, /منيوك/, /منيك/, /متناك/, /قحبه/, /خول/, /عرص/, /لبوه/, /زب/, /طيز/, /خرا/, /كلب/, /حيوان/,
  /sharmot/, /qahba/, /khol/, /fuck/, /shit/, /bitch/,
];

function isInsultAI(text: string){
  const norm = normalizeText(text);
  for(const p of INSULT_PATTERNS){ if(p.test(norm) || p.test(text.toLowerCase())) return {isBad:true, word:p.source}; }
  return {isBad:false};
}

function getUser(id: number){
  if(!users.has(id)) users.set(id, {warnings:0, banned:false, lastBuy:0, wallet:0, ads:[] as string[]});
  return users.get(id);
}

bot.use(async (ctx, next) => {
  const id = ctx.from?.id; if(!id) return;
  const u = getUser(id);
  if(u.banned){ await ctx.reply("🚫 انت محظور نهائياً"); return; }
  if((ctx.message as any)?.text){
    const check = isInsultAI((ctx.message as any).text);
    if(check.isBad){
      u.warnings++;
      if(u.warnings>=3){ u.banned=true; bans.set(id,{name:ctx.from.first_name, reason:check.word}); await ctx.reply("🚫 تم حظرك بعد 3 تحذيرات"); await bot.telegram.sendMessage(ADMIN_ID, 🚨 حظر AI\nID:${id}\n${(ctx.message as any).text}); return; }
      await ctx.reply(⚠️ تحذير ${u.warnings}/3 - ممنوع الشتيمة); return;
    }
  }
  if((ctx.callbackQuery as any)?.data?.startsWith("buy_")){
    const now=Date.now(); if(now-u.lastBuy<10000){ await ctx.answerCbQuery("⏳ انتظر 10 ثواني", {show_alert:true}); return; } u.lastBuy=now;
  }
  await next();
});

const mainKeyboard = Markup.keyboard([["الـمـتـجـر 🏰"],["حـسـابـي 👤","الـمـحـفـظـة 💰"],["الـدعـم 🛎"]]).resize();

bot.start((ctx)=>{ getUser(ctx.from.id); ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إختر الخدمه التي تريدها من الأزرار 🏰", mainKeyboard); });
bot.hears("الـمـتـجـر 🏰",(ctx)=>ctx.reply("🏰 المتجر:", Markup.inlineKeyboard([[Markup.button.callback("إضــافــة إعــلان قــلــعــه","add_castle")],[Markup.button.callback("مــشــاهــدة قــلــعــه","view_castle")]])));
bot.hears("حـسـابـي 👤",(ctx)=>{const u=getUser(ctx.from.id); ctx.reply(👤 حسابك\nID:${ctx.from.id}\nتحذيرات:${u.warnings}/3\nرصيد:${u.wallet} ج);});
bot.hears("الـمـحـفـظـة 💰",(ctx)=>{const m=paymentMethods.vodafone?💳 Vodafone: ${paymentMethods.vodafone}:"❌ لم يضف الادمن دفع"; ctx.reply(💰 محفظتك: ${getUser(ctx.from.id).wallet} ج\n${m}\nابعت اسكرين ثم تأكيد`, Markup.inlineKeyboard([[Markup.button.callback("تأكيد الدفع 💳","confirm_pay")]]));});
bot.hears("الـدعـم 🛎",(ctx)=>{ userState.set(ctx.from.id, "support"); ctx.reply("🛎 اكتب رسالتك:"); });

bot.action("add_castle",async(ctx)=>{ await ctx.answerCbQuery(); userState.set(ctx.from!.id, "add_castle"); await ctx.reply("🏰 ابعت تفاصيل القلعة:"); });
bot.action("view_castle",async(ctx)=>{ await ctx.answerCbQuery(); const all=Array.from(users.values()).flatMap((x:any)=>x.ads); if(all.length==0) return ctx.reply("لا يوجد قلاع"); ctx.reply(all.join("\n---\n"), Markup.inlineKeyboard([[Markup.button.callback("شراء 🛒","buy_castle")]])); });
