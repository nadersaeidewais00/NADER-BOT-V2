const uid=ctx.from.id; if(userState.get(uid)!=="wait_screenshot") return;
  const fid=ctx.message.photo[ctx.message.photo.length-1].file_id;
  payments.set(uid,{userId:uid, screenshot:fid, status:"pending"});
  userState.delete(uid);
  await ctx.reply("✅ تم الاستلام");
  await bot.telegram.sendPhoto(ADMIN_ID, fid, {caption:💰 طلب دفع ID:${uid},...Markup.inlineKeyboard([[Markup.button.callback("✅ تأكيد","admin_ok_"+uid),Markup.button.callback("❌ الغاء","admin_no_"+uid)]])});
});

bot.command("addvodafone",async(ctx)=>{ if(ctx.from.id!==ADMIN_ID) return; const num=ctx.message.text.split(" ")[1]; if(!num) return ctx.reply("/addvodafone 01012345678"); paymentMethods.vodafone=num; await ctx.reply(✅ تم اضافة: ${num}); });
bot.action(/admin_ok_(\d+)/,async(ctx)=>{ if(ctx.from.id!==ADMIN_ID) return; const uid=parseInt(ctx.match[1]); if(payments.has(uid)){payments.get(uid).status="confirmed"; getUser(uid).wallet+=500; await ctx.editMessageCaption(✅ تم التأكيد ID:${uid}); await bot.telegram.sendMessage(uid,"✅ تم تأكيد دفعك");}});
bot.action(/admin_no_(\d+)/,async(ctx)=>{ if(ctx.from.id!==ADMIN_ID) return; const uid=parseInt(ctx.match[1]); if(payments.has(uid)){payments.get(uid).status="rejected"; await ctx.editMessageCaption(❌ تم الالغاء ID:${uid}); await bot.telegram.sendMessage(uid,"❌ تم رفض الدفع");}});

bot.on("text", async (ctx) => {
  const uid = ctx.from.id; const txt = ctx.message.text;
  if(["الـمـتـجـر 🏰","حـسـابـي 👤","الـمـحـفـظـة 💰","الـدعـم 🛎"].includes(txt)) return;
  if(txt.startsWith("/")) return;
  const state = userState.get(uid);
  if(state==="add_castle"){ getUser(uid).ads.push(txt); userState.delete(uid); await ctx.reply("✅ تم اضافة اعلانك"); return; }
  if(state==="support"){ userState.delete(uid); await ctx.reply("✅ تم ارسال رسالتك"); await bot.telegram.sendMessage(ADMIN_ID, 📩 دعم ID:${uid}\n${txt}); return; }
});

bot.launch().then(()=> console.log("NADER STORE LIVE"));
process.once("SIGINT", ()=> bot.stop("SIGINT"));
process.once("SIGTERM", ()=> bot.stop("SIGTERM"));TERM
