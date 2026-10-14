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

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.url === "/" || req.url.startsWith("/app")) {
    const fp = path.join(__dirname, "form.html");
    if (fs.existsSync(fp)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(fs.readFileSync(fp, "utf8"));
    }
    res.writeHead(404); return res.end("form.html not found");
  }
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("NADER STORE LIVE");
});
server.listen(PORT, "0.0.0.0", () => console.log("Server on " + PORT));

const HOST = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
const APP_URL = https://${HOST}/app;

bot.start((ctx) => {
  const isAdmin = ctx.from.id === ADMIN_ID;
  const kb = isAdmin
    ? [["المتجر"], ["حسابي","المحفظة"], ["الدعم"], ["⚙️ لوحة الادمن"]]
    : [["المتجر"], ["حسابي","المحفظة"], ["الدعم"]];
  return ctx.reply("مرحبا بك في متجر اختر الخدمة من خلال الازرار", Markup.keyboard(kb).resize());
});

bot.hears("المتجر", (ctx) => ctx.reply("المتجر:", Markup.keyboard([["اضافة اعلان قلعة","مشاهدة القلاع"], ["رجوع"]]).resize()));
bot.hears("رجوع", (ctx) => {
  const isAdmin = ctx.from.id === ADMIN_ID;
  const kb = isAdmin ? [["المتجر"], ["حسابي","المحفظة"], ["الدعم"], ["⚙️ لوحة الادمن"]] : [["المتجر"], ["حسابي","المحفظة"], ["الدعم"]];
  return ctx.reply("القائمة الرئيسية", Markup.keyboard(kb).resize());
});
bot.hears("اضافة اعلان قلعة", (ctx) => ctx.reply("افتح نموذج عرض قلعتك:", Markup.inlineKeyboard([[Markup.button.webApp("🏰 عرض الان", APP_URL)]])));
bot.hears("مشاهدة القلاع", (ctx) => {
  if (castles.length === 0) return ctx.reply("لا يوجد قلاع معروضة حاليا");
  let t = 🏰 القلاع (${castles.length}):\n\n;
  castles.slice(-10).reverse().forEach((c,i)=>{ const h=(c.heroes||[]).map(x=>${x.name} ${x.stars}⭐).join(", "); t+=${i+1}. ${c.sellerName} - لفل ${c.level} - ${c.price||""}\n${h}\n\n; });
  return ctx.reply(t);
});
bot.hears("حسابي", (ctx) => ctx.reply("👤 حسابك:\nالايدي: "+ctx.from.id));
bot.hears("المحفظة", (ctx) => ctx.reply(💳 طرق الدفع:\nفودافون كاش: ${payments.vodafone}));
bot.hears("الدعم", (ctx) => ctx.reply("📩 ارسل رسالة الدعم وسيتم تحويلها للادمن"));

