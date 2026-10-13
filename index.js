bot.on("text", (ctx)=>{
  const id = ctx.from.id;
  const t = ctx.message.text;
  if(["الـمـتـجـر 🏰","حـسـابـي 👤","الـمـحـفـظـة 💰","الـدعـم 🛎","إضــافــة إعــلان قــلــعــه","مــشــاهــدة قــلــعــه","🔙 رجوع"].includes(t)) return;

  if(addMode.has(id)){
    addMode.delete(id);
    DB.castles.push({text:t.slice(0,300), price:"اسأل البائع", seller:id});
    return ctx.reply("✅ تم اضافة اعلان قلعتك 🏰", mainKB);
  }

  // حماية اوتو كليكر - 10 ثواني
  if(t.includes("شراء")){
    const last = lastAction.get(id)||0;
    if(Date.now()-last < 10000) return ctx.reply("⏳ انتظر 10 ثواني بين كل شراء - حماية من الأوتو كليكر");
    lastAction.set(id, Date.now());
  }

  // فلتر شتيمة قبل الدعم
  if(BAD.some(w=>t.includes(w))){
    const u = DB.users[id];
    u.warns = (u.warns||0)+1;
    if(u.warns>=3){ DB.bans.push(id); return ctx.reply("🚫 حظر بعد 3 تحذيرات"); }
    return ctx.reply(⚠️ تحذير ${u.warns}/3 - ممنوع الشتيمة - رسالتك لم تصل للدعم);
  }

  if(DB.bans.includes(id)) return ctx.reply("🚫 انت محظور");

  if(ADMIN_ID && t.length>2) {
    bot.telegram.sendMessage(ADMIN_ID, 📩 دعم من ${id} @${ctx.from.username||""}:\n${t.slice(0,500)}).catch(()=>{});
    ctx.reply("✅ تم ارسال رسالتك للدعم");
  }
});

bot.command("setvodafone", (ctx)=>{
  if(ctx.from.id!=ADMIN_ID) return;
  const n = ctx.message.text.split(" ")[1];
  if(!n) return ctx.reply("اكتب: /setvodafone 010xxxxxxxx");
  DB.vodafone=n;
  ctx.reply("تم تحديث رقم فودافون ✅ "+n);
});
bot.command("bans", (ctx)=>{
  if(ctx.from.id!=ADMIN_ID) return;
  ctx.reply(DB.bans.length? "🚫 المحظورين:\n"+DB.bans.join("\n"):"لا يوجد محظورين");
});
bot.command("unban", (ctx)=>{
  if(ctx.from.id!=ADMIN_ID) return;
  const uid = parseInt(ctx.message.text.split(" ")[1]);
  DB.bans = DB.bans.filter(x=>x!=uid);
  if(DB.users[uid]) DB.users[uid].warns=0;
  ctx.reply("تم فك الحظر ✅");
});

bot.launch().then(()=> console.log("BOT LAUNCHED SECURE")).catch(e=> console.log("BOT ERROR", e.message));
      }
