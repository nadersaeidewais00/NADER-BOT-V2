const http = require("node:http");
const { Telegraf, Markup } = require("telegraf");
http.createServer((_,res)=>res.end("NADER BOT LIVE")).listen(process.env.PORT||10000);
const BOT_TOKEN=process.env.BOT_TOKEN||process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID=parseInt(process.env.ADMIN_ID||"0");
const licenses=new Map();const subs=new Map();
function genCode(){const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="NADER-";for(let i=0;i<8;i++)s+=c[Math.floor(Math.random()*c.length)];return s;}
function hasSub(id){return id==ADMIN_ID(subs.get(id)?.expiresAt0)>Date.now();}
function daysLeft(id){const s=subs.get(id);return s?Math.ceil((s.expiresAt-Date.now())/86400000):0;}
function mainMenu(uid){const kb=[[Markup.button.callback("💎 اشتراكي","MYSUB"),Markup.button.callback("🎟️ تفعيل كود","REDEEM")],[Markup.button.callback("🏰 تشغيل","START")]];if(uid==ADMIN_ID)kb.push([Markup.button.callback("👑 لوحة NADER - توليد كود","ADMIN")]);return Markup.inlineKeyboard(kb);}
function adminMenu(){return Markup.inlineKeyboard([[Markup.button.callback("🎲 توليد كود NADER عشوائي","GEN_RAND")],[Markup.button.callback("1 يوم","G1"),Markup.button.callback("7 ايام","G7"),Markup.button.callback("30 يوم","G30")],[Markup.button.callback("📋 اكواد NADER","LISTC"),Markup.button.callback("🔙 رجوع","BACK")]]);}
const bot=new Telegraf(BOT_TOKEN);
bot.start((ctx)=>{const uid=ctx.from.id;let t=🏰 NADER BOT\nمثل SONA\n\n;if(uid==ADMIN_ID)t+=👑 انت المالك\n\n;t+=hasSub(uid)?✅ فعال باقي ${daysLeft(uid)} يوم:❌ غير مفعل;return ctx.reply(t,mainMenu(uid));});
bot.action("ADMIN",async(ctx)=>{if(ctx.from.id!=ADMIN_ID)return;await ctx.answerCbQuery();return ctx.reply("👑 لوحة NADER - توليد كود:",adminMenu());});
const doGen=async(ctx,days)=>{const code=genCode();licenses.set(code,{code,days,used:false});await ctx.answerCbQuery();return ctx.reply(✅ كود جديد\n🎟️ ${code}\n⏰ ${days} يوم\n🔒 مرة واحدة بس,adminMenu());};
bot.action("GEN_RAND",async(ctx)=>{await ctx.answerCbQuery();return ctx.reply("اختار المدة:",adminMenu());});
bot.action("G1",(ctx)=>doGen(ctx,1));bot.action("G7",(ctx)=>doGen(ctx,7));bot.action("G30",(ctx)=>doGen(ctx,30));
bot.action("LISTC",async(ctx)=>{await ctx.answerCbQuery();if(!licenses.size)return ctx.reply("مفيش اكواد",adminMenu());let m=📋 اكواد NADER:\n\n;licenses.forEach(l=>{m+=${l.used?"✅":"⏳"} ${l.code} - ${l.days} يوم\n;});return ctx.reply(m,adminMenu());});
bot.action("BACK",async(ctx)=>{await ctx.answerCbQuery();return ctx.reply("الرئيسية",mainMenu(ctx.from.id));});
bot.action("MYSUB",async(ctx)=>{await ctx.answerCbQuery();return ctx.reply(hasSub(ctx.from.id)?✅ فعال باقي ${daysLeft(ctx.from.id)} يوم:"❌ غير مفعل",mainMenu(ctx.from.id));});
bot.action("REDEEM",async(ctx)=>{await ctx.answerCbQuery();return ctx.reply("🎟️ ابعت كود NADER");});
bot.action("START",async(ctx)=>{await ctx.answerCbQuery();return ctx.reply("🚀 NADER BOT شغال",mainMenu(ctx.from.id));});
bot.on("text",async(ctx)=>{const raw=ctx.message.text.trim().toUpperCase();const uid=ctx.from.id;if(/^NADER-[A-Z0-9]{8}$/.test(raw)){const lic=licenses.get(raw);if(!lic)return ctx.reply("❌ مش موجود",mainMenu(uid));if(lic.used)return ctx.reply("❌ استخدم قبل كده - ضد النصب",mainMenu(uid));lic.used=true;subs.set(uid,{expiresAt:Date.now()+lic.days*86400000});return ctx.reply(🎉 تم تفعيل\n🎟️ ${raw}\n⏰ ${lic.days} يوم,mainMenu(uid));}return ctx.reply("❓ ابعت كود NADER",mainMenu(uid));});
bot.launch().then(()=>console.log("NADER BOT LIVE"));