bot.hears("⚙️ لوحة الادمن", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("للادمن فقط");
  return ctx.reply("⚙️ لوحة الادمن - اختر:", Markup.keyboard([["مشاهدة الاعلانات","طرق الدفع"], ["رسائل الدعم","اعدادات البوت"], ["عرض قلعة للبيع"], ["رجوع"]]).resize());
});
bot.hears("مشاهدة الاعلانات", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  if (castles.length===0) return ctx.reply("لا يوجد اعلانات");
  let t = 📋 الاعلانات (${castles.length}):\n\n;
  castles.slice(-5).reverse().forEach((c,i)=>{ t+=${i+1}. ${c.sellerName} | ${c.phone} | لفل ${c.level} | سعر ${c.price}\nقوة: تصفير ${c.powers?.tasfir} تعويض ${c.powers?.taweed} علوم ${c.powers?.oloum} جنود ${c.powers?.jonoud} مجد ${c.powers?.majd} اشعال ${c.powers?.ishal}\nخصائص: مشاة ${c.khasais?.mosah}% عجلات ${c.khasais?.ajalat}%\nعتاد: ازرق ${c.atad?.blue} بنفسجي ${c.atad?.purple} ذهبي ${c.atad?.gold} اخضر ${c.atad?.green}\nراية: مشاة ${c.raya?.mosah}% عجلات ${c.raya?.ajalat}%\n\n; });
  return ctx.reply(t);
});
bot.hears("طرق الدفع", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  return ctx.reply(حالياً: ${payments.vodafone}\n\nلتغيير الرقم ارسل:\n/setpay 010xxxxxxxxx, Markup.keyboard([["رجوع للادمن"],["رجوع"]]).resize());
});
bot.hears("رسائل الدعم", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  if (supportMessages.length===0) return ctx.reply("لا يوجد رسائل دعم");
  let t = supportMessages.slice(-10).map((m,i)=> ${i+1}. من ${m.fromName} (${m.fromId}): ${m.text}).join("\n\n");
  return ctx.reply(t);
});
bot.hears("اعدادات البوت", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  return ctx.reply("اعدادات البوت:\n- الرسالة الترحيبية تم ضبطها\n- للمسح /clearcastles");
});
bot.hears("عرض قلعة للبيع", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  return ctx.reply("انت كادمن تريد عرض قلعة:", Markup.inlineKeyboard([[Markup.button.webApp("🏰 عرض قلعة للبيع", APP_URL)]]));
});
bot.hears("رجوع للادمن", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  return ctx.reply("⚙️ لوحة الادمن:", Markup.keyboard([["مشاهدة الاعلانات","طرق الدفع"], ["رسائل الدعم","اعدادات البوت"], ["عرض قلعة للبيع"], ["رجوع"]]).resize());
});
bot.command("setpay", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const num = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!num) return ctx.reply("ارسل: /setpay 010xxxxxxxxx");
  payments.vodafone = num;
  return ctx.reply("✅ تم تحديث فودافون كاش الى: "+num);
});
bot.command("clearcastles", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  castles = []; return ctx.reply("تم مسح كل الاعلانات");
});
bot.on("message", (ctx, next) => {
  if (ctx.message && ctx.message.web_app_data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      data.from = ctx.from.id; data.fromName = ctx.from.first_name;
      castles.push(data);
      if (ADMIN_ID) {
        const h = (data.heroes||[]).map(x=> ${x.name} (${x.stars}⭐)).join(", ");
        const adminMsg = 🏰 اعلان جديد!\nمن: ${data.sellerName} - ${data.phone}\nلفل: ${data.level} - سعر: ${data.price}\nقوة: تصفير ${data.powers?.tasfir} | تعويض ${data.powers?.taweed} | علوم ${data.powers?.oloum} | جنود ${data.powers?.jonoud} | مجد ${data.powers?.majd} | اشعال ${data.powers?.ishal}\nابطال: ${h}\nخصائص: مشاة ${data.khasais?.mosah}% عجلات ${data.khasais?.ajalat}%\nعتاد: ازرق ${data.atad?.blue} بنفسجي ${data.atad?.purple} ذهبي ${data.atad?.gold} اخضر ${data.atad?.green}\nراية: مشاة ${data.raya?.mosah}% عجلات ${data.raya?.ajalat}%;
        bot.telegram.sendMessage(ADMIN_ID, adminMsg).catch(()=>{});
      }
      return ctx.reply(✅ تم عرض قلعتك بنجاح!\n${data.sellerName} - لفل ${data.level});
    } catch(e){ return ctx.reply("❌ خطأ في الحفظ"); }
  }
  if (ctx.message && ctx.message.text && !ctx.message.text.startsWith("/") && ctx.from.id !== ADMIN_ID) {
    if (ctx.message.text.length > 5) supportMessages.push({fromId: ctx.from.id, fromName: ctx.from.first_name, text: ctx.message.text, time: new Date()});
  }
  return next();
});
bot.launch().then(()=> console.log("BOT LIVE: "+APP_URL));
process.once("SIGINT", ()=> bot.stop("SIGINT"));
process.once("SIGTERM", ()=> bot.stop("SIGTERM")); 
