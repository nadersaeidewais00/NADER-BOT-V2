const http = require("node:http");
const { Telegraf, Markup } = require("telegraf");
http.createServer((_,r)=>r.end("OK")).listen(process.env.PORT||10000);
const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID||0);
const licenses = new Map();
const subs = new Map();
function gen(){let s="NADER-";const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";for(let i=0;i<8;i++)s+=c[Math.floor(Math.random()*c.length)];return s;}
function has(id){return id==ADMIN_ID(subs.get(id)?.e0)>Date.now();}
function left(id){const s=subs.get(id);return s?Math.ceil((s.e-Date.now())/86400000):0;}
function menu(uid){
  let k=[ [Markup.button.callback("💎 اشتراكي","MYSUB"),Markup.button.callback("🎟️ تفعيل","REDEEM")], [Markup.button.callback("🏰 تشغيل","START")] ];
  if(uid==ADMIN_ID) k.push([Markup.button.callback("👑 لوحة NADER - توليد كود","ADMIN")]);
  return Markup.inlineKeyboard(k);
}
function admin(){return Markup.inlineKeyboard([[Markup.button.callback("🎲 توليد كود NADER عشوائي","GEN")],[Markup.button.callback("1 يوم","G1"),Markup.button.callback("7 ايام","G7"),Markup.button.callback("30 يوم","G30")],[Markup.button.callback("📋 الاكواد","LIST"),Markup.button.callback("🔙 رجوع","BACK")]]);}
const bot = new Telegraf(BOT_TOKEN);
bot.start(ctx=>{const u=ctx.from.id;let t="🏰 NADER BOT\nمثل SONA BOT\n\n";if(u==ADMIN_ID)t+="👑 انت المالك NADER\n\n";t+=has(u)?✅ فعال - باقي ${left(u)} يوم:"❌ غير مفعل - ابعت كود NADER";return ctx.reply(t,menu(u));});
bot.action("ADMIN",async ctx=>{if(ctx.from.id!=ADMIN_ID)return ctx.answerCbQuery("❌");await ctx.answerCbQuery();return ctx.reply("👑 لوحة NADER BOT - دوس توليد:",admin());});
async function doGen(ctx,d){const code=gen();licenses.set(code,{code,d,used:false});await ctx.answerCbQuery();return ctx.reply(✅ كود NADER BOT جديد\n\n🎟️ الكود: ${code}\n⏰ المدة: ${d} يوم\n🔒 استخدام مرة واحدة بس\n\nانسخه وابعته للعميل,admin());}
bot.action("GEN",async ctx=>{await ctx.answerCbQuery();return ctx.reply("اختار مدة الكود العشوائي:",admin());});
bot.action("G1",c=>doGen(c,1));bot.action("G7",c=>doGen(c,7));bot.action("G30",c=>doGen(c,30));
bot.action("LIST",async ctx=>{await ctx.answerCbQuery();if(!licenses.size)return ctx.reply("مفيش اكواد",admin());let m="📋 اكواد NADER:\n\n";licenses.forEach(l=>{m+=${l.used?"✅":"⏳"} ${l.code} - ${l.days} يوم\n;});return ctx.reply(m,admin());});
bot.action("BACK",async ctx=>{await ctx.answerCbQuery();return ctx.reply("الرئيسية",menu(ctx.from.id));});
bot.action("MYSUB",async ctx=>{await ctx.answerCbQuery();return ctx.reply(has(ctx.from.id)?✅ فعال باقي ${left(ctx.from.id)} يوم:"❌ غير مفعل",menu(ctx.from.id));});
bot.action("REDEEM",async ctx=>{await ctx.answerCbQuery();return ctx.reply("🎟️ ابعت كود NADER: NADER-A1B2C3D4");});
bot.action("START",async ctx=>{await ctx.answerCbQuery();return ctx.reply("🚀 NADER BOT شغال",menu(ctx.from.id));});
bot.on("text",async ctx=>{
  const raw=ctx.message.text.trim().toUpperCase();
  const uid=ctx.from.id;
  if(/^NADER-[A-Z0-9]{8}$/.test(raw)){
    const l=licenses.get(raw);
    if(!l)return ctx.reply("❌ الكود مش موجود",menu(uid));
    if(l.used)return ctx.reply("❌ استخدم قبل كده - مرة واحدة بس ضد النصب",menu(uid));
    l.used=true;
    subs.set(uid,{e:Date.now()+l.days*86400000});
    return ctx.reply(🎉 تم تفعيل NADER BOT\n🎟️ ${raw}\n⏰ ${l.days} يوم,menu(uid));
  }
  return ctx.reply("❓ ابعت كود NADER",menu(uid));
});
bot.launch().then(()=>console.log("NADER BOT LIVE - ADMIN "+ADMIN_ID));
