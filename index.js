const http = require("http");
const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const PORT = process.env.PORT || 10000;

if (!BOT_TOKEN) {
  console.log("ERROR: BOT_TOKEN ناقص");
}

const bot = new Telegraf(BOT_TOKEN);

// الابطال - انت بتتحكم بيهم من التليجرام
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
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify(heroes));
  }

  if (req.url === "/" || req.url.startsWith("/app")) {
    const fp = path.join(__dirname, "form.html");
    if (fs.existsSync(fp)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(fs.readFileSync(fp, "utf8"));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("form.html not found - ارفع form.html");
    }
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("NADER STORE BLACK GOLD LIVE");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on " + PORT);
});

const HOST = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
const APP_URL = https://${HOST}/app;

bot.start((ctx) => {
  const isAdmin = ctx.from.id === ADMIN_ID;
  const kb = isAdmin
    ? [["المتجر"], ["حسابي","المحفظة"], ["الدعم"], ["⚙️ لوحة الادمن"]]
    : [["المتجر"], ["حسابي","المحفظة"], ["الدعم"]];
  return ctx.reply(
    "مرحبا بك في NADER STORE BLACK GOLD 🏰✨\nنسخة فخمة مختلفة عن بلقيس",
    Markup.keyboard(kb).resize()
  );
});

bot.hears("المتجر", (ctx) => {
  return ctx.reply("اختر:", Markup.keyboard([["اضافة اعلان قلعة","مشاهدة القلاع"], ["رجوع"]]).resize());
});

bot.hears("رجوع", (ctx) => {
  const isAdmin = ctx.from.id === ADMIN_ID;
  const kb = isAdmin
    ? [["المتجر"], ["حسابي","المحفظة"], ["الدعم"], ["⚙️ لوحة الادمن"]]
    : [["المتجر"], ["حسابي","المحفظة"], ["الدعم"]];
  return ctx.reply("القائمة الرئيسية", Markup.keyboard(kb).resize());
});

bot.hears("اضافة اعلان قلعة", (ctx) => {
  return ctx.reply(
    "افتح النموذج الفخم:",
    Markup.inlineKeyboard([[Markup.button.webApp("🏰 فتح نموذج NADER BLACK GOLD", APP_URL)]])
  );
});

bot.hears("مشاهدة القلاع", (ctx) => {
  if (castles.length === 0) return ctx.reply("لا يوجد قلاع حاليا");
  let t = 🏰 قلاع NADER STORE (${castles.length}):\n\n;
  castles.slice(-10).reverse().forEach((c, i) => {
    t += ${i+1}. ${c.sellerName} | لفل ${c.level} | ${c.power||""} | ابطال: ${(c.heroes||[]).join(", ")}\n;
  });
  return ctx.reply(t);
});

bot.hears("⚙️ لوحة الادمن", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("للادمن فقط");
  return ctx.reply(
⚙️ لوحة تحكم BLACK GOLD

الاوامر:
/addhero فرسان اسكندر
/addhero رماة كوسم
/addhero عجلات برقوق
/addhero مشاة المختار

/delhero فرسان اسكندر
/heroes - عرض الكل
/clearheroes - مسح الكل
  );
});

bot.command("heroes", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  return ctx.reply(
فرسان: ${heroes.horses.join(", ") || "فاضي"}
رماة: ${heroes.archers.join(", ") || "فاضي"}
عجلات: ${heroes.wheels.join(", ") || "فاضي"}
مشاة: ${heroes.inf.join(", ") || "فاضي"}
  );
});

bot.command("addhero", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const parts = ctx.message.text.split(" ").slice(1);
  if (parts.length < 2) return ctx.reply("مثال: /addhero رماة كوسم");
  const cat = parts[0];
  const name = parts.slice(1).join(" ").trim();
  let key = "horses";
  if (cat.includes("فرس")) key = "horses";
  else if (cat.includes("رماة") || cat.includes("رماه")) key = "archers";
  else if (cat.includes("عجل")) key = "wheels";
  else key = "inf";
  if (!heroes[key].includes(name)) heroes[key].push(name);
  return ctx.reply(✅ تم اضافة ${name} الى ${cat});
});
bot.command("delhero", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const parts = ctx.message.text.split(" ").slice(1);
  if (parts.length < 2) return ctx.reply("مثال: /delhero فرسان اسكندر");
  const cat = parts[0];
  const name = parts.slice(1).join(" ").trim();
  let key = "horses";
  if (cat.includes("فرس")) key = "horses";
  else if (cat.includes("رماة") || cat.includes("رماه")) key = "archers";
  else if (cat.includes("عجل")) key = "wheels";
  else key = "inf";
  heroes[key] = heroes[key].filter((n) => n !== name);
  return ctx.reply(🗑️ تم حذف ${name});
});

bot.command("clearheroes", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  heroes = { horses: [], archers: [], wheels: [], inf: [] };
  return ctx.reply("تم مسح الكل");
});

bot.on("message", (ctx, next) => {
  if (ctx.message && ctx.message.web_app_data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      castles.push(data);
      return ctx.reply(✅ تم نشر عرضك!\n${data.sellerName} - قلعة ${data.level}\nالابطال: ${(data.heroes||[]).join(", ")});
    } catch (e) {
      return ctx.reply("خطأ في حفظ البيانات");
    }
  }
  return next();
});

bot.launch().then(() => {
  console.log("BOT LIVE: " + APP_URL);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
