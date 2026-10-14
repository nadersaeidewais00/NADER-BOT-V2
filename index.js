const http = require("http");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(BOT_TOKEN);

let heroes = {
  horses: ["اسكندر","بارون","جوهر","براك","هارون","عبدالرحمن"],
  archers: [],
  wheels: [],
  inf: ["المختار","محمد الفاتح"]
};

let castles = [];

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.url === "/api/heroes") {
    res.writeHead(200, {"Content-Type":"application/json; charset=utf-8"});
    return res.end(JSON.stringify(heroes));
  }
  if (req.url === "/" || req.url.startsWith("/app")) {
    const fp = path.join(__dirname, "form.html");
    if (fs.existsSync(fp)) {
      res.writeHead(200, {"Content-Type":"text/html; charset=utf-8"});
      return res.end(fs.readFileSync(fp,"utf8"));
    }
    res.writeHead(404);
    return res.end("form.html missing");
  }
  res.writeHead(200);
  res.end("NADER STORE LIVE");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server " + PORT);
});

const HOST = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
const APP_URL = "https://" + HOST + "/app";

bot.start((ctx) => {
  const isAdmin = ctx.from.id === ADMIN_ID;
  const kb = isAdmin? [["المتجر"],["حسابي","المحفظة"],["الدعم"],["⚙️ لوحة الادمن"]] : [["المتجر"],["حسابي","المحفظة"],["الدعم"]];
  return ctx.reply("مرحبا NADER STORE BLACK GOLD", Markup.keyboard(kb).resize());
});

bot.hears("المتجر", (ctx) => ctx.reply("اختر:", Markup.keyboard([["اضافة اعلان قلعة","مشاهدة القلاع"],["رجوع"]]).resize()));

bot.hears("رجوع", (ctx) => {
  const isAdmin = ctx.from.id === ADMIN_ID;
  const kb = isAdmin? [["المتجر"],["حسابي","المحفظة"],["الدعم"],["⚙️ لوحة الادمن"]] : [["المتجر"],["حسابي","المحفظة"],["الدعم"]];
  return ctx.reply("الرئيسية", Markup.keyboard(kb).resize());
});

bot.hears("اضافة اعلان قلعة", (ctx) => {
  return ctx.reply("افتح النموذج:", Markup.inlineKeyboard([[Markup.button.webApp("🏰 فتح النموذج", APP_URL)]]));
});

bot.hears("مشاهدة القلاع", (ctx) => {
  if (castles.length === 0) return ctx.reply("لا يوجد قلاع");
  let t = "";
  castles.slice(-5).forEach((c,i)=>{ t += (i+1)+". "+c.sellerName+" لفل "+c.level+"\n"; });
  return ctx.reply(t);
});

bot.hears("⚙️ لوحة الادمن", (ctx) => {
  if (ctx.from.id!== ADMIN_ID) return ctx.reply("للادمن فقط");
  return ctx.reply("اوامر:\n/addhero فرسان اسكندر\n/addhero رماة كوسم\n/addhero عجلات برقوق\n/heroes");
});

bot.command("heroes", (ctx) => {
  if (ctx.from.id!== ADMIN_ID) return;
  return ctx.reply("فرسان: "+heroes.horses.join(", ")+"\nرماة: "+heroes.archers.join(", ")+"\nعجلات: "+heroes.wheels.join(", ")+"\nمشاة: "+heroes.inf.join(", "));
});

bot.command("addhero", (ctx) => {
  if (ctx.from.id!== ADMIN_ID) return;
  const parts = ctx.message.text.split(" ").slice(1);
  if (parts.length < 2) return ctx.reply("مثال: /addhero رماة كوسم");
  const cat = parts[0];
  const name = parts.slice(1).join(" ").trim();
  let key = "horses";
  if (cat.includes("فرس")) key = "horses";
  else if (cat.includes("رماة")) key = "archers";
  else if (cat.includes("عجل")) key = "wheels";
  else key = "inf";
  if (!heroes[key].includes(name)) heroes[key].push(name);
  return ctx.reply("تم اضافة "+name);
});

bot.command("delhero", (ctx) => {
  if (ctx.from.id!== ADMIN_ID) return;
  const parts = ctx.message.text.split(" ").slice(1);
  const cat = parts[0];
  const name = parts.slice(1).join(" ").trim();
  let key = "horses";
  if (cat.includes("فرس")) key = "horses";
  else if (cat.includes("رماة")) key = "archers";
  else if (cat.includes("عجل")) key = "wheels";
  else key = "inf";
  heroes[key] = heroes[key].filter(n=>n!==name);
  return ctx.reply("تم حذف "+name);
});
bot.on("message", (ctx, next) => {
  if (ctx.message && ctx.message.web_app_data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      castles.push(data);
      return ctx.reply("✅ تم حفظ اعلانك: "+data.sellerName);
    } catch(e) {
      return ctx.reply("خطأ حفظ");
    }
  }
  return next();
});

bot.launch().then(()=>{ console.log("BOT LIVE"); });
