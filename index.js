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

const server = http.createServer(function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  if(req.url === "/" || req.url.indexOf("/app") === 0){
    const fp = path.join(__dirname, "form.html");
    if(fs.existsSync(fp)){
      res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
      return res.end(fs.readFileSync(fp, "utf8"));
    }
    res.writeHead(404);
    return res.end("form.html not found");
  }
  res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
  res.end("NADER STORE LIVE");
});

server.listen(PORT, "0.0.0.0", function(){
  console.log("Server on " + PORT);
});

const HOST = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
const APP_URL = "https://" + HOST + "/app";

bot.start(function(ctx){
  const isAdmin = ctx.from.id === ADMIN_ID;
  const kb = isAdmin ? [["المتجر"], ["حسابي","المحفظة"], ["الدعم"], ["\u2699\uFE0F لوحة الادمن"]] : [["المتجر"], ["حسابي","المحفظة"], ["الدعم"]];
  return ctx.reply("مرحبا بك في متجر اختر الخدمة من خلال الازرار", Markup.keyboard(kb).resize());
});

bot.hears("المتجر", function(ctx){
  return ctx.reply("المتجر:", Markup.keyboard([["اضافة اعلان قلعة","مشاهدة القلاع"], ["رجوع"]]).resize());
});

bot.hears("رجوع", function(ctx){
  const isAdmin = ctx.from.id === ADMIN_ID;
  const kb = isAdmin ? [["المتجر"], ["حسابي","المحفظة"], ["الدعم"], ["\u2699\uFE0F لوحة الادمن"]] : [["المتجر"], ["حسابي","المحفظة"], ["الدعم"]];
  return ctx.reply("القائمة الرئيسية", Markup.keyboard(kb).resize());
});

bot.hears("اضافة اعلان قلعة", function(ctx){
  return ctx.reply("افتح نموذج عرض قلعتك:", Markup.inlineKeyboard([[Markup.button.webApp("\uD83C\uDFE0 عرض الان", APP_URL)]]));
});

bot.hears("مشاهدة القلاع", function(ctx){
  if(castles.length === 0) return ctx.reply("لا يوجد قلاع معروضة حاليا");
  let t = "\uD83C\uDFE0 القلاع (" + castles.length + "):\n\n";
  castles.slice(-10).reverse().forEach(function(c,i){
    let h = "";
    if(c.heroes){ h = c.heroes.map(function(x){ return x.name + " " + x.stars + "*"; }).join(", "); }
    t += (i+1) + ". " + c.sellerName + " - لفل " + c.level + "\n" + h + "\n\n";
  });
  return ctx.reply(t);
});

bot.hears("حسابي", function(ctx){ return ctx.reply("\uD83D\uDC64 حسابك:\nالايدي: " + ctx.from.id); });
bot.hears("المحفظة", function(ctx){ return ctx.reply("\uD83D\uDCB3 طرق الدفع:\nفودافون كاش: " + payments.vodafone); });
bot.hears("الدعم", function(ctx){ return ctx.reply("\uD83D\uDCE9 ارسل رسالة الدعم وسيتم تحويلها للادمن"); });

bot.hears("\u2699\uFE0F لوحة الادمن", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return ctx.reply("للادمن فقط");
  return ctx.reply("\u2699\uFE0F لوحة الادمن - اختر:", Markup.keyboard([["مشاهدة الاعلانات","طرق الدفع"], ["رسائل الدعم","اعدادات البوت"], ["عرض قلعة للبيع"], ["رجوع"]]).resize());
});

bot.hears("مشاهدة الاعلانات", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return;
  if(castles.length===0) return ctx.reply("لا يوجد اعلانات");
  let t = "\uD83D\uDCCB الاعلانات (" + castles.length + "):\n\n";
  castles.slice(-5).reverse().forEach(function(c,i){
    t += (i+1) + ". " + c.sellerName + " | " + c.phone + " | لفل " + c.level + " | سعر " + c.price + "\nقوة: تصفير " + (c.powers && c.powers.tasfir) + " تعويض " + (c.powers && c.powers.taweed) + " علوم " + (c.powers && c.powers.oloum) + " جنود " + (c.powers && c.powers.jonoud) + " مجد " + (c.powers && c.powers.majd) + " اشعال " + (c.powers && c.powers.ishal) + "\nخصائص: مشاة " + (c.khasais && c.khasais.mosah) + "% عجلات " + (c.khasais && c.khasais.ajalat) + "%\nعتاد: ازرق " + (c.atad && c.atad.blue) + " بنفسجي " + (c.atad && c.atad.purple) + " ذهبي " + (c.atad && c.atad.gold) + " اخضر " + (c.atad && c.atad.green) + "\nراية: مشاة "
    + (c.raya && c.raya.mosah) + "% عجلات " + (c.raya && c.raya.ajalat) + "%\n\n";
  });
  return ctx.reply(t);
});

