const http = require("http");
const { Telegraf, Markup } = require("telegraf");
http.createServer((_,res)=>{res.writeHead(200);res.end("LIVE");}).listen(process.env.PORT||10000,"0.0.0.0");
const bot = new Telegraf(process.env.BOT_TOKEN);
const kb = Markup.keyboard([["الـمـتـجـر 🏰"],["حـسـابـي 👤","الـمـحـفـظـة 💰"],["الـدعـم 🛎"]]).resize();
bot.start((ctx)=>ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إختر الخدمه التي تريدها من الأزرار",kb));
bot.launch();
