const http = require('http');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = '8604068151';
const API = 'https://api.telegram.org/bot' + TOKEN;

let offset = 0;
let castles = [];

function isAdmin(id){ return String(id) === ADMIN_ID; }

async function call(method, body){
  if(!TOKEN) return;
  const r = await fetch(API + '/' + method, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  return r.json();
}

function mainKb(uid){
  const kb = [
    [{text:'🏰 المتجر', callback_data:'store'}, {text:'👤 حسابي', callback_data:'account'}],
    [{text:'💬 الدعم', callback_data:'support'}, {text:'💰 المحفظة', callback_data:'wallet'}]
  ];
  if(isAdmin(uid)) kb.push([{text:'👑 لوحة الادمن', callback_data:'admin'}]);
  return {inline_keyboard: kb};
}

function storeKb(){
  // ده لينك الفورم بتاعك - غير اسم nador-store-bot لو اسم السيرفس عندك مختلف
  const webAppUrl = 'https://' + (process.env.RENDER_EXTERNAL_HOSTNAME || 'nader-bot-v2.onrender.com') + '/form.html';
  return {inline_keyboard:[
    [{text:'➕ اضافة اعلان قلعة', web_app:{url: webAppUrl}}],
    [{text:'👁️ مشاهدة القلاع', callback_data:'view'}],
    [{text:'🔙 رجوع', callback_data:'home'}]
  ]};
}

async function handleUpdate(u){
  try{
    if(u.message){
      const chatId = u.message.chat.id;
      const uid = u.message.from.id;
      const text = (u.message.text || '').trim();

      if(text === '/start'){
        // ده اهم سطر - بيشيل الكيبورد الرمادي نهائي
        await call('sendMessage', {chat_id: chatId, text: 'جاري تنظيف الواجهة...', reply_markup:{remove_keyboard:true}});
        await new Promise(r=>setTimeout(r,700));
        await call('sendMessage', {chat_id: chatId, text: '🏰 مرحبا في NADER STORE\nالمتجر الرسمي لبيع القلاع', reply_markup: mainKb(uid)});
      }

      if(u.message.web_app_data){
        try{
          const d = JSON.parse(u.message.web_app_data.data);
          d.userId = uid;
          d.id = Date.now();
          d.userName = u.message.from.first_name || '';
          castles.push(d);
          await call('sendMessage', {chat_id: chatId, text: ✅ تم نشر قلعة\n⚔️ Lv${d.level} - ${d.hero}\n💰 ${d.price}\n🔥 قوة ${d.power}, reply_markup: mainKb(uid)});
          if(!isAdmin(uid)){
            await call('sendMessage', {chat_id: ADMIN_ID, text: 🔔 اعلان جديد من ${d.userName}\nLv${d.level} - ${d.hero}});
          }
        }catch(e){}
      }
    }

    if(u.callback_query){
      const q = u.callback_query;
      const chatId = q.message.chat.id;
      const uid = q.from.id;
      const data = q.data;

      if(data === 'home') await call('sendMessage', {chat_id: chatId, text:'🏰 NADER STORE', reply_markup: mainKb(uid)});
      if(data === 'store') await call('sendMessage', {chat_id: chatId, text:'🏰 المتجر - اختار:', reply_markup: storeKb()});
      if(data === 'account'){
        const my = castles.filter(c=>String(c.userId)===String(uid));
        await call('sendMessage', {chat_id: chatId, text:👤 حسابك\nID: ${uid}\nعدد اعلاناتك: ${my.length}, reply_markup: mainKb(uid)});
      }
      if(data === 'support') await call('sendMessage', {chat_id: chatId, text:'💬 الدعم: @NADER\nتواصل معنا', reply_markup: mainKb(uid)});
      if(data === 'wallet') await call('sendMessage', {chat_id: chatId, text:'💰 المحفظة\nرصيدك الحالي: 0 جنيه', reply_markup: mainKb(uid)});
      if(data === 'view'){
        if(castles.length===0) await call('sendMessage', {chat_id: chatId, text:'لا يوجد قلاع حاليا', reply_markup: storeKb()});
        else {
          let t='🏰 اخر القلاع:\n\n';
          castles.slice(-10).reverse().forEach((c,i)=>{ t+=${i+1}- Lv${c.level} | ${c.hero} | ${c.price} | قوة ${c.power}\n; });
          await call('sendMessage', {chat_id: chatId, text:t, reply_markup: storeKb()});
          }
      }
      if(data === 'admin' && isAdmin(uid)){
        await call('sendMessage', {chat_id: chatId, text:👑 لوحة الادمن\nاجمالي الاعلانات: ${castles.length}, reply_markup: mainKb(uid)});
      }
      await call('answerCallbackQuery', {callback_query_id: q.id}).catch(()=>{});
    }
  }catch(e){ console.log('handle error', e.message); }
}

async function polling(){
  console.log('BOT LOOP START');
  while(true){
    try{
      if(!TOKEN){ console.log('NO BOT_TOKEN - حط التوكن في Environment'); await new Promise(r=>setTimeout(r,10000)); continue; }
      const r = await fetch(API + '/getUpdates?offset='+offset+'&timeout=30');
      const j = await r.json();
      if(j.ok && j.result && j.result.length){ for(let u of j.result){ offset = u.update_id + 1; await handleUpdate(u); } }
    }catch(e){ await new Promise(r=>setTimeout(r,3000)); }
  }
}

// Web Server عشان Render
const server = http.createServer((req,res)=>{
  if(req.url==='/' || req.url==='/health'){ res.writeHead(200); res.end('LIVE - NADER BOT V2'); return; }
  if(req.url.includes('form.html')){
    try{
      const fp = path.join(__dirname, 'form.html');
      if(fs.existsSync(fp)){
        const html = fs.readFileSync(fp,'utf8');
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}); res.end(html); return;
      } else { res.writeHead(404); res.end('form.html not found - اعمل الملف'); return; }
    }catch{ res.writeHead(500); res.end('error'); return; }
  }
  res.writeHead(404); res.end('404');
});

server.listen(process.env.PORT  10000, ()=>{ console.log('LIVE on', process.env.PORT10000); polling(); }); 
