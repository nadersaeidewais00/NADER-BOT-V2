const http = require('http');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_IDS || '8995400909').split(',').map(s=>s.trim());
const API = 'https://api.telegram.org/bot' + TOKEN;

let offset = 0;
let castles = [];

function isAdmin(id){ return ADMIN_IDS.includes(String(id)); }

async function call(method, body){
  const res = await fetch(API + '/' + method, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  return res.json();
}

function mainKbd(uid){
  let kb = [
    [{text:'🏰 المتجر'}, {text:'👤 حسابي'}],
    [{text:'💬 الدعم'}, {text:'💰 المحفظة'}]
  ];
  if(isAdmin(uid)) kb.push([{text:'👑 لوحة الادمن'}]);
  return {keyboard: kb, resize_keyboard:true, is_persistent:true};
}

function storeInline(){
  const WEBAPP_URL = 'https://nador-store-bot.onrender.com/form.html';
  return {
    inline_keyboard: [
      [{text:'➕ اضافة اعلان قلعة', web_app:{url: WEBAPP_URL}}],
      [{text:'👁️ مشاهدة القلاع', callback_data:'view_castles'}],
      [{text:'🔙 رجوع', callback_data:'back_main'}]
    ]
  };
}

async function onUpdate(u){
  if(u.message){
    const chatId = u.message.chat.id;
    const uid = u.message.from.id;
    const text = (u.message.text||'').trim();

    if(text === '/start'){
      await call('sendMessage', {chat_id: chatId, text:'مرحبا بك في NADER STORE 🏰\nاختر الخدمة من الازرار:', reply_markup: mainKbd(uid)});
    }
    else if(text === '🏰 المتجر'){
      await call('sendMessage', {chat_id: chatId, text:'🏰 المتجر - اختار:', reply_markup: storeInline()});
    }
    else if(text === '👤 حسابي'){
      const my = castles.filter(c=>String(c.userId)===String(uid)).length;
      await call('sendMessage', {chat_id: chatId, text:'👤 حسابك\n\nID: '+uid+'\nاعلاناتك: '+my+'\n\nانت مسجل كـ '+(isAdmin(uid)?'ادمن 👑':'عميل')});
    }
    else if(text === '💬 الدعم'){
      await call('sendMessage', {chat_id: chatId, text:'💬 الدعم الفني\nتواصل مع الادمن: @nador\nالرد خلال دقائق'});
    }
    else if(text === '💰 المحفظة'){
      await call('sendMessage', {chat_id: chatId, text:'💰 المحفظة\nرصيدك: 0 جنيه\nالايداع فودافون كاش قريبا'});
    }
    else if(text === '👑 لوحة الادمن' && isAdmin(uid)){
      await call('sendMessage', {chat_id: chatId, text:'👑 لوحة الادمن - اهلا يا نادر', reply_markup:{inline_keyboard:[[{text:'📋 عدد الاعلانات: '+castles.length, callback_data:'admin_count'}],[{text:'🗑️ مسح كل الاعلانات', callback_data:'admin_del'}]]}});
    }
    else if(u.message.web_app_data){
      try{
        const d = JSON.parse(u.message.web_app_data.data);
        d.userId = uid; d.id = Date.now();
        castles.push(d);
        await call('sendMessage', {chat_id: chatId, text:'✅ تم نشر قلعتك\nمستوى: '+d.level+' | السعر: '+d.price+'\nظهرت الان في مشاهدة القلاع'});
      }catch(e){ await call('sendMessage', {chat_id: chatId, text:'خطأ في البيانات'}); }
    }
  }

  if(u.callback_query){
    const chatId = u.callback_query.message.chat.id;
    const uid = u.callback_query.from.id;
    const data = u.callback_query.data;

    if(data === 'view_castles'){
      if(castles.length===0) await call('sendMessage', {chat_id: chatId, text:'لا يوجد قلاع حاليا - كن اول من يضيف!'});
      else{
        let t='🏰 القلاع المتاحة ('+castles.length+'):\n\n';
        castles.slice(-15).reverse().forEach((c,i)=>{ t+=(i+1)+'- مستوى '+c.level+' | '+c.price+'ج | '+c.sellerName+'\n'; });
        await call('sendMessage', {chat_id: chatId, text:t});
      }
    }
    if(data === 'back_main'){
      await call('sendMessage', {chat_id: chatId, text:'الرئيسية:', reply_markup: mainKbd(uid)});
    }
    if(data === 'admin_count' && isAdmin(uid)){
      await call('sendMessage', {chat_id: chatId, text:'الاعلانات الكلية: '+castles.length});
    }
    if(data === 'admin_del' && isAdmin(uid)){
      castles=[]; await call('sendMessage', {chat_id: chatId, text:'تم مسح كل الاعلانات ✅'});
    }
    await call('answerCallbackQuery', {callback_query_id: u.callback_query.id}).catch(()=>{});
  }
               }
async function polling(){
  while(true){
    try{
      const r = await fetch(API + '/getUpdates?offset=' + offset + '&timeout=30');
      const j = await r.json();
      if(j.ok && j.result.length){ for(let u of j.result){ offset = u.update_id+1; await onUpdate(u); } }
    }catch(e){ await new Promise(r=>setTimeout(r,2000)); }
  }
}

const server = http.createServer((req,res)=>{
  if(req.url === '/' || req.url === '/health'){ res.writeHead(200); res.end('LIVE'); return; }
  if(req.url.includes('form.html')){
    try{
      const html = fs.readFileSync(path.join(__dirname,'form.html'), 'utf8');
      res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
      res.end(html);
      return;
    }catch(e){
      res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
      res.end('form.html not found - ارفع الملف جنب index.js');
      return;
    }
  }
  res.writeHead(404); res.end('404');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, ()=>{ console.log('LIVE '+PORT); if(TOKEN) polling(); });
