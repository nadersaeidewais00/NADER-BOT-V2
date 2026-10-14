const http = require("http");
http.createServer((_,res)=>res.end("OK")).listen(process.env.PORT||10000);

const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = parseInt(process.env.ADMIN_ID);

let DB={castles:[], users:{}, bans:[], vodafone:"01000000000"};
let addMode=new Set(), payLock=new Set(), lastBuy={};

const mainKB=Markup.keyboard([["الـمـتـجـر 🏰"],["حـسـابـي 👤","الـمـحـفـظـة 💰"],["الـدعـم 🛎"]]).resize();
const storeKB=Markup.keyboard([["إضــافــة إعــلان قــلــعــه"],["مــشــاهــدة قــلــعــه"],["🔙 رجوع"]]).resize();

bot.start(ctx=>{
  if(!DB.users[ctx.from.id]) DB.users[ctx.from.id]={balance:0,warns:0};
  ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إختر الخدمه التي تريدها من الأزرار",mainKB);
});

bot.hears("الـمـتـجـر 🏰",ctx=>ctx.reply("🏰 اختر:",storeKB));
bot.hears("🔙 رجوع",ctx=>ctx.reply("الرئيسية",mainKB));
bot.hears("إضــافــة إعــلان قــلــعــه",ctx=>{addMode.add(ctx.from.id);ctx.reply("ابعت وصف القلعة:");});
bot.hears("مــشــاهــدة قــلــعــه",ctx=>{if(!DB.castles.length) return ctx.reply("لا يوجد قلاع");DB.castles.forEach((c,i)=>ctx.reply(🏰 #${i+1}\n${c.text},Markup.inlineKeyboard([[Markup.button.callback("🛒 شراء","buy_"+i)]])));});
bot.hears("حـسـابـي 👤",ctx=>ctx.reply(👤 حسابك\n💰 ${DB.users[ctx.from.id]?.balance||0}ج));
bot.hears("الـمـحـفـظـة 💰",ctx=>ctx.reply(💰 رصيدك:${DB.users[ctx.from.id]?.balance||0}ج\nVodafone Cash: ${DB.vodafone}\n⚠️ الانتباه من الاسكرينات الزائفه,Markup.inlineKeyboard([[Markup.button.callback("✅ تأكيد الدفع","pay")]])));
bot.hears("الـدعـم 🛎",ctx=>ctx.reply("🛎 ابعت رسالتك:"));

bot.action("pay",ctx=>{if(payLock.has(ctx.from.id)) return ctx.reply("❌ مرة واحدة فقط");payLock.add(ctx.from.id);ctx.reply("📸 ابعت اسكرين التحويل");});
bot.on("photo",ctx=>{
  if(!payLock.has(ctx.from.id)) return;
  const fid=ctx.message.photo.pop().file_id;
  bot.telegram.sendPhoto(ADMIN_ID,fid,{caption:دفع من ${ctx.from.id},reply_markup:{inline_keyboard:[[{text:"✅ تأكيد",callback_data:"ok_"+ctx.from.id},{text:"❌ الغاء",callback_data:"no_"+ctx.from.id}]]}}).catch(()=>{});
  ctx.reply("✅ استلمت الاسكرين");
});
bot.action(/ok_(.+)/,ctx=>{const id=ctx.match[1];if(DB.users[id]) DB.users[id].balance+=100;payLock.delete(parseInt(id));ctx.editMessageCaption("✅ تم");bot.telegram.sendMessage(id,"✅ تم تأكيد دفعك").catch(()=>{});});
bot.action(/no_(.+)/,ctx=>{payLock.delete(parseInt(ctx.match[1]));ctx.editMessageCaption("❌ الغاء");});
bot.action(/buy_(.+)/,ctx=>{if(Date.now()-(lastBuy[ctx.from.id]||0)<10000) return ctx.answerCbQuery("⏳ 10 ثواني بين كل شراء",{show_alert:true});lastBuy[ctx.from.id]=Date.now();ctx.reply("🛒 تم الطلب");});

bot.on("text",ctx=>{
  const id=ctx.from.id,t=ctx.message.text;
  if(["الـمـتـجـر 🏰","حـسـابـي 👤","الـمـحـفـظـة 💰","الـدعـم 🛎","إضــافــة إعــلان قــلــعــه","مــشــاهــدة قــلــعــه","🔙 رجوع"].includes(t)) return;
  if(addMode.has(id)){addMode.delete(id);DB.castles.push({text:t});return ctx.reply("✅ تمت الاضافة",mainKB);}
  // شتيمة
  if(["كس","عرص","متناك"].some(w=>t.includes(w))){let u=DB.users[id];u.warns++;if(u.warns>=3){DB.bans.push(id);return ctx.reply("🚫 حظر");}return ctx.reply(⚠️ تحذير ${u.warns}/3);}
  bot.telegram.sendMessage(ADMIN_ID,📩 ${id}: ${t}).catch(()=>{});
  ctx.reply("✅ وصلت للدعم");
});

bot.command("setvodafone",ctx=>{if(ctx.from.id!=ADMIN_ID) return;DB.vodafone=ctx.message.text.split(" ")[1];ctx.reply("✅ تم: "+DB.vodafone);});
bot.command("bans",ctx=>ctx.reply(DB.bans.join("\n")||"مفيش"));

bot.launch();
