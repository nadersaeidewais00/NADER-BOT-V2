const http = require("http");
http.createServer((req,res)=>{res.writeHead(200);res.end("OK");}).listen(process.env.PORT||10000,"0.0.0.0");

const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = Number(process.env.ADMIN_ID);

let castles = [];
let users = {};
let bans = [];
let vodafone = "01000000000";
let addMode = new Set();
let payLock = new Set();

function isBad(t){
  if(!t) return false;
  let s = t.toLowerCase();
  s = s.replace(/[أإآ]/g,"ا");
  const bad = ["كس","شرموط","خول","قحب","عرص","متناك","زبي","نيك","fuck","shit","bitch","asshole","dick","pussy","كسمك","احا"];
  for(let w of bad){ if(s.includes(w)) return true; }
  return false;
}

bot.start((ctx)=>{
  if(!users[ctx.from.id]) users[ctx.from.id]={balance:0,warns:0};
  ctx.reply("مرحبا في NADER STORE", Markup.keyboard([["المتجر"],["حسابي","المحفظة"],["الدعم"]]).resize());
});

bot.hears("المتجر",(ctx)=>ctx.reply("اختر", Markup.keyboard([["اضافة قلعة"],["مشاهدة قلعة"],["رجوع"]]).resize()));
bot.hears("رجوع",(ctx)=>ctx.reply("الرئيسية", Markup.keyboard([["المتجر"],["حسابي","المحفظة"],["الدعم"]]).resize()));
bot.hears("اضافة قلعة",(ctx)=>{addMode.add(ctx.from.id);ctx.reply("ابعت وصف القلعة");});
bot.hears("مشاهدة قلعة",(ctx)=>{
  if(!castles.length) return ctx.reply("لا يوجد قلاع");
  castles.forEach((c,i)=>ctx.reply("قلعة #"+(i+1)+"\n"+c.text, Markup.inlineKeyboard([[Markup.button.callback("شراء","buy_"+i)]])));
});
bot.hears("حسابي",(ctx)=>{
  let u=users[ctx.from.id]||{balance:0,warns:0};
  ctx.reply("ID: "+ctx.from.id+"\nرصيد: "+u.balance+"\nتحذيرات: "+u.warns+"/3");
});
bot.hears("المحفظة",(ctx)=>ctx.reply("رصيد: "+(users[ctx.from.id]?.balance||0)+"\nVodafone: "+vodafone, Markup.inlineKeyboard([[Markup.button.callback("تاكيد الدفع","pay")]])));
bot.hears("الدعم",(ctx)=>ctx.reply("ابعت رسالتك"));

bot.action("pay",(ctx)=>{
  if(payLock.has(ctx.from.id)) return ctx.reply("مرة واحدة فقط");
  payLock.add(ctx.from.id);
  ctx.reply("ابعت سكرين التحويل");
});

bot.on("photo",(ctx)=>{
  if(!payLock.has(ctx.from.id)) return;
  let fid=ctx.message.photo.pop().file_id;
  bot.telegram.sendPhoto(ADMIN_ID,fid,{caption:"دفع من "+ctx.from.id, reply_markup:{inline_keyboard:[[{text:"تأكيد",callback_data:"ok_"+ctx.from.id},{text:"الغاء",callback_data:"no_"+ctx.from.id}]]}}).catch(()=>{});
});

bot.action(/ok_(.+)/,(ctx)=>{
  if(ctx.from.id!=ADMIN_ID) return;
  let id=ctx.match[1];
  if(users[id]) users[id].balance+=100;
  payLock.delete(Number(id));
  ctx.editMessageCaption("تم التأكيد");
});
bot.action(/no_(.+)/,(ctx)=>{
  payLock.delete(Number(ctx.match[1]));
  ctx.editMessageCaption("تم الالغاء");
});

bot.on("text",(ctx)=>{
  let id=ctx.from.id; let t=ctx.message.text;
  if(["المتجر","حسابي","المحفظة","الدعم","اضافة قلعة","مشاهدة قلعة","رجوع"].includes(t)) return;
  if(addMode.has(id)){
    addMode.delete(id);
    castles.push({text:t.slice(0,400),seller:id});
    return ctx.reply("تمت اضافة القلعة");
  }
  if(isBad(t)){
    if(!users[id]) users[id]={balance:0,warns:0};
    users[id].warns++;
    if(users[id].warns>=3){bans.push(id); return ctx.reply("تم حظرك نهائي"); }
    return ctx.reply("تحذير "+users[id].warns+"/3 ممنوع الشتيمة");
  }
});

bot.launch().then(()=>console.log("LIVE"));
