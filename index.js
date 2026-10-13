// اوامر ادمن
bot.command("setvodafone",(ctx)=>{
  if(ctx.from.id !== ADMIN_ID) return;
  const num = ctx.message.text.split(" ")[1];
  if(!num) return ctx.reply("استخدم: /setvodafone 010xxxxxxxx");
  DB.vodafoneNumber = num;
  saveDB();
  ctx.reply(تم تحديث رقم فودافون كاش الى ${num} ✅);
});

bot.command("bans",(ctx)=>{
  if(ctx.from.id !== ADMIN_ID) return;
  if(DB.bans.length===0) return ctx.reply("لا يوجد محظورين");
  ctx.reply("🚫 قائمة الحظر:\n"+DB.bans.map(b=>ID:${b.id} - ${b.reason}).join("\n"));
});

bot.command("unban",(ctx)=>{
  if(ctx.from.id !== ADMIN_ID) return;
  const id = parseInt(ctx.message.text.split(" ")[1]);
  DB.bans = DB.bans.filter(b=>b.id!==id);
  if(DB.users[id]) DB.users[id].warnings=0;
  saveDB();
  ctx.reply(تم فك حظر ${id} ✅);
});

bot.launch();
console.log("NADER STORE SECURE LIVE - مع كل انظمة الحماية");
