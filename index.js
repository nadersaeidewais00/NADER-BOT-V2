const http = require('http');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const API = https://api.telegram.org/bot${TOKEN};
const STORE_URL = https://${process.env.RENDER_EXTERNAL_HOSTNAME}/form.html;

let offset = 0;

function isAdmin(id) {
  return String(id) === String(ADMIN_ID);
}

async function call(method, body) {
  const res = await fetch(${API}/${method}, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const j = await res.json();
  return j;
}

function mainMenu(isAdminUser) {
  const kb = [
    [{ text: "المتجر", callback_data: "store" }, { text: "حسابي", callback_data: "account" }],
    [{ text: "الدعم", callback_data: "support" }, { text: "المحفظة", callback_data: "wallet" }]
  ];
  if (isAdminUser) {
    kb.push([{ text: "لوحة الادمن", callback_data: "admin" }]);
  }
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
  try {
    if (u.message) {
      const chatId = u.message.chat.id;
      const fromId = u.message.from.id;
      const text = (u.message.text || "").trim();

      if (text === "/start") {
        await call('sendMessage', {
          chat_id: chatId,
          text: مرحبا ${u.message.from.first_name || ''} في NADER STORE\nاختار من القائمة تحت:,
          reply_markup: {
            remove_keyboard: true,
            inline_keyboard: mainMenu(isAdmin(fromId)).inline_keyboard
          }
        });
      }

      if (u.message.web_app_data) {
        const data = u.message.web_app_data.data;
        await call('sendMessage', {
          chat_id: chatId,
          text: تم استلام طلبك: ${data}
        });
      }
    }

    if (u.callback_query) {
      const q = u.callback_query;
      const chatId = q.message.chat.id;
      const fromId = q.from.id;
      const data = q.data;

      if (data === "home" || data === "start") {
        await call('sendMessage', {
          chat_id: chatId,
          text: "القائمة الرئيسية:",
          reply_markup: mainMenu(isAdmin(fromId))
        });
      }

      if (data === "store") {
        await call('sendMessage', {
          chat_id: chatId,
          text: "اضغط لفتح المتجر:",
          reply_markup: storeKeyboard()
        });
      }

      if (data === "account") {
        await call('sendMessage', {
          chat_id: chatId,
          text: حسابك\nالايدي: ${fromId},
          reply_markup: mainMenu(isAdmin(fromId))
        });
      }

      if (data === "support") {
        await call('sendMessage', {
          chat_id: chatId,
          text: "الدعم: @NADER_STORE",
          reply_markup: mainMenu(isAdmin(fromId))
        });
      }

      if (data === "wallet") {
        await call('sendMessage', {
          chat_id: chatId,
          text: "محفظتك: 0 جنيه",
          reply_markup: mainMenu(isAdmin(fromId))
        });
      }

      if (data === "admin") {
        if (isAdmin(fromId)) {
          await call('sendMessage', {
            chat_id: chatId,
            text: "لوحة تحكم الادمن",
            reply_markup: mainMenu(true)
          });
        }
      }

      await call('answerCallbackQuery', { callback_query_id: q.id });
    }
  } catch (e) {
    console.log("handle error:", e.message);
  }
}

async function polling() {
  console.log("BOT STARTED POLLING");
  while (true) {
    try {
      const r = await call('getUpdates', { offset: offset, timeout: 25 });
      if (r.result && r.result.length > 0) {
        for (const up of r.result) {
          await handleUpdate(up);
          offset = up.update_id + 1;
        }
      }
    } catch (e) {
      console.log("polling error", e.message);
      await new Promise(res => setTimeout(res, 3000));
    }
  }
        }
const server = http.createServer((req, res) => {
  if (req.url.includes("form.html")) {
    try {
      const p = path.join(__dirname, "form.html");
      if (fs.existsSync(p)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {}
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("NADER BOT RUNNING");
});

server.listen(process.env.PORT || 10000, () => {
  polling();
});
