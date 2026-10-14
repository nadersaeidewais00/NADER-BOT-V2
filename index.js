const http = require('http');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_IDS || '89954009').split(',').map(s=>s.trim());

const API = 'https://api.telegram.org/bot' + TOKEN;
let offset = 0;
let castles = [];

function isAdmin(id){ return ADMIN_IDS.includes(String(id)); }

async function api(method, body){
  const r = await fetch(API + '/' + method, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  return r.json();
}

function mainKbd(uid){
  const base = [[{text:'🏰 المتجر'},{text:'👤 حسابي'}],[{text:'💬 الدعم'},{text:'💰 المحفظة'}]];
  if(isAdmin(uid)) base.push([{text:'👑 لوحة الادمن'}]);
  return {keyboard:base, resize_keyboard:true};
}
function storeKbd(){
  return {inline_keyboard:[[{text:'➕ اضافة اعلان قلعة', web_app:{url:'https://nador-store-bot.onrender.com/form.html'}}],[{text:'👁️ مشاهدة القلاع', callback_data:'view'}],[{text:'🔙 رجوع', callback_data:'back'}]]};
}
function adminKbd(){
  return {inline_keyboard:[[{text:'📋 كل الاعلانات', callback_data:'admin_all'}],[{text:'❌ مسح الكل', callback_data:'admin_del'}],[{text:'🔙 رجوع', callback_data:'back'}]]};
}

async function handle(u){
  if(u.message){
    const chatId = u.message.chat.id;
    const text = u.message.text || '';
    const uid = u.message.from.id;
    if(text === '/start'){
      await api('sendMessage',{chat_id:chatId, text:'مرحبا بك في NADER STORE 🏰\nاختر الخدمة من الازرار:', reply_markup: mainKbd(uid)});
    } else if(text === '🏰 المتجر'){
      await api('sendMessage',{chat_id:chatId, text:'🛒 المتجر:', reply_markup: storeKbd()});
    } else if(text === '👤 حسابي'){
      await api('sendMessage',{chat_id:chatId, text:'👤 حسابك\nID: ' + uid + '\nاعلاناتك: ' + castles.filter(c=>String(c.userId)===String(uid)).length});
    } else if(text === '💬 الدعم'){
      await api('sendMessage',{chat_id:chatId, text:'💬 للدعم: @NADER'});
    } else if(text === '💰 المحفظة'){
      await api('sendMessage',{chat_id:chatId, text:'💰 المحفظة: 0 جنيه - قريبا'});
    } else if(text === '👑 لوحة الادمن' && isAdmin(uid)){
      await api('sendMessage',{chat_id:chatId, text:'👑 لوحة الادمن - اهلا يا ادمن', reply_markup: adminKbd()});
    } else if(u.message.web_app_data){
      try{
        const d = JSON.parse(u.message.web_app_data.data);
        d.userId = uid; d.id = Date.now();
        castles.push(d);
        await api('sendMessage',{chat_id:chatId, text:'✅ تم نشر قلعة مستوى ' + d.level + ' بسعر ' + d.price});
      }catch(e){ await api('sendMessage',{chat_id:chatId, text:'❌ خطأ'}); }
    }
  }
  if(u.callback_query){
    const chatId = u.callback_query.message.chat.id;
    const data = u.callback_query.data;
    const uid = u.callback_query.from.id;
    if(data === 'view'){
      if(castles.length===0) await api('sendMessage',{chat_id:chatId, text:'لا يوجد قلاع حاليا'});
      else { let t='🏰 القلاع:\n'; castles.slice(-10).forEach((c,i)=>{ t+=(i+1)+'- مستوى '+c.level+' - '+c.price+' - '+c.sellerName+'\n'; }); await api('sendMessage',{chat_id:chatId, text:t}); }
    }
    if(data === 'back'){ await api('sendMessage',{chat_id:chatId, text:'الرئيسية:', reply_markup: mainKbd(uid)}); }
    if(data === 'admin_all' && isAdmin(uid)){ await api('sendMessage',{chat_id:chatId, text:'العدد: '+castles.length}); }
    if(data === 'admin_del' && isAdmin(uid)){ castles=[]; await api('sendMessage',{chat_id:chatId, text:'تم المسح'}); }
    await api('answerCallbackQuery',{callback_query_id:u.callback_query.id}).catch(()=>{});
  }
}

async function polling(){
  while(true){
    try{
      const res = await fetch(API + '/getUpdates?offset=' + offset + '&timeout=30');
      const j = await res.json();
      if(j.ok && j.result.length){ for(let u of j.result){ offset = u.update_id+1; await handle(u); } }
    }catch(e){ await new Promise(r=>setTimeout(r,2000)); }
  }
                  }
const server = http.createServer((req,res)=>{
  if(req.url === '/' || req.url === '/health'){ res.writeHead(200); res.end('LIVE'); return; }
  if(req.url.includes('form.html')){
    try{ const f=fs.readFileSync(path.join(__dirname,'form.html')); res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); res.end(f); }
    catch{ res.writeHead(404); res.end('no form'); }
    return;
  }
  res.writeHead(404); res.end('404');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, ()=>{ console.log('LIVE '+PORT); if(TOKEN) polling(); });
