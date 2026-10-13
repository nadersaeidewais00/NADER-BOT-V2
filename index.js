const http = require("http");
const { Telegraf, Markup } = require("telegraf");

// سيرفر Render
http.createServer((_,res)=>{
  res.writeHead(200,{"Content-Type":"text/plain; charset=utf-8"});
  res.end("NADER STORE SECURE LIVE ✅");
}).listen(process.env.PORT||10000,"0.0.0.0");
console.log("HTTP LIVE");

if(!process.env.BOT_TOKEN){
  console.log("BOT_TOKEN ناقص");
} else {
const ADMIN_ID = parseInt(process.env.ADMIN_ID||"0");
let DB = {castles:[], users:{}, bans:[], payments:[], vodafone:"01000000000"};
let warns = {};
let lastAct = {};
let payLock = new Set();
const BAD = ["كس","عرص","متناك","شرموطة","خول","قحبة","يلعن"];

const mainKB = Markup.keyboard([["الـمـتـجـر 🏰"],["حـسـابـي 👤","الـمـحـفـظـة 💰"],["الـدعـم 🛎"]]).resize();
const storeKB = Markup.keyboard([["إضــافــة إعــلان قــلــعــه"],["مــشــاهــدة قــلــعــه"],["🔙 رجوع"]]).resize();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx)=>{
  if(!DB.users[ctx.from.id]) DB.users[ctx.from.id]={balance:0,warns:0};
  ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إختر الخدمه التي تريدها من الأزرار", mainKB);
});

bot.hears("الـمـتـجـر 🏰",(ctx)=>ctx.reply("🏰 قسم القلاع:",storeKB));
bot.hears("🔙 رجوع",(ctx)=>ctx.reply("الرئيسية",mainKB));

let addMode = new Set();
bot.hears("إضــافــة إعــلان قــلــعــه",(ctx)=>{addMode.add(ctx.from.id); ctx.reply("ابعت وصف القلعة:");});
bot.hears("مــشــاهــدة قــلــعــه",(ctx)=>{
  if(DB.castles.length==0) return ctx.reply("لا يوجد قلاع حاليا 🏜️",mainKB);
  DB.castles.forEach((c,i)=>ctx.reply(🏰 #${i+1}\n${c.text}\n💰 ${c.price},Markup.inlineKeyboard([[Markup.button.callback("🛒 شراء","buy_"+i)]])));
});

bot.hears("حـسـابـي 👤",(ctx)=>{
  const u=DB.users[ctx.from.id]||{balance:0,warns:0};
  ctx.reply(👤 حسابك\nID:${ctx.from.id}\n💰 رصيد:${u.balance}ج\n⚠️ تحذيرات:${u.warns}/3);
});

bot.hears("الـمـحـفـظـة 💰",(ctx)=>{
  ctx.reply(💰 المحفظة\nرصيدك:${DB.users[ctx.from.id]?.balance||0}ج\nرقم فودافون كاش:\n${DB.vodafone}\nابعت سكرين ثم تأكيد مرة واحدة فقط,Markup.inlineKeyboard([[Markup.button.callback("✅ تأكيد الدفع","confirm_pay")]]));
});

bot.action("confirm_pay",(ctx)=>{
  if(payLock.has(ctx.from.id)) return ctx.reply("❌ لا يمكنك ارسال طلب تأكيد الا مره واحده فقط");
  payLock.add(ctx.from.id); ctx.reply("📸 ابعت سكرين التحويل");
});

bot.on("photo",(ctx)=>{
  if(!payLock.has(ctx.from.id)) return;
  const fid=ctx.message.photo.pop().file_id;
  DB.payments.push({userId:ctx.from.id,fileId:fid,status:"pending"});
  ctx.reply("✅ تم استلام السكرين - سيتم فحصه ضد التزوير");
  if(ADMIN_ID){
    bot.telegram.sendPhoto(ADMIN_ID,fid,{caption:💰 طلب دفع من ${ctx.from.id} @${ctx.from.username||""},reply_markup:{inline_keyboard:[[{text:"✅ تأكيد",callback_data:"ok_"+ctx.from.id},{text:"❌ الغاء",callback_data:"no_"+ctx.from.id}],[{text:"🚫 حظر تزوير",callback_data:"ban_"+ctx.from.id}]]}}).catch(()=>{});
  }
});

bot.action(/ok_(.+)/,(ctx)=>{
  if(ctx.from.id!=ADMIN_ID) return;
  const uid=ctx.match[1];
  if(DB.users[uid]) DB.users[uid].balance+=100;
  payLock.delete(parseInt(uid)); ctx.reply("تم التأكيد ✅");
  bot.telegram.sendMessage(uid,"✅ تم تأكيد دفعك 💰").catch(()=>{});
});
bot.action(/no_(.+)/,(ctx)=>{
  if(ctx.from.id!=ADMIN_ID) return;
  payLock.delete(parseInt(ctx.match[1])); ctx.reply("تم الالغاء ❌");
});
bot.action(/ban_(.+)/,(ctx)=>{
  if(ctx.from.id!=ADMIN_ID) return;
  DB.bans.push(parseInt(ctx.match[1])); payLock.delete(parseInt(ctx.match[1])); ctx.reply("تم الحظر 🚫");
});

bot.on("text",(ctx)=>{
  const id=ctx.from.id; const t=ctx.message.text;
  if(["الـمـتـجـر 🏰","حـسـابـي 👤","الـمـحـفـظـة 💰","الـدعـم 🛎","إضــافــة إعــلان قــلــعــه","مــشــاهــدة قــلــعــه","🔙 رجوع"].includes(t)) return;
  if(addMode.has(id)){addMode.delete(id); DB.castles.push({text:t.slice(0,300),price:"اسأل البائع",seller:id}); return ctx.reply("✅ تم اضافة قلعتك 🏰",mainKB);}
