const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 10000;

// HTTP Server - لازم يفضل شغال عشان Render
const server = http.createServer(function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    var p = path.join(__dirname, "form.html");
    if (fs.existsSync(p)) {
      var html = fs.readFileSync(p, "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    }
  } catch (e) {}
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("NADER STORE LIVE - " + new Date().toISOString());
});

server.listen(PORT, "0.0.0.0", function() {
  console.log("HTTP LIVE ON " + PORT);
});

// Bot - لو فشل مش هيوقع السيرفر
try {
  var Telegraf = require("telegraf").Telegraf;
  var Markup = require("telegraf").Markup;
  var BOT_TOKEN = process.env.BOT_TOKEN;
  
  if (!BOT_TOKEN) {
    console.log("NO BOT_TOKEN - HTTP ONLY");
  } else {
    var bot = new Telegraf(BOT_TOKEN);
    var castles = [];

    bot.start(function(ctx) {
      return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :", 
        Markup.inlineKeyboard([
          [Markup.button.callback("المتجر", "STORE")],
          [Markup.button.callback("حسابي", "ACCOUNT")]
        ])
      );
    });

    bot.action("STORE", function(ctx) {
      ctx.answerCbQuery();
      var h = process.env.RENDER_EXTERNAL_HOSTNAME || "nader-bot-v2.onrender.com";
      return ctx.reply("اختر:", Markup.inlineKeyboard([
        [Markup.button.webApp("اضافة اعلان", "https://" + h)],
        [Markup.button.callback("رجوع", "MAIN")]
      ]));
    });

    bot.action("MAIN", function(ctx) {
      ctx.answerCbQuery();
      return ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إخـتـر الـخـدمـه مـن الأزرار :");
    });

    bot.action("ACCOUNT", function(ctx) {
      ctx.answerCbQuery();
      return ctx.reply("ID: " + ctx.from.id);
    });

    bot.on("message", function(ctx) {
      if (ctx.message && ctx.message.web_app_data) {
        try {
          var d = JSON.parse(ctx.message.web_app_data.data);
          castles.push(d);
          return ctx.reply("تم النشر!");
        } catch (e) {}
      }
    });

    bot.launch().then(function() {
      console.log("BOT LAUNCHED");
    }).catch(function(e) {
      console.log("BOT FAILED: " + e.message);
    });

    process.once('SIGINT', function() { bot.stop('SIGINT'); });
    process.once('SIGTERM', function() { bot.stop('SIGTERM'); });
  }
} catch (e) {
  console.log("BOT LOAD ERROR: " + e.message);
          }
