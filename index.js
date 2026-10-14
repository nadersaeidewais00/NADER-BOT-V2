const http = require('http');
const TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_IDS || '8604068151').split(',').map(s=>String(s).trim());
const API = 'https://api.telegram.org/bot' + TOKEN;

let offset = 0;
let castles = [];

function isAdmin(id){ return ADMIN_IDS.includes(String(id)); }
async function call(m,b){ const r=await fetch(API+'/'+m,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}); return r.json(); }

function mainKbd(uid){
  let kb=[[{text:'🏰 المتجر'},{text:'👤 حسابي'}],[{text:'💬 الدعم'},{text:'💰 المحفظة'}]];
  if(isAdmin(uid)) kb.push([{text:'👑 لوحة الادمن'}]);
  return {keyboard:kb,resize_keyboard:true};
}
function storeInline(){
  return {inline_keyboard:[[{text:'➕ اضافة اعلان قلعة',web_app:{url:'https://nador-store-bot.onrender.com/form.html'}}],[{text:'👁️ مشاهدة القلاع',callback_data:'view'}]]};
}

const FORM_HTML = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NADER STORE</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>*{box-sizing:border-box}body{margin:0;padding:14px;font-family:Tahoma;background:radial-gradient(900px 500px at 50% -10%,#1e3a5f,#0a1120);color:#e2e8f0}.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:14px;margin-bottom:12px}.title{font-weight:900;font-size:13px;margin-bottom:10px;color:#f1f5f9}label{font-size:11px;color:#94a3b8;display:block;margin:10px 0 5px}input,select{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);background:#0a1225;color:#fff}.row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.hero-bar{background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.2);color:#fde68a;padding:9px 12px;border-radius:10px;font-weight:900;font-size:12px;margin:16px 0 8px;display:flex;justify-content:space-between}.hero-row{display:grid;grid-template-columns:1fr 105px;gap:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:9px;margin-bottom:6px;align-items:center}.btn{width:100%;padding:15px;border:none;border-radius:14px;background:linear-gradient(90deg,#fbbf24,#f59e0b);font-weight:900;font-size:16px}</style></head><body><div style="text-align:center;padding:10px 0"><h2 style="margin:0;color:#fbbf24">🏰 NADER STORE</h2><small style="color:#7c8aa0">تصميم هادئ ومريح</small></div><div class="card"><div class="title">بيانات البائع</div><label>اسم البائع *</label><input id="sellerName"><label>رقم التواصل *</label><input id="phone"></div><div class="card"><div class="title">مستوى القلعة والسعر</div><label>مستوى 1-35 *</label><select id="levelSelect"><option value="">-- اختر --</option></select><label>السعر *</label><input id="price"></div><div class="card"><div class="title">قوة القلعة</div><div class="row2"><div><label>تصفير</label><input id="tasfir"></div><div><label>تعويض</label><input id="taweed"></div><div><label>علوم</label><input id="oloum"></div><div><label>جنود</label><input id="jonoud"></div><div><label>شارات المجد</label><input id="majd"></div><div><label>اشعال</label><input id="ishal"></div></div></div><div class="card"><div class="title">العتاد</div><div class="row2"><div><label>اخضر</label><input id="at_green"></div><div><label>ازرق</label><input id="at_blue"></div><div><label>بنفسجي</label><input id="at_purple"></div><div><label>ذهبي</label><input id="at_gold"></div></div></div><div class="card"><div class="title">الراية</div><div class="row2"><div><label>حيوية مشاة %</label><input id="hay_mosah"></div><div><label>حيوية عجلات %</label><input id="hay_ajalat"></div></div></div><div class="card"><div class="title">الابطال 1-10</div><div class="hero-bar"><span>المشاة</span></div><div class="hero-row"><span>محمد الثاني</span><select id="m1"></select></div><div class="hero-row"><span>عمر المختار</span><select id="m2"></select></div><div class="hero-bar"><span>الفرسان 6</span></div><div class="hero-row"><span>جوهر الصقلي</span><select
id="f1"></select></div><div class="hero-row"><span>بارون</span><select id="f2"></select></div><div class="hero-row"><span>اسكندر</span><select id="f3"></select></div><div class="hero-row"><span>بوراك</span><select id="f4"></select></div><div class="hero-row"><span>عبدالرحمن</span><select id="f5"></select></div><div class="hero-row"><span>هارون</span><select id="f6"></select></div><div class="hero-bar"><span>الرماة 7</span></div><div class="hero-row"><span>حليمة</span><select id="r1"></select></div><div class="hero-row"><span>زرقاء اليمامة</span><select id="r2"></select></div><div class="hero-row"><span>اتيلا الهون</span><select id="r3"></select></div><div class="hero-row"><span>قوسين</span><select id="r4"></select></div><div class="hero-row"><span>اورخان</span><select id="r5"></select></div><div class="hero-row"><span>قايتباي</span><select id="r6"></select></div><div class="hero-row"><span>خير الدين</span><select id="r7"></select></div><div class="hero-bar"><span>العجلات 6</span></div><div class="hero-row"><span>صلاح الدين</span><select id="c1"></select></div><div class="hero-row"><span>قطز</span><select id="c2"></select></div><div class="hero-row"><span>برقوق</span><select id="c3"></select></div><div class="hero-row"><span>ملك ابن الرايب</span><select id="c4"></select></div><div class="hero-row"><span>كافور</span><select id="c5"></select></div><div class="hero-row"><span>نفرتيتي</span><select id="c6"></select></div></div><button class="btn" onclick="sendData()">نشر الاعلان ✨</button><script>(function(){var l=document.getElementById('levelSelect');for(var i=1;i<=35;i++){var o=document.createElement('option');o.value=i;o.textContent='مستوى '+i;l.appendChild(o);}var ids=['m1','m2','f1','f2','f3','f4','f5','f6','r1','r2','r3','r4','r5','r6','r7','c1','c2','c3','c4','c5','c6'];ids.forEach(function(id){var s=document.getElementById(id);var d=document.createElement('option');d.value='';d.textContent='☆ النجوم';s.appendChild(d);for(var n=1;n<=10;n++){var op=document.createElement('option');op.value=n;op.textContent=n+' ★';s.appendChild(op);}});})();var tg=window.Telegram.WebApp;tg.ready();tg.expand();function gv(id){return document.getElementById(id).value.trim();}function sendData(){var d={sellerName:gv('sellerName'),phone:gv('phone'),level:gv('levelSelect'),price:gv('price')};if(!d.sellerName!d.phone!d.level||!d.price){alert('اكمل البيانات');return;}tg.sendData(JSON.stringify(d));setTimeout(function(){tg.close();},300);}<\/script></body></html>`;

async function onUpdate(u){
  if(u.message){
    const chatId=u.message.chat.id; const uid=u.message.from.id; const text=(u.message.text||'').trim();
    if(text==='/start'){ await call('sendMessage',{chat_id:chatId,text:'مرحبا بك في NADER STORE 🏰',reply_markup:mainKbd(uid)}); }
    else if(text==='🏰 المتجر'){ await call('sendMessage',{chat_id:chatId,text:'🏰 المتجر:',reply_markup:storeInline()}); }
    else if(text==='👤 حسابي'){ await call('sendMessage',{chat_id:chatId,text:'👤 حسابك\nID: '+uid+'\nاعلاناتك: '+castles.filter(c=>String(c.userId)===String(uid)).length}); }
    else if(text==='💬 الدعم'){ await call('sendMessage',{chat_id:chatId,text:'💬 الدعم: @NADER'}); }
    else if(text==='💰 المحفظة'){ await call('sendMessage',{chat_id:chatId,text:'💰 المحفظة\nرصيدك: 0 جنيه'}); }
    else if(text==='👑 لوحة الادمن' && isAdmin(uid)){ await call('sendMessage',{chat_id:chatId,text:'👑 لوحة الادمن\nالاعلانات: '+castles.length,reply_markup:{inline_keyboard:[[{text:'🗑️ مسح الكل',callback_data:'del'}]]}}); }
    else if(u.message.web_app_data){ try{ const d=JSON.parse(u.message.web_app_data.data); d.userId=uid; d.id=Date.now(); castles.push(d); await call('sendMessage',{chat_id:chatId,text:'✅ تم نشر القلعة مستوى '+d.level}); }catch{} }
  }
  if(u.callback_query){
    const chatId=u.callback_query.message.chat.id; const uid=u.callback_query.from.id;
    if(u.callback_query.data==='view'){ if(castles.length===0) await call('sendMessage',{chat_id:chatId,text:'لا يوجد قلاع حاليا'}); else{ let t='🏰 القلاع:\n'; castles.slice(-10).reverse().forEach((c,i)=>{ t+=(i+1)+'- مستوى '+c.level+' | '+c.price+'\n'; }); await call('sendMessage',{chat_id:chatId,text:t}); } }
    if(u.callback_query.data==='del' && isAdmin(uid)){ castles=[]; await call('sendMessage',{chat_id:chatId,text:'تم المسح'}); }
    await call('answerCallbackQuery',{callback_query_id:u.callback_query.id}).catch(()=>{});
  }
}

async function polling(){ while(true){ try{ const r=await fetch(API+'/getUpdates?offset='+offset+'&timeout=30'); const j=await r.json(); if(j.ok&&j.result.length){ for(let u of j.result){ offset=u.update_id+1; await onUpdate(u); } } }catch{ await new Promise(r=>setTimeout(r,2000)); } } }

const server = http.createServer((req,res)=>{
  if(req.url==='/'||req.url==='/health'){ res.writeHead(200); res.end('LIVE'); return; }
  if(req.url.includes('form.html')){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    res.end(FORM_HTML);
    return;
  }
  res.writeHead(404); res.end('404');
});

const PORT = process.env.PORT||10000;
server.listen(PORT, ()=>{ if(TOKEN) polling(); console.log('LIVE'); });
