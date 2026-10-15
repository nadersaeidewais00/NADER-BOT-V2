const http = require('http');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const API = "https://api.telegram.org/bot" + TOKEN;
const STORE_URL = "https://" + process.env.RENDER_EXTERNAL_HOSTNAME + "/form.html";

let offset = 0;

function isAdmin(id) { return String(id) === String(ADMIN_ID); }

async function call(method, body) {
  const res = await fetch(API + "/" + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

function mainMenu(isAdminUser) {
  const kb = [
    [{ text: "🏰 المتجر", callback_data: "store" }, { text: "👤 حسابي", callback_data: "account" }],
    [{ text: "💬 الدعم", callback_data: "support" }, { text: "💰 المحفظة", callback_data: "wallet" }]
  ];
  if (isAdminUser) kb.push([{ text: "⚙️ لوحة الادمن", callback_data: "admin" }]);
  return { inline_keyboard: kb };
}

async function handleUpdate(u) {
  if (u.message) {
    const chatId = u.message.chat.id;
    const fromId = u.message.from.id;
    const text = (u.message.text || "").trim();

    if (text === "/start") {
      const welcome = "🏰 مرحبا بك في NADER STORE 🏰\n\n"
        + "أفضل متجر لبيع وشراء قلاع Rise of Kingdoms\n\n"
        + "✅ بيع آمن ومضمون\n"
        + "✅ وسيط مضمون\n"
        + "✅ أسعار منافسة\n\n"
        + "اختر من القائمة بالأسفل للبدء 👇";

      await call('sendMessage', {
        chat_id: chatId,
        text: welcome,
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: mainMenu(isAdmin(fromId)).inline_keyboard
        }
      });
    }

    if (u.message.web_app_data) {
      await call('sendMessage', {
        chat_id: chatId,
        text: "✅ تم استلام اعلانك بنجاح!\nسيتم مراجعته ونشره قريبا.\nالبيانات: " + u.message.web_app_data.data
      });
    }
  }

  if (u.callback_query) {
    const q = u.callback_query;
    const chatId = q.message.chat.id;
    const fromId = q.from.id;
    const data = q.data;

    if (data === "home") {
      await call('sendMessage', { chat_id: chatId, text: "القائمة الرئيسية:", reply_markup: mainMenu(isAdmin(fromId)) });
    }

    if (data === "store") {
      await call('sendMessage', {
        chat_id: chatId,
        text: "🏰 اضغط بالأسفل لفتح المتجر:",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 افتح المتجر الآن", web_app: { url: STORE_URL } }],
            [{ text: "🔙 رجوع", callback_data: "home" }]
          ]
        }
      });
    }

    if (data === "account") {
      const txt = "👤 حسابك\n\n"
        + "🆔 الايدي: " + fromId + "\n"
        + "📦 اعلاناتك: 0\n"
        + "⭐ تقييمك: 5.0";
      await call('sendMessage', { chat_id: chatId, text: txt, reply_markup: mainMenu(isAdmin(fromId)) });
    }

    if (data === "support") {
      const txt = "💬 الدعم الفني\n\n"
        + "لو عندك اي مشكلة تواصل معنا:\n"
        + "@nadersaeidewais00\n\n"
        + "الرد خلال دقائق";
      await call('sendMessage', { chat_id: chatId, text: txt, reply_markup: mainMenu(isAdmin(fromId)) });
    }

    if (data === "wallet") {
      const txt = "💰 محفظتك\n\n"
        + "الرصيد الحالي: 0 جنيه\n"
        + "يمكنك شحن الرصيد عن طريق الدعم";
      await call('sendMessage', { chat_id: chatId, text: txt, reply_markup: mainMenu(isAdmin(fromId)) });
    }

    if (data === "admin" && isAdmin(fromId)) {
      await call('sendMessage', { chat_id: chatId, text: "⚙️ لوحة الادمن جاهزة", reply_markup: mainMenu(true) });
    }

    await call('answerCallbackQuery', { callback_query_id: q.id });
  }
}

async function polling() {
  while (true) {
    try {
      const r = await call('getUpdates', { offset: offset, timeout: 25 });
      if (r.result) {
        for (const up of r.result) {
          await handleUpdate(up);
          offset = up.update_id + 1;
        }
      }
    } catch (e) {
      await new Promise(x => setTimeout(x, 2000));
    }
  }
              }
const server = http.createServer((req, res) => {
  if (req.url.includes("form.html")) {
    const p = path.join(__dirname, "form.html");
    if (fs.existsSync(p)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(p));
    }
  }
  res.writeHead(200); res.end("RUNNING");
});

server.listen(process.env.PORT || 10000, () => polling());
