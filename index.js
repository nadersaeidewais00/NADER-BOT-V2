const http = require("http");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(BOT_TOKEN);
let castles = [];
let payments = { vodafone: "010xxxxxxxxx" };
let supportMessages = [];
let waitingSupport = new Set();

const server = http.createServer(function(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS"){ res.writeHead(200); return res.end(); }
  if(req.url==="/" || req.url.indexOf("/app")===0){
    const fp = path.join(__dirname,"form.html");
    if(fs.existsSync(fp)){
      res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
      return res.end(fs.readFileSync(fp,"utf8"));
    }
  }
  res.writeHead(200,{"Content-Type":"text/plain; charset=utf-8"});
  res.end("NADER STORE LIVE");
});
server.listen(PORT,"0.0.0.0",function(){ console.log("Server on "+PORT); });

const HOST = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
const APP_URL = "https://" + HOST + "/app";

function mainMenu(isAdmin){
  if(isAdmin){
    return Markup.inlineKeyboard([
      [Markup.button.callback("🏪 المتجر - NADER STORE","STORE")],
      [Markup.button.callback("👤 حسابي","ACCOUNT"), Markup.button.callback("💳 المحفظة","WALLET")],
      [Markup.button.callback("📩 الدعم","SUPPORT")],
      [Markup.button.callback("⚙️ لوحة الادمن","ADMIN")]
    ]);
  }else{
    return Markup.inlineKeyboard([
      [Markup.button.callback("🏪 المتجر - NADER STORE","STORE")],
      [Markup.button.callback("👤 حسابي","ACCOUNT"), Markup.button.callback("💳 المحفظة","WALLET")],
      [Markup.button.callback("📩 الدعم","SUPPORT")]
    ]);
  }
}

bot.start(function(ctx){
  const isAdmin = ctx.from.id === ADMIN_ID;
  return ctx.reply("Welcome to NADER STORE 🏰\nمرحبا بك في متجر نادر - اختر الخدمة من الازرار داخل الشات:", mainMenu(isAdmin));
});

bot.action("STORE", function(ctx){
  ctx.answerCbQuery();
  return ctx.reply("🏪 المتجر - NADER STORE:", Markup.inlineKeyboard([
    [Markup.button.webApp("🏰 اضافة اعلان قلعة - اعرض الان", APP_URL)],
    [Markup.button.callback("👁️ مشاهدة القلاع","VIEW")],
    [Markup.button.callback("🔙 رجوع للقائمة","MAIN")]
  ]));
});

bot.action("VIEW", function(ctx){
  ctx.answerCbQuery();
  if(castles.length===0) return ctx.reply("لا يوجد قلاع معروضة حاليا");
  let t = "🏰 القلاع المعروضة ("+castles.length+") - NADER STORE:\n\n";
  castles.slice(-10).reverse().forEach(function(c,i){
    let h = "";
    if(c.heroes) h = c.heroes.map(function(x){ return x.name+" "+x.stars+"*"; }).join(", ");
    t += (i+1)+". "+c.sellerName+" | لفل "+c.level+" | سعر "+c.price+"\nابطال: "+h+"\n\n";
  });
  return ctx.reply(t);
});

bot.action("ACCOUNT", function(ctx){
  ctx.answerCbQuery();
  return ctx.reply("👤 حسابك - NADER STORE\nالايدي: "+ctx.from.id+"\nالاسم: "+ctx.from.first_name);
});

bot.action("WALLET", function(ctx){
  ctx.answerCbQuery();
  return ctx.reply("💳 المحفظة - NADER STORE\nفودافون كاش: "+payments.vodafone);
});

bot.action("SUPPORT", function(ctx){
  ctx.answerCbQuery();
  waitingSupport.add(ctx.from.id);
  return ctx.reply("📩 ارسل رسالة الدعم الان وسيتم تحويلها للادمن مباشرة - اكتب رسالتك:");
});

bot.action("ADMIN", function(ctx){
  ctx.answerCbQuery();
  if(ctx.from.id!==ADMIN_ID) return ctx.reply("للادمن فقط");
  return ctx.reply("⚙️ لوحة ادمن - NADER STORE:", Markup.inlineKeyboard([
    [Markup.button.callback("📋 مشاهدة الاعلانات","AD_LIST")],
    [Markup.button.callback("💳 طرق الدفع","AD_PAY")],
    [Markup.button.callback("📩 رسائل الدعم","AD_SUPPORT")],
    [Markup.button.callback("🏰 عرض قلعة للبيع","AD_SELL")],
    [Markup.button.callback("🔙 رجوع","MAIN")]
  ]));
});
bot.action("AD_LIST", function(ctx){
  ctx.answerCbQuery();
  if(ctx.from.id!==ADMIN_ID) return;
  if(castles.length===0) return ctx.reply("لا يوجد اعلانات");
  let t = "📋 الاعلانات ("+castles.length+"):\n\n";
  castles.slice(-5).reverse().forEach(function(c,i){
    t += (i+1)+". "+c.sellerName+" | "+c.phone+" | لفل "+c.level+" | "+c.price+"\nتصفير "+c.powers.tasfir+" تعويض "+c.powers.taweed+" علوم "+c.powers.oloum+" جنود "+c.powers.jonoud+" مجد "+c.powers.majd+" اشعال "+c.powers.ishal+"\nخصائص مشاة "+c.khasais.mosah+"% عجلات "+c.khasais.ajalat+"%\nعتاد ازرق "+c.atad.blue+" بنفسجي "+c.atad.purple+" ذهبي "+c.atad.gold+" اخضر "+c.atad.green+"\n\n";
  });
  return ctx.reply(t);
});

