const http = require("http");
http.createServer((_,res)=>{res.writeHead(200);res.end("NADER STORE LIVE");}).listen(process.env.PORT||10000, "0.0.0.0");

const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = parseInt(process.env.ADMIN_ID);

let DB = { castles:[], users:{}, bans:[], vodafone:"01000000000" };
let addMode = new Set(), payLock = new Set(), lastBuy = {};

// === ذكاء اصطناعي للشتايم بكل اللغات ===
function isToxic(text){
  if(!text) return false;
  let t = text.toLowerCase();
  // توحيد عربي
  t = t.replace(/[أإآا]/g,"ا").replace(/ة/g,"ه").replace(/ي/g,"ي");
  // قائمة ذكية كبيرة + كل الطرق
  const patterns = [
    "كس","عرص","متناك","شرموطه","شرموطة","خول","قحبه","قحبة","يلعن","زبي","نيك","منيك",
    "fuck","shit","bitch","asshole","pussy","dick","cock","whore","slut",
    "كسمك","احا","عر$","خخ","كلب","حمار","وسخ","زق","خرا"
  ];
  // يكشف حتى لو كاتب ك س م ك او كسسسس او kuss
  for(let p of patterns){
    if(t.includes(p)) return true;
    // لو كرر الحرف زي كسسسس
    let regex = new RegExp(p.split("").join("+"), "i");
    if(regex.test(t)) return true;
  }
  // سب بالانجليزي مموه مثل f*ck / f.u.c.k
  if(t.replace(/[^a-z]/g,"").includes("fuck")) return true;
  return false;
}

const mainKB = Markup.keyboard([["الـمـتـجـر 🏰"],["حـسـابـي 👤","الـمـحـفـظـة 💰"],["الـدعـم 🛎"]]).resize();
const storeKB = Markup.keyboard([["إضــافــة إعــلان قــلــعــه"],["مــشــاهــدة قــلــعــه"],["🔙 رجوع"]]).resize();

bot.start((ctx)=>{
  if(!DB.users[ctx.from.id]) DB.users[ctx.from.id]={balance:0,warns:0};
  ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إختر الخدمه التي تريدها من الأزرار",mainKB);
});