bot.hears("طرق الدفع", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return;
  return ctx.reply("حالياً: " + payments.vodafone + "\n\nلتغيير الرقم ارسل:\n/setpay 010xxxxxxxxx", Markup.keyboard([["رجوع للادمن"],["رجوع"]]).resize());
});

bot.hears("رسائل الدعم", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return;
  if(supportMessages.length===0) return ctx.reply("لا يوجد رسائل دعم");
  let t = supportMessages.slice(-10).map(function(m,i){ return (i+1) + ". من " + m.fromName + " (" + m.fromId + "): " + m.text; }).join("\n\n");
  return ctx.reply(t);
});

bot.hears("اعدادات البوت", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return;
  return ctx.reply("اعدادات البوت:\n- تم ضبط الرسائل\n- للمسح /clearcastles");
});

bot.hears("عرض قلعة للبيع", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return;
  return ctx.reply("انت كادمن تريد عرض قلعة:", Markup.inlineKeyboard([[Markup.button.webApp("\uD83C\uDFE0 عرض قلعة للبيع", APP_URL)]]));
});

bot.hears("رجوع للادمن", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return;
  return ctx.reply("\u2699\uFE0F لوحة الادمن:", Markup.keyboard([["مشاهدة الاعلانات","طرق الدفع"], ["رسائل الدعم","اعدادات البوت"], ["عرض قلعة للبيع"], ["رجوع"]]).resize());
});

bot.command("setpay", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return;
  const num = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if(!num) return ctx.reply("ارسل: /setpay 010xxxxxxxxx");
  payments.vodafone = num;
  return ctx.reply("\u2705 تم تحديث فودافون كاش الى: " + num);
});

bot.command("clearcastles", function(ctx){
  if(ctx.from.id !== ADMIN_ID) return;
  castles = [];
  return ctx.reply("تم مسح كل الاعلانات");
});

bot.on("message", function(ctx, next){
  if(ctx.message && ctx.message.web_app_data){
    try{
      const data = JSON.parse(ctx.message.web_app_data.data);
      data.from = ctx.from.id;
      data.fromName = ctx.from.first_name;
      castles.push(data);
      if(ADMIN_ID){
        let h = "";
        if(data.heroes){ h = data.heroes.map(function(x){ return x.name + " (" + x.stars + "*)"; }).join(", "); }
        const adminMsg = "\uD83C\uDFE0 اعلان جديد!\nمن: " + data.sellerName + " - " + data.phone + "\nلفل: " + data.level + " - سعر: " + data.price + "\nقوة: تصفير " + data.powers.tasfir + " | تعويض " + data.powers.taweed + " | علوم " + data.powers.oloum + " | جنود " + data.powers.jonoud + " | مجد " + data.powers.majd + " | اشعال " + data.powers.ishal + "\nابطال: " + h + "\nخصائص: مشاة " + data.khasais.mosah + "% عجلات " + data.khasais.ajalat + "%\nعتاد: ازرق " + data.atad.blue + " بنفسجي " + data.atad.purple + " ذهبي " + data.atad.gold + " اخضر " + data.atad.green + "\nراية: مشاة " + data.raya.mosah + "% عجلات " + data.raya.ajalat + "%";
        bot.telegram.sendMessage(ADMIN_ID, adminMsg).catch(function(){});
      }
      return ctx.reply("\u2705 تم عرض قلعتك بنجاح!\n" + data.sellerName + " - لفل " + data.level);
    }catch(e){
      return ctx.reply("\u274C خطأ في الحفظ");
    }
  }
  if(ctx.message && ctx.message.text && ctx.message.text.indexOf("/") !== 0 && ctx.from.id !== ADMIN_ID){
    if(ctx.message.text.length > 5){
      supportMessages.push({fromId: ctx.from.id, fromName: ctx.from.first_name, text: ctx.message.text, time: new Date()});
    }
  }
  return next();
});

bot.launch().then(function(){ console.log("BOT LIVE: " + APP_URL); });
process.once("SIGINT", function(){ bot.stop("SIGINT"); });
process.once("SIGTERM", function(){ bot.stop("SIGTERM"); });