bot.action("AD_PAY", function(ctx){
  ctx.answerCbQuery();
  return ctx.reply("حالياً: "+payments.vodafone+"\nلتغيير الرقم ارسل:\n/setpay 010xxxxxxxxx");
});

bot.action("AD_SUPPORT", function(ctx){
  ctx.answerCbQuery();
  if(supportMessages.length===0) return ctx.reply("لا يوجد رسائل دعم");
  let t = "📩 رسائل الدعم:\n\n"+supportMessages.slice(-10).map(function(m,i){ return (i+1)+". من "+m.fromName+" ("+m.fromId+"): "+m.text; }).join("\n\n");
  return ctx.reply(t);
});

bot.action("AD_SELL", function(ctx){
  ctx.answerCbQuery();
  return ctx.reply("انت كادمن - عرض قلعة:", Markup.inlineKeyboard([[Markup.button.webApp("🏰 اعرض الان - NADER STORE", APP_URL)]]));
});

bot.action("MAIN", function(ctx){
  ctx.answerCbQuery();
  const isAdmin = ctx.from.id===ADMIN_ID;
  return ctx.reply("Welcome to NADER STORE - القائمة الرئيسية:", mainMenu(isAdmin));
});

bot.command("setpay", function(ctx){
  if(ctx.from.id!==ADMIN_ID) return;
  const num = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if(!num) return ctx.reply("ارسل: /setpay 010xxxxxxxxx");
  payments.vodafone = num;
  return ctx.reply("✅ تم تحديث فودافون كاش الى: "+num);
});

bot.command("clearcastles", function(ctx){
  if(ctx.from.id!==ADMIN_ID) return;
  castles = [];
  return ctx.reply("✅ تم مسح كل الاعلانات بنجاح");
});

bot.on("message", function(ctx,next){
  if(ctx.message && ctx.message.web_app_data){
    try{
      const data = JSON.parse(ctx.message.web_app_data.data);
      castles.push(data);
      if(ADMIN_ID){
        let h = "";
        if(data.heroes) h = data.heroes.map(function(x){ return x.name+" ("+x.stars+"*)"; }).join(", ");
        const msg = "🏰 اعلان جديد - NADER STORE!\nمن: "+data.sellerName+" - "+data.phone+"\nلفل: "+data.level+" - سعر: "+data.price+"\nقوة: تصفير "+data.powers.tasfir+" تعويض "+data.powers.taweed+" علوم "+data.powers.oloum+" جنود "+data.powers.jonoud+" مجد "+data.powers.majd+" اشعال "+data.powers.ishal+"\nابطال: "+h+"\nخصائص مشاة "+data.khasais.mosah+"% عجلات "+data.khasais.ajalat+"%\nعتاد ازرق "+data.atad.blue+" بنفسجي "+data.atad.purple+" ذهبي "+data.atad.gold+" اخضر "+data.atad.green;
        bot.telegram.sendMessage(ADMIN_ID, msg).catch(function(){});
      }
      return ctx.reply("✅ تم عرض قلعتك بنجاح في NADER STORE!\n"+data.sellerName+" - لفل "+data.level+" - اعرض الان تم");
    }catch(e){ return ctx.reply("❌ خطأ في الحفظ"); }
  }
  if(waitingSupport.has(ctx.from.id) && ctx.message && ctx.message.text && ctx.message.text.indexOf("/")!==0){
    const txt = ctx.message.text;
    supportMessages.push({fromId:ctx.from.id, fromName:ctx.from.first_name, text:txt, time:new Date()});
    waitingSupport.delete(ctx.from.id);
    if(ADMIN_ID) bot.telegram.sendMessage(ADMIN_ID, "📩 رسالة دعم جديدة من "+ctx.from.first_name+" ("+ctx.from.id+"):\n"+txt).catch(function(){});
    return ctx.reply("✅ تم ارسال رسالة الدعم للادمن - سيتم الرد قريبا");
  }
  return next();
});

bot.launch().then(function(){ console.log("BOT LIVE NADER STORE: "+APP_URL); });
process.once("SIGINT", function(){ bot.stop("SIGINT"); });
process.once("SIGTERM", function(){ bot.stop("SIGTERM"); });
