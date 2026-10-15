const http = require('http');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const API = https://api.telegram.org/bot${BOT_TOKEN};
const STORE_URL = https://${process.env.RENDER_EXTERNAL_HOSTNAME}/form.html;

let offset = 0;

function isAdmin(id) { return String(id) == String(ADMIN_ID); }

async function call(method, body) {
  const res = await fetch(${API}/${method}, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

function mainMenu(isAdminUser = false) {
  const kb = [
    [{ text: "المتجر", callback_data: "store" }, { text: "حسابي", callback_data: "account" }],
    [{ text: "الدعم", callback_data: "support" }, { text: "المحفظة", callback_data: "wallet" }],
    [{ text: "لوحة الادمن", callback_data: "admin" }]
  ];
  // لو مش ادمن شيل زرار الادمن
  if (!isAdminUser) kb.pop();
  return { inline_keyboard: kb };
}

function storeKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "افتح المتجر", web_app: { url: STORE_URL } }],
      [{ text: "رجوع", callback_data: "home" }]
    ]
  };
}

async function handleUpdate(u) {
  if (u.message) {
    const chatId = u.message.chat.id;
    const fromId = u.message.from.id;
    const text = (u.message.text || "").trim();

    if (text == "/start") {
      await call('sendMessage', {
        chat_id: chatId,
        text: مرحبا ${u.message.from.first_name} في NADER STORE\nاختر من القائمة:,
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: mainMenu(isAdmin(fromId)).inline_keyboard
        }
      });
    }
  }

  if (u.callback_query) {
    const q = u.callback_query;
    const chatId = q.message.chat.id;
    const data = q.data;
    const fromId = q.from.id;

    if (data == "store") {
      await call('sendMessage', {
        chat_id: chatId,
        text: "افتح المتجر من هنا:",
        reply_markup: storeKeyboard()
      });
    }
    if (data == "home") {
      await call('sendMessage', {
        chat_id: chatId,
        text: "القائمة الرئيسية:",
        reply_markup: mainMenu(isAdmin(fromId))
      });
    }
    if (data == "account") {
      await call('sendMessage', { chat_id: chatId, text: "حسابك: " + fromId, reply_markup: mainMenu(isAdmin(fromId)) });
    }
    if (data == "support") {
      await call('sendMessage', { chat_id: chatId, text: "الدعم: @nader", reply_markup: mainMenu(isAdmin(fromId)) });
    }
    if (data == "wallet") {
      await call('sendMessage', { chat_id: chatId, text: "محفظتك: 0 جنيه", reply_markup: mainMenu(isAdmin(fromId)) });
    }
    if (data == "admin" && isAdmin(fromId)) {
      await call('sendMessage', { chat_id: chatId, text: "لوحة الادمن", reply_markup: mainMenu(true) });
    }

    await call('answerCallbackQuery', { callback_query_id: q.id });
  }

  // WebApp data
  if (u.message && u.message.web_app_data) {
    const chatId = u.message.chat.id;
    await call('sendMessage', { chat_id: chatId, text: "تم استلام طلبك: " + u.message.web_app_data.data });
  }
}

async function polling() {
  console.log("BOT STARTED");
  while (true) {
    try {
      const res = await call('getUpdates', { offset, timeout: 30 });
      if (res.result) {
        for (const up of res.result) {
          await handleUpdate(up);
          offset = up.update_id + 1;
        }
      }
    } catch (e) {
      console.log(e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// سيرفر لـ Render
const server = http.createServer((req, res) => {
  if (req.url.includes("form.html")) {
    const p = path.join(__dirname, "form.html");
    if (fs.existsSync(p)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(fs.readFileSync(p));
    }
  }
  res.writeHead(200); res.end("Bot Running");
});
server.listen(process.env.PORT || 10000, () => polling());
