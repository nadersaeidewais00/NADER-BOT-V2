const http = require('http');
const TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = ['8604068151'];
const API = 'https://api.telegram.org/bot' + TOKEN;

let offset = 0;
let castles = [];

function isAdmin(id){ return ADMIN_IDS.includes(String(id)); }
async function call(m,b){ const r=await fetch(API+'/'+m,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}); return r.json(); }

// ده المهم - الزراير هتظهر جوة الشات مش تحت
function mainInline(uid){
  let kb = [
    [{text:'🏰 المتجر', callback_data:'store'}, {text:'👤 حسابي', callback_data:'account'}],
    [{text:'💬 الدعم', callback_data:'support'}, {text:'💰 المحفظة', callback_data:'wallet'}]
  ];
  if(isAdmin(uid)) kb.push([{text:'👑 لوحة الادمن', callback_data:'admin'}]);
  return {inline_keyboard: kb};
}

function storeInline(){
  return {inline_keyboard: [[{text:'➕ اضافة اعلان قلعة', web_app:{url:'https://nador-store-bot.onrender.com/form.html'}}],[{text:'👁️ مشاهدة القلاع', callback_data:'view'}],[{text:'🔙 رجوع للرئيسية', callback_data:'home'}]]};
}

const FORM = <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NADER</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>body{margin:0;padding:14px;font-family:Tahoma;background:#0f1c33;color:#fff}input,select{width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #2a3b5a;background:#0a1225;color:#fff}.card{background:rgba(255,255,255,.05);padding:12px;border-radius:14px;margin-bottom:10px}.btn{width:100%;padding:14px;border:none;border-radius:12px;background:#fbbf24;font-weight:900}</style></head><body><h3 style="text-align:center;color:#fbbf24">🏰 NADER STORE</h3><div class="card"><label>اسم البائع *</label><input id="a"><label>رقم التواصل *</label><input id="b"><label>مستوى 1-35 *</label><select id="c"><option value="">اختر</option></select><label>السعر *</label><input id="d"></div><button class="btn" onclick="go()">نشر ✨</button><script>for(let i=1;i<=35;i++){let o=document.createElement('option');o.value=i;o.text='مستوى '+i;c.appendChild(o)}let tg=Telegram.WebApp;tg.ready();tg.expand();function go(){let data={sellerName:a.value,phone:b.value,level:c.value,price:d.value};if(!data.sellerName||!data.phone||!data.level||!data.price){alert('كمل البيانات');return}tg.sendData(JSON.stringify(data));setTimeout(()=>tg.close(),300)}<\/script></body></html>;

async function handle(u){
  if(u.message){
    const chatId = u.message.chat.id;
    const uid = u.message.from.id;
    const text = (u.message.text||'').trim();
    if(text === '/start'){
      // شيل الكيبورد القديم اللي تحت + اظهر الجديد جوة الشات
      await call('sendMessage',{chat_id:chatId,text:'تم ازالة الكيبورد القديم',reply_markup:{remove_keyboard:true}});
      await call('sendMessage',{chat_id:chatId,text:'🏰 مرحبا بك في *NADER STORE* 🏰\n\nاختر من القائمة:',parse_mode:'Markdown',reply_markup:mainInline(uid)});
    }
    if(u.message.web_app_data){
      try{ const d=JSON.parse(u.message.web_app_data.data); d.userId=uid; castles.push(d); await call('sendMessage',{chat_id:chatId,text:'✅ تم نشر قلعة مستوى '+d.level,reply_markup:mainInline(uid)}); }catch{}
    }
  }
  if(u.callback_query){
    const chatId = u.callback_query.message.chat.id;
    const uid = u.callback_query.from.id;
    const data = u.callback_query.data;

    if(data === 'home' || data === 'start'){
      await call('sendMessage',{chat_id:chatId,text:'🏰 *NADER STORE*',parse_mode:'Markdown',reply_markup:mainInline(uid)});
    }
    if(data === 'store'){
      await call('sendMessage',{chat_id:chatId,text:'🏰 المتجر:',reply_markup:storeInline()});
    }
    if(data === 'account'){
      await call('sendMessage',{chat_id:chatId,text:'👤 حسابك\nID: '+uid+'\nاعلاناتك: '+castles.filter(x=>String(x.userId)===String(uid)).length,reply_markup:mainInline(uid)});
      }
    if(data === 'support'){
      await call('sendMessage',{chat_id:chatId,text:'💬 الدعم الفني\n@NADER',reply_markup:mainInline(uid)});
    }
    if(data === 'wallet'){
      await call('sendMessage',{chat_id:chatId,text:'💰 المحفظة\nرصيدك: 0 جنيه',reply_markup:mainInline(uid)});
    }
    if(data === 'admin'){
      if(!isAdmin(uid)){ await call('sendMessage',{chat_id:chatId,text:'❌ مش ادمن'}); }
      else await call('sendMessage',{chat_id:chatId,text:'👑 لوحة الادمن\nالاعلانات: '+castles.length,reply_markup:{inline_keyboard:[[{text:'🗑️ مسح الكل', callback_data:'del'}],[{text:'🔙 رجوع', callback_data:'home'}]]}});
    }
    if(data === 'view'){
      if(castles.length===0) await call('sendMessage',{chat_id:chatId,text:'لا يوجد قلاع حاليا'});
      else { let t='🏰 القلاع:\n'; castles.slice(-10).forEach((x,i)=>{ t+=(i+1)+'- مستوى '+x.level+' | '+x.price+'\n'; }); await call('sendMessage',{chat_id:chatId,text:t}); }
    }
    if(data === 'del' && isAdmin(uid)){ castles=[]; await call('sendMessage',{chat_id:chatId,text:'✅ تم المسح'}); }
    await call('answerCallbackQuery',{callback_query_id:u.callback_query.id}).catch(()=>{});
  }
}

async function loop(){ while(true){ try{ const r=await fetch(API+'/getUpdates?offset='+offset+'&timeout=30'); const j=await r.json(); if(j.ok&&j.result.length){ for(let u of j.result){ offset=u.update_id+1; await handle(u); } } }catch{ await new Promise(x=>setTimeout(x,2000)); } } }

const server = http.createServer((req,res)=>{
  if(req.url==='/'||req.url==='/health'){ res.writeHead(200); res.end('LIVE'); return; }
  if(req.url.includes('form.html')){ res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); res.end(FORM); return; }
  res.writeHead(404); res.end('404');
});
const PORT = process.env.PORT||10000;
server.listen(PORT,()=>{ if(TOKEN) loop(); console.log('LIVE'); }); 
