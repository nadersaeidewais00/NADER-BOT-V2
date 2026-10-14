const http = require("http");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(BOT_TOKEN);

let castles = [];
let supportMessages = [];
let waitingSupport = new Set();
let payments = { vodafone: "010xxxxxxxxx" };

const server = http.createServer((req,res)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS"){res.writeHead(200);return res.end();}
  if(req.url==="/"req.url.includes("/app")req.url.includes("form")){
    const fp=path.join(__dirname,"form.html");
    if(fs.existsSync(fp)){
      res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
      return res.end(fs.readFileSync(fp,"utf8"));
    }
  }
  res.writeHead(200,{"Content-Type":"text/plain; charset=utf-8"});
  res.end("NADER STORE LIVE");
});

server.listen(PORT,"0.0.0.0",()=>console.log("Server live on "+PORT));

const HOST = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
const APP_URL = "https://"+HOST+"/app";

function mainMenu(isAdmin){
  const kb=[
    [Markup.button.callback("NADER STORE - المتجر 🏪","STORE")],
    [Markup.button.callback("حسابي 👤","ACCOUNT"),Markup.button.callback("المحفظة 💳","WALLET")],
    [Markup.button.callback("الدعم 📩","SUPPORT")]
  ];
  if(isAdmin) kb.push([Markup.button.callback("لوحة الادمن ⚙️","ADMIN")]);
  return Markup.inlineKeyboard(kb);
}

bot.start((ctx)=>{
  const isAdmin=ctx.from.id===ADMIN_ID;
  return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu(isAdmin));
});

bot.action("STORE",(ctx)=>{
  ctx.answerCbQuery();
  return ctx.reply("NADER STORE - المتجر:",Markup.inlineKeyboard([
    [Markup.button.webApp("اضافة اعلان قلعة 🏰",APP_URL)],
    [Markup.button.callback("مشاهدة القلاع 👀","VIEW")],
    [Markup.button.callback("رجوع 🔙","MAIN")]
  ]));
});

bot.action("VIEW",(ctx)=>{
  ctx.answerCbQuery();
  if(castles.length===0) return ctx.reply("لا يوجد قلاع حاليا");
  let t="🏰 القلاع ("+castles.length+"):\n\n";
  castles.slice(-10).reverse().forEach((c,i)=>{
    t+=(i+1)+". "+c.sellerName+" | لفل "+c.level+" | "+c.price+"\n";
  });
  return ctx.reply(t);
});

bot.action("ACCOUNT",(ctx)=>{
  ctx.answerCbQuery();
  return ctx.reply("👤 حسابك\nالايدي: "+ctx.from.id);
});

bot.action("WALLET",(ctx)=>{
  ctx.answerCbQuery();
  return ctx.reply("💳 المحفظة\nفودافون كاش: "+payments.vodafone);
});

bot.action("SUPPORT",(ctx)=>{
  ctx.answerCbQuery();
  waitingSupport.add(ctx.from.id);
  return ctx.reply("📩 ارسل رسالة الدعم الان:");
});

bot.action("ADMIN",(ctx)=>{
  if(ctx.from.id!==ADMIN_ID) return ctx.reply("للادمن فقط");
  ctx.answerCbQuery();
  return ctx.reply("⚙️ لوحة تحكم الادمن:",Markup.inlineKeyboard([
    [Markup.button.callback("📋 عرض الاعلانات","AD_LIST")],
    [Markup.button.callback("📩 رسائل الدعم","AD_SUP")],
    [Markup.button.callback("💰 تعديل المحفظة","AD_WALLET")],
    [Markup.button.callback("رجوع 🔙","MAIN")]
  ]));
});

bot.action("AD_LIST",(ctx)=>{
  ctx.answerCbQuery();
  if(castles.length===0) return ctx.reply("لا يوجد اعلانات");
  let txt="📋 اخر الاعلانات:\n\n";
  castles.slice(-10).reverse().forEach((c,i)=>{
    txt+=(i+1)+". "+c.sellerName+" - "+c.phone+" - لفل "+c.level+" - "+c.price+"\n";
    if(c.abtal){
      txt+="مشاة:"+c.abtal.moshah.map(x=>x.name+" "+x.stars).join(" | ")+"\n";
      txt+="فرسان:"+c.abtal.forsan.map(x=>x.name+" "+x.stars).join(" | ")+"\n";
      txt+="رماة:"+c.abtal.romah.map(x=>x.name+" "+x.stars).join(" | ")+"\n\n";
    }
  });
  return ctx.reply(txt.slice(0,4000));
});
bot.action("AD_SUP",(ctx)=>{
  ctx.answerCbQuery();
  if(supportMessages.length===0) return ctx.reply("لا يوجد رسائل دعم");
  let txt="📩 رسائل الدعم:\n\n";
  supportMessages.slice(-10).reverse().forEach((s,i)=>{
    txt+=(i+1)+". من "+s.fromId+": "+s.text+"\n";
  });
  return ctx.reply(txt.slice(0,4000));
});

bot.action("MAIN",(ctx)=>{
  ctx.answerCbQuery();
  return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu(ctx.from.id===ADMIN_ID));
});

bot.on("message",(ctx,next)=>{
  if(ctx.message?.web_app_data){
    try{
      const d=JSON.parse(ctx.message.web_app_data.data);
      castles.push(d);
      if(ADMIN_ID){
        let adminMsg="🏰 اعلان جديد\nمن: "+d.sellerName+" - "+d.phone+"\nلفل: "+d.level+" سعر: "+d.price;
        bot.telegram.sendMessage(ADMIN_ID,adminMsg).catch(()=>{});
      }
      return ctx.reply("✅ تم عرض قلعتك بنجاح!");
    }catch(e){
      return ctx.reply("❌ حصل خطأ في حفظ الاعلان");
    }
  }

  if(waitingSupport.has(ctx.from.id) && ctx.message?.text && !ctx.message.text.startsWith("/")){
    supportMessages.push({fromId:ctx.from.id,firstName:ctx.from.first_name,text:ctx.message.text,time:new Date()});
    waitingSupport.delete(ctx.from.id);
    if(ADMIN_ID){
      bot.telegram.sendMessage(ADMIN_ID,"📩 دعم من "+ctx.from.first_name+" ("+ctx.from.id+"):\n"+ctx.message.text).catch(()=>{});
    }
    return ctx.reply("✅ تم ارسال رسالة الدعم وسيتم الرد عليك قريبا");
  }

  return next();
});

bot.launch().then(()=>console.log("BOT LIVE: "+APP_URL)).catch(e=>console.error(e));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
