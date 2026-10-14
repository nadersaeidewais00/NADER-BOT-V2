const http = require('http');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN || '';
const ADMIN_IDS = ['8604068151'];
const API = TOKEN ? 'https://api.telegram.org/bot' + TOKEN : '';

let offset = 0;
let castles = [];

function isAdmin(id){ return ADMIN_IDS.includes(String(id)); }
async function call(m,b){
  if(!TOKEN) return;
  try{
    const r = await fetch(API+'/'+m,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
    return r.json();
  }catch(e){ console.log('call error',e.message); }
}

function mainInline(uid){
  let kb = [
    [{text:'🏰 المتجر', callback_data:'store'}, {text:'👤 حسابي', callback_data:'account'}],
    [{text:'💬 الدعم', callback_data:'support'}, {text:'💰 المحفظة', callback_data:'wallet'}]
  ];
  if(isAdmin(uid)) kb.push([{text:'👑 لوحة الادمن', callback_data:'admin'}]);
  return {inline_keyboard: kb};
}

async function handle(u){
  try{
    if(u.message){
      const chatId=u.message.chat.id; const uid=u.message.from.id; const text=(u.message.text||'').trim();
      if(text==='/start'){
        await call('sendMessage',{chat_id:chatId,text:'جاري التنضيف...',reply_markup:{remove_keyboard:true}});
        await new Promise(r=>setTimeout(r,600));
        await call('sendMessage',{chat_id:chatId,text:'🏰 NADER STORE\nاختر من القائمة:',reply_markup:mainInline(uid)});
      }
      if(u.message.web_app_data){
        const d=JSON.parse(u.message.web_app_data.data); d.userId=uid; d.id=Date.now(); castles.push(d);
        await call('sendMessage',{chat_id:chatId,text:'✅ تم نشر قلعة Lv'+d.level,reply_markup:mainInline(uid)});
      }
    }
    if(u.callback_query){
      const chatId=u.callback_query.message.chat.id; const uid=u.callback_query.from.id; const data=u.callback_query.data;
      if(data==='home') await call('sendMessage',{chat_id:chatId,text:'🏰 NADER STORE',reply_markup:mainInline(uid)});
      if(data==='store') await call('sendMessage',{chat_id:chatId,text:'🏰 المتجر',reply_markup:{inline_keyboard:[[{text:'➕ اضافة اعلان',web_app:{url:'https://nader-bot-v2.onrender.com/form.html'}}],[{text:'👁️ عرض القلاع',callback_data:'view'}],[{text:'🔙 رجوع',callback_data:'home'}]]}});
      if(data==='view'){
        if(castles.length===0) await call('sendMessage',{chat_id:chatId,text:'لا يوجد قلاع'});
        else{ let t='🏰 القلاع:\n'; castles.slice(-10).forEach((c,i)=>{ t+=(i+1)+'- Lv'+c.level+' | '+c.price+'\n'; }); await call('sendMessage',{chat_id:chatId,text:t}); }
      }
      if(data==='account') await call('sendMessage',{chat_id:chatId,text:'👤 ID:'+uid+'\nاعلاناتك:'+castles.filter(c=>String(c.userId)===String(uid)).length,reply_markup:mainInline(uid)});
      if(data==='support') await call('sendMessage',{chat_id:chatId,text:'💬 الدعم @NADER',reply_markup:mainInline(uid)});
      if(data==='wallet') await call('sendMessage',{chat_id:chatId,text:'💰 رصيدك: 0',reply_markup:mainInline(uid)});
      if(data==='admin') await call('sendMessage',{chat_id:chatId,text:'👑 Admin\nالعدد:'+castles.length});
      await call('answerCallbackQuery',{callback_query_id:u.callback_query.id}).catch(()=>{});
    }
  }catch(e){ console.log('handle error',e.message); }
}

async function loop(){ 
  if(!TOKEN){ console.log('NO TOKEN'); return; }
  while(true){ 
    try{
      const r=await fetch(API+'/getUpdates?offset='+offset+'&timeout=25'); 
      const j=await r.json(); 
      if(j.ok&&j.result.length){ for(let u of j.result){ offset=u.update_id+1; await handle(u); } } 
    }catch(e){ await new Promise(r=>setTimeout(r,2000)); } 
  } 
}

const server=http.createServer((req,res)=>{
  if(req.url==='/'||req.url==='/health'){ res.writeHead(200); res.end('LIVE'); return; }
  if(req.url.includes('form.html')){
    try{
      const fp=path.join(__dirname,'form.html');
      if(fs.existsSync(fp)){ const html=fs.readFileSync(fp,'utf8'); res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); res.end(html); return; }
      res.writeHead(200,{'Content-Type':'text/html'}); res.end('<h3>form.html not found - ارفعه</h3>'); return;
    }catch(e){ res.writeHead(200); res.end('error'); return; }
  }
  res.writeHead(404); res.end('404');
});

const PORT=process.env.PORT||10000;
server.listen(PORT,()=>{ console.log('LIVE on '+PORT); if(TOKEN) loop(); else console.log('SET BOT_TOKEN in Render Environment'); });