bot.hears("🔙 رجوع", ctx=>ctx.reply("الرئيسية",mainKB));
bot.hears("الـمـتـجـر 🏰", ctx=>ctx.reply("🏰 اختر:",storeKB));
bot.hears("إضــافــة إعــلان قــلــعــه", ctx=>{addMode.add(ctx.from.id);ctx.reply("ابعت وصف القلعة:");});
bot.hears("مــشــاهــدة قــلــعــه", ctx=>{
  if(!DB.castles.length) return ctx.reply("لا يوجد قلاع");
  DB.castles.forEach((c,i)=>ctx.reply(🏰 #${i+1}\n${c.text},Markup.inlineKeyboard([[Markup.button.callback("🛒 شراء","buy_"+i)]])));
});
bot.hears("حـسـابـي 👤", ctx=>{
  const u = DB.users[ctx.from.id]||{balance:0,warns:0};
  ctx.reply(👤 حسابك\nID:${ctx.from.id}\n💰 ${u.balance}ج\n⚠️ ${u.warns}/3);
});
bot.hears("الـمـحـفـظـة 💰", ctx=>ctx.reply(💰 رصيدك:${DB.users[ctx.from.id]?.balance||0}ج\nVodafone Cash: ${DB.vodafone}\n⚠️ الانتباه من الاسكرينات الزائفه,Markup.inlineKeyboard([[Markup.button.callback("✅ تأكيد الدفع","pay")]])));
bot.hears("الـدعـم 🛎", ctx=>ctx.reply("🛎 ابعت رسالتك:"));

bot.action("pay", ctx=>{
  if(payLock.has(ctx.from.id)) return ctx.reply("❌ مرة واحدة فقط - ضد التزوير");
  payLock.add(ctx.from.id);
  ctx.reply("📸 ابعت اسكرين التحويل");
});

bot.on("photo", (ctx)=>{
  if(!payLock.has(ctx.from.id)) return;
  const fid = ctx.message.photo.pop().file_id;
  ctx.reply("✅ استلمت الاسكرين - سيتم الفحص");
  bot.telegram.sendPhoto(ADMIN_ID,fid,{caption:💰 دفع من ${ctx.from.id},reply_markup:{inline_keyboard:[[{text:"✅ تأكيد",callback_data:"ok_"+ctx.from.id},{text:"❌ الغاء",callback_data:"no_"+ctx.from.id}]]}}).catch(()=>{});
});

bot.action(/ok_(.+)/, (ctx)=>{
  if(ctx.from.id!=ADMIN_ID) return;
  const id=ctx.match[1];
  if(DB.users[id]) DB.users[id].balance+=100;
  payLock.delete(parseInt(id));
  ctx.editMessageCaption("✅ تم التأكيد");
  bot.telegram.sendMessage(id,"✅ تم تأكيد دفعك").catch(()=>{});
});
bot.action(/no_(.+)/, (ctx)=>{
  payLock.delete(parseInt(ctx.match[1]));
  ctx.editMessageCaption("❌ تم الالغاء");
});

bot.action(/buy_(.+)/, (ctx)=>{
  if(Date.now()-(lastBuy[ctx.from.id]||0)<10000) return ctx.answerCbQuery("⏳ بين كل شراء 10 ثواني - ضد الاوتو كليكر",{show_alert:true});
  lastBuy[ctx.from.id]=Date.now();
  ctx.reply("🛒 تم ارسال طلب الشراء");
});
bot.on("text", (ctx)=>{
  const id=ctx.from.id; const t=ctx.message.text;
  if(["الـمـتـجـر 🏰","حـسـابـي 👤","الـمـحـفـظـة 💰","الـدعـم 🛎","إضــافــة إعــلان قــلــعــه","مــشــاهــدة قــلــعــه","🔙 رجوع"].includes(t)) return;
  
  if(addMode.has(id)){
    addMode.delete(id);
    DB.castles.push({text:t.slice(0,400).replace(/[<>$]/g,""),seller:id});
    return ctx.reply("✅ تمت اضافة قلعتك",mainKB);
  }

  // === نظام الشتايم الذكي ===
  if(isToxic(t)){
    const u=DB.users[id];
    u.warns=(u.warns||0)+1;
    if(u.warns>=3){DB.bans.push(id); return ctx.reply("🚫 تم حظرك نهائي بعد 3 تحذيرات - الشتيمة بأي لغة ممنوعة");}
    return ctx.reply(⚠️ تحذير ${u.warns}/3 - ممنوع الشتيمة بأي لغة أو طريقة);
  }

  bot.telegram.sendMessage(ADMIN_ID,📩 دعم من ${id}:\n${t.slice(0,500)}`).catch(()=>{});
  ctx.reply("✅ تم ارسال رسالتك للدعم");
});

bot.command("setvodafone", ctx=>{
  if(ctx.from.id!=ADMIN_ID) return;
  DB.vodafone=ctx.message.text.split(" ")[1];
  ctx.reply("✅ Vodafone: "+DB.vodafone);
});
bot.command("bans", ctx=>{if(ctx.from.id!=ADMIN_ID) return; ctx.reply(DB.bans.length?DB.bans.join("\n"):"لا يوجد");});
bot.command("unban", ctx=>{
  if(ctx.from.id!=ADMIN_ID) return;
  const uid=parseInt(ctx.message.text.split(" ")[1]);
  DB.bans=DB.bans.filter(x=>x!=uid);
  if(DB.users[uid]) DB.users[uid].warns=0;
  ctx.reply("✅ فك حظر "+uid);
});

bot.launch().then(()=>console.log("NADER LIVE"));
