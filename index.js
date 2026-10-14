const http = require("http");
const { Telegraf, Markup } = require("telegraf");

http.createServer((_,res)=>{res.writeHead(200);res.end("NADER LIVE");}).listen(10000,"0.0.0.0");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = parseInt(process.env.ADMIN_ID);

let DB={castles:[], users:{}, bans:[], vodafone:"01000000000"};
let addMode=new Set(); let payLock=new Set(); let lastBuy={}; let rate={};
const BAD=["كس","عرص","متناك","شرموطة","خول","قحبة","يلعن"];

setInterval(()=>{lastBuy={};rate={};},3600000);
bot.use((ctx,next)=>{if(DB.bans.includes(ctx.from?.id))return ctx.reply("🚫 محظور");const id=ctx.from?.id;rate[id]=rate[id]||[];rate[id]=rate[id].filter(t=>Date.now()-t<5000);if(rate[id].length>7)return;rate[id].push(Date.now());return next();});

const mainKB=Markup.keyboard([["الـمـتـجـر 🏰"],["حـسـابـي 👤","الـمـحـفـظـة 💰"],["الـدعـم 🛎"]]).resize();
const storeKB=Markup.keyboard([["إضــافــة إعــلان قــلــعــه"],["مــشــاهــدة قــلــعــه"],["🔙 رجوع"]]).resize();

bot.start((ctx)=>{if(!DB.users[ctx.from.id])DB.users[ctx.from.id]={balance:0,warns:0};ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إختر الخدمه التي تريدها من الأزرار",mainKB);});
bot.hears("🔙 رجوع",(ctx)=>ctx.reply("الرئيسية",mainKB));
bot.hears("الـمـتـجـر 🏰",(ctx)=>ctx.reply("🏰 اختر:",storeKB));
bot.hears("إضــافــة إعــلان قــلــعــه",(ctx)=>{addMode.add(ctx.from.id);ctx.reply("ابعت وصف القلعة:");});
bot.hears("مــشــاهــدة قــلــعــه",(ctx)=>{if(DB.castles.length==0)return ctx.reply("لا يوجد قلاع");DB.castles.forEach((c,i)=>ctx.reply(🏰 #${i+1}\n${c.text},Markup.inlineKeyboard([[Markup.button.callback("🛒 شراء","buy_"+i)]])));});
bot.hears("حـسـابـي 👤",(ctx)=>{const u=DB.users[ctx.from.id]||{balance:0,warns:0};ctx.reply(👤 حسابك\nID:${ctx.from.id}\n💰 ${u.balance}ج\n⚠️ ${u.warns}/3);});
bot.hears("الـمـحـفـظـة 💰",(ctx)=>{ctx.reply(💰 الـمـحـفـظـة 💰\nرصيدك:${DB.users[ctx.from.id]?.balance||0}ج\nVodafone Cash:\n${DB.vodafone}\n\nابعت سكرين قبل التأكيد - مرة واحدة فقط\n⚠️ الانتباه جيدا من النصب والمراوغه بالاسكرينات الزائفه,Markup.inlineKeyboard([[Markup.button.callback("✅ تأكيد الدفع","confirm_pay")]]));});
bot.action("confirm_pay",(ctx)=>{if(payLock.has(ctx.from.id))return ctx.reply("❌ ارسال مرة واحدة فقط");payLock.add(ctx.from.id);ctx.reply("📸 ابعت اسكرين التحويل");});
bot.on("photo",(ctx)=>{if(!payLock.has(ctx.from.id))return;const fid=ctx.message.photo.pop().file_id;ctx.reply("✅ استلمت الاسكرين");bot.telegram.sendPhoto(ADMIN_ID,fid,{caption:💰 دفع من ${ctx.from.id},reply_markup:{inline_keyboard:[[{text:"✅ تأكيد",callback_data:"ok_"+ctx.from.id},{text:"❌ الغاء",callback_data:"no_"+ctx.from.id}],[{text:"🚫 حظر تزوير",callback_data:"ban_"+ctx.from.id}]]}}).catch(()=>{});});
bot.action(/ok_(.+)/,(ctx)=>{if(ctx.from.id!=ADMIN_ID)return;const uid=ctx.match[1];if(DB.users[uid])DB.users[uid].balance+=100;payLock.delete(parseInt(uid));ctx.editMessageCaption("✅ تأكيد");bot.telegram.sendMessage(uid,"✅ تم تأكيد دفعك").catch(()=>{});});
bot.action(/no_(.+)/,(ctx)=>{if(ctx.from.id!=ADMIN_ID)return;payLock.delete(parseInt(ctx.match[1]));ctx.editMessageCaption("❌ الغاء");});
bot.action(/ban_(.+)/,(ctx)=>{if(ctx.from.id!=ADMIN_ID)return;DB.bans.push(parseInt(ctx.match[1]));payLock.delete(parseInt(ctx.match[1]));ctx.editMessageCaption("🚫 حظر");});
bot.action(/buy_(.+)/,(ctx)=>{if(Date.now()-(lastBuy[ctx.from.id]||0)<10000)return ctx.answerCbQuery("⏳ بين كل شراء 10 ثواني - ضد الاوتو كليكر",{show_alert:true});lastBuy[ctx.from.id]=Date.now();ctx.reply("🛒 تم ارسال طلب الشراء");});
bot.hears("الـدعـم 🛎",(ctx)=>ctx.reply("🛎 اكتب رسالتك:"));
bot.on("text",(ctx)=>{const id=ctx.from.id;const t=ctx.message.text;if(["الـمـتـجـر 🏰","حـسـابـي 👤","الـمـحـفـظـة 💰","الـدعـم 🛎","إضــافــة إعــلان قــلــعــه","مــشــاهــدة قــلــعــه","🔙 رجوع"].includes(t))return;if(addMode.has(id)){addMode.delete(id);DB.castles.push({text:t.slice(0,400).replace(/[<>$`]/g,""),seller:id});return ctx.reply("✅ تم اضافة قلعتك",mainKB);}if(BAD.some(w=>t.includes(w))){const u=DB.users[id];u.warns=(u.warns||0)+1;if(u.warns>=3){DB.bans.push(id);return ctx.reply("🚫
حظر بعد 3 تحذيرات");}return ctx.reply(⚠️ تحذير ${u.warns}/3);}bot.telegram.sendMessage(ADMIN_ID,📩 دعم من ${id}:\n${t.slice(0,500)}).catch(()=>{});ctx.reply("✅ تم ارسال رسالتك للدعم");});
bot.command("setvodafone",(ctx)=>{if(ctx.from.id!=ADMIN_ID)return;DB.vodafone=ctx.message.text.split(" ")[1];ctx.reply("✅ Vodafone: "+DB.vodafone);});
bot.command("bans",(ctx)=>{if(ctx.from.id!=ADMIN_ID)return;ctx.reply(DB.bans.length?DB.bans.join("\n"):"لا يوجد محظورين");});
bot.command("unban",(ctx)=>{if(ctx.from.id!=ADMIN_ID)return;const uid=parseInt(ctx.message.text.split(" ")[1]);DB.bans=DB.bans.filter(x=>x!=uid);if(DB.users[uid])DB.users[uid].warns=0;ctx.reply("✅ فك حظر "+uid);});

bot.launch().then(()=>console.log("RENDER LIVE"));
