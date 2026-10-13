bot.on("text", async (ctx) => {
  const uid = ctx.from.id;
  const txt = ctx.message.text;
  if(["الـمـتـجـر","حـسـابـي","الـمـحـفـظـة","الـدعـم"].includes(txt)) return;
  if(txt.startsWith("/")) return;
  const state = userState.get(uid);
  if(state==="add_castle"){
    getUser(uid).ads.push(txt);
    userState.delete(uid);
    await ctx.reply("تم اضافة اعلانك");
    return;
  }
  if(state==="support"){
    userState.delete(uid);
    await ctx.reply("تم ارسال رسالتك");
    await bot.telegram.sendMessage(ADMIN_ID, "دعم ID:" + uid + " " + txt);
    return;
  }
});

bot.launch().then(()=> console.log("NADER STORE LIVE"));
process.once("SIGINT", ()=> bot.stop("SIGINT"));
process.once("SIGTERM", ()=> bot.stop("SIGTERM"));
