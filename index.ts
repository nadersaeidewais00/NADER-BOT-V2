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

function getUser(id: number){
  if(!users.has(id)) users.set(id, {warnings:0, banned:false, lastBuy:0, wallet:0, ads:[] as string[]});
  return users.get(id);
}

const mainKeyboard = Markup.keyboard([["الـمـتـجـر 🏰"],["حـسـابـي 👤","الـمـحـفـظـة 💰"],["الـدعـم 🛎"]]).resize();

bot.start((ctx)=>{ getUser(ctx.from.id); ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE", mainKeyboard); });
bot.hears("الـمـتـجـر 🏰",(ctx)=>ctx.reply("🏰 المتجر:", Markup.inlineKeyboard([[Markup.button.callback("إضــافــة إعــلان قــلــعــه","add_castle")],[Markup.button.callback("مــشــاهــدة قــلــعــه","view_castle")]])));
bot.hears("حـسـابـي 👤",(ctx)=>{const u=getUser(ctx.from.id); ctx.reply(👤 حسابك\nID:${ctx.from.id}\nتحذيرات:${u.warnings}/3\nرصيد:${u.wallet} ج);});
bot.hears("الـمـحـفـظـة 💰",(ctx)=>{const m=paymentMethods.vodafone?💳 Vodafone: ${paymentMethods.vodafone}:"❌ لم يضف الادمن دفع"; ctx.reply(💰 محفظتك: ${getUser(ctx.from.id).wallet} ج\n${m}, Markup.inlineKeyboard([[Markup.button.callback("تأكيد الدفع 💳","confirm_pay")]]));});
bot.hears("الـدعـم 🛎",(ctx)=>{ userState.set(ctx.from.id, "support"); ctx.reply("🛎 اكتب رسالتك:"); });

bot.action("add_castle",async(ctx)=>{ await ctx.answerCbQuery(); userState.set(ctx.from!.id, "add_castle"); await ctx.reply("🏰 ابعت تفاصيل القلعة:"); });
bot.action("view_castle",async(ctx)=>{ await ctx.answerCbQuery(); const all=Array.from(users.values()).flatMap((x:any)=>x.ads); if(all.length==0) return ctx.reply("لا يوجد قلاع"); ctx.reply(all.join("\n---\n")); });
bot.action("confirm_pay",async(ctx)=>{ const uid=ctx.from!.id; if(payments.has(uid)&&payments.get(uid).status==="pending"){ await ctx.answerCbQuery("❌ لك طلب معلق", {show_alert:true}); return; } userState.set(uid, "wait_screenshot"); await ctx.answerCbQuery(); await ctx.reply("📸 ابعت اسكرين التحويل:"); });

bot.on("photo",async(ctx)=>{
  const uid=ctx.from.id; if(userState.get(uid)!=="wait_screenshot") return;
  const fid=ctx.message.photo[ctx.message.photo.length-1].file_id;
  payments.set(uid,{userId:uid, screenshot:fid, status:"pending"});
  userState.delete(uid);
  await ctx.reply("✅ تم الاستلام");
  await bot.telegram.sendPhoto(ADMIN_ID, fid, {caption:💰 طلب دفع ID:${uid},...Markup.inlineKeyboard([[Markup.button.callback("✅ تأكيد","admin_ok_"+uid),Markup.button.callback("❌ الغاء","admin_no_"+uid)]])});
});

bot.command("addvodafone",async(ctx)=>{ if(ctx.from.id!==ADMIN_ID) return; const num=ctx.message.text.split(" ")[1]; if(!num) return ctx.reply("/addvodafone 01012345678"); paymentMethods.vodafone=num; await ctx.reply(✅ تم اضافة: ${num}); });
bot.action(/admin_ok_(\d+)/,async(ctx)=>{ if(ctx.from!.id!==ADMIN_ID) return; const uid=parseInt(ctx.match[1]); if(payments.has(uid)){payments.get(uid).status="confirmed"; getUser(uid).wallet+=500; await ctx.editMessageCaption(✅ تم التأكيد ID:${uid}); await bot.telegram.sendMessage(uid,"✅ تم تأكيد دفعك");}});
bot.action(/admin_no_(\d+)/,async(ctx)=>{ if(ctx.from!.id!==ADMIN_ID) return; const uid=parseInt(ctx.match[1]); if(payments.has(uid)){payments.get(uid).status="rejected"; await ctx.editMessageCaption(❌ تم الالغاء ID:${uid}); await bot.telegram.sendMessage(uid,"❌ تم رفض الدفع");}});
