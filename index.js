const http = require("http");
const fs = require("fs");
const path = require("path");
const Telegraf = require("telegraf").Telegraf;
const Markup = require("telegraf").Markup;

var BOT_TOKEN = process.env.BOT_TOKEN;
var PORT = process.env.PORT || 10000;

var bot = new Telegraf(BOT_TOKEN);
var castles = [];

var server = http.createServer(function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    var p = path.join(__dirname, "form.html");
    var html = fs.readFileSync(p, "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (e) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("NADER STORE LIVE");
  }
});

server.listen(PORT, "0.0.0.0", function() {
  console.log("HTTP LIVE " + PORT);
});

function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("المتجر", "STORE")],
    [Markup.button.callback("حسابي", "ACCOUNT")],
    [Markup.button.callback("الدعم", "SUPPORT")]
  ]);
}

bot.start(function(ctx) {
  ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu());
});

bot.action("STORE", function(ctx) {
  ctx.answerCbQuery();
  var h = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
  ctx.reply("اختر الخدمة:", Markup.inlineKeyboard([
    [Markup.button.webApp("اضافة اعلان قلعة", "https://" + h)],
    [Markup.button.callback("مشاهدة القلاع", "VIEW")],
    [Markup.button.callback("رجوع", "MAIN")]
  ]));
});

bot.action("VIEW", function(ctx) {
  ctx.answerCbQuery();
  if (castles.length === 0) return ctx.reply("لا يوجد قلاع حاليا");
  var t = "القلاع: " + castles.length + "\n";
  for (var i = 0; i < castles.length; i++) {
    var c = castles[i];
    t = t + (i+1) + ". " + c.sellerName + " لفل " + c.level + "\n";
  }
  return ctx.reply(t);
});

bot.action("MAIN", function(ctx) {
  ctx.answerCbQuery();
  return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", mainMenu());
});

bot.action("ACCOUNT", function(ctx) {
  ctx.answerCbQuery();
  return ctx.reply("ID: " + ctx.from.id);
});

bot.action("SUPPORT", function(ctx) {
  ctx.answerCbQuery();
  return ctx.reply("ابعت رسالتك");
});

bot.on("message", function(ctx) {
  if (ctx.message && ctx.message.web_app_data) {
    try {
      var d = JSON.parse(ctx.message.web_app_data.data);
      castles.push(d);
      return ctx.reply("تم النشر بنجاح!");
    } catch (e) {
      return ctx.reply("خطأ");
    }
  }
});

bot.launch().then(function() { console.log("BOT LAUNCHED"); });
process.once('SIGINT', function() { bot.stop('SIGINT'); });
process.once('SIGTERM', function() { bot.stop('SIGTERM'); });
