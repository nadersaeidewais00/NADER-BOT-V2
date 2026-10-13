bot.start((ctx)=>{ getUser(ctx.from.id); ctx.reply("مـرحـبـٱ بـك فـي مـتـجـر NADER STORE إختر الخدمه التي تريدها من الأزرار 🏰", mainKeyboard); });

bot.hears("الـمـتـجـر 🏰",(ctx)=>ctx.reply("🏰 المتجر:", Markup.inlineKeyboard([[Markup.button.callback("إضــافــة إعــلان قــلــعــه","add_castle")],[Markup.button.callback("مــشــاهــدة قــلــعــه","view_castle")]])));
bot.hears("حـسـابـي 👤",(ctx)=>{const u=getUser(ctx.from.id); ctx.reply(👤 حسابك\nID:${ctx.from.id}\nتحذيرات:${u.warnings}/3\nرصيد:${u.wallet} ج);});
bot.hears("الـمـحـفـظـة 💰",(ctx)=>{const m=paymentMethods.vodafone?💳 Vodafone: ${paymentMethods.vodafone}:"❌ لم يضف الادمن دفع"; ctx.reply(💰 محفظتك: ${getUser(ctx.from.id).wallet} ج\n${m}\nابعت اسكرين ثم تأكيد - مرة واحدة فقط, Markup.inlineKeyboard([[Markup.button.callback("تأكيد الدفع 💳","confirm_pay")]]));});
bot.hears("الـدعـم 🛎",(ctx)=>{ userState.set(ctx.from.id, "support"); ctx.reply("🛎 اكتب رسالتك - الذكاء الاصطناعي بيفحصها:"); });

bot.action("add_castle",async(ctx)=>{ await ctx.answerCbQuery(); userState.set(ctx.from!.id, "add_castle"); await ctx.reply("🏰 ابعت تفاصيل القلعة:"); });
bot.action("view_castle",async(ctx)=>{ await ctx.answerCbQuery(); const all=Array.from(users.values()).flatMap((x:any)=>x.ads); if(all.length==0) return ctx.reply("لا يوجد قلاع"); ctx.reply(all.join("\n---\n"), Markup.inlineKeyboard([[Markup.button.callback("شراء 🛒","buy_castle")]])); });
bot.action("buy_castle",async(ctx)=>{ await ctx.answerCbQuery("🛒 تم تسجيل طلبك", {show_alert:true}); });
bot.action("confirm_pay",async(ctx)=>{ const uid=ctx.from!.id; if(payments.has(uid)&&payments.get(uid).status==="pending"){ await ctx.answerCbQuery("❌ لك طلب معلق", {show_alert:true}); return; } userState.set(uid, "wait_screenshot"); await ctx.answerCbQuery(); await ctx.reply("📸 ابعت اسكرين التحويل:"); });

bot.on("photo",async(ctx)=>{
  const uid=ctx.from.id; if(userState.get(uid)!=="wait_screenshot") return;
  const fid=ctx.message.photo[ctx.message.photo.length-1].file_id;
  payments.set(uid,{userId:uid, screenshot:fid, status:"pending"});
  userState.delete(uid);
  await ctx.reply("✅ تم الاستلام - فحص AI للاسكرينات المزيفة مفعل");
  await bot.telegram.sendPhoto(ADMIN_ID, fid, {caption:💰 طلب دفع ID:${uid},...Markup.inlineKeyboard([[Markup.button.callback("✅ تأكيد","admin_ok_"+uid),Markup.button.callback("❌ الغاء","admin_no_"+uid)]])});
});

bot.command("addvodafone",async(ctx)=>{ if(ctx.from.id!==ADMIN_ID) return; const num=ctx.message.text.split(" ")[1]; if(!num) return ctx.reply("/addvodafone 01012345678"); paymentMethods.vodafone=num; await ctx.reply(✅ تم اضافة: ${num}); });
bot.action(/admin_ok_(\d+)/,async(ctx)=>{ if(ctx.from!.id!==ADMIN_ID) return; const uid=parseInt(ctx.match[1]); if(payments.has(uid)){payments.get(uid).status="confirmed"; getUser(uid).wallet+=500; await ctx.editMessageCaption(✅ تم التأكيد ID:${uid}); await bot.telegram.sendMessage(uid,"✅ تم تأكيد دفعك");}});
bot.action(/admin_no_(\d+)/,async(ctx)=>{ if(ctx.from!.id!==ADMIN_ID) return; const uid=parseInt(ctx.match[1]); if(payments.has(uid)){payments.get(uid).status="rejected"; await ctx.editMessageCaption(❌ تم الالغاء ID:${uid}); await bot.telegram.sendMessage(uid,"❌ تم رفض الدفع");}});
bot.command("bans",async(ctx)=>{ if(ctx.from.id!==ADMIN_ID) return; if(bans.size==0) return ctx.reply("لا يوجد محظورين"); let t="🚫 المحظورين (AI):\n"; bans.forEach((v,k)=>t+=ID:${k} - ${v.name} - ${v.reason}\n); ctx.reply(t); });

bot.on("text", async (ctx) => {
  const uid = ctx.from.id; const txt = ctx.message.text;
  if(["الـمـتـجـر 🏰","حـسـابـي 👤","الـمـحـفـظـة 💰","الـدعـم 🛎"].includes(txt)) return;
  if(txt.startsWith("/")) return;
  const state = userState.get(uid);
  if(state==="add_castle"){ getUser(uid).ads.push(txt); userState.delete(uid); await ctx.reply("✅ تم اضافة اعلانك"); return; }
  if(state==="support"){ userState.delete(uid); await ctx.reply("✅ تم ارسال رسالتك بعد فحص AI"); await bot.telegram.sendMessage(ADMIN_ID, 📩 دعم ID:${uid}\n${txt}); return; }
});
bot.launch().then(()=> console.log("NADER STORE AI LIVE"));
process.once("SIGINT", ()=> bot.stop("SIGINT"));
process.once("SIGTERM", ()=> bot.stop("SIGTERM"));
