bot.action("START", async (ctx) => {
  await ctx.answerCbQuery();
  if (!hasSub(ctx.from.id)) {
    return ctx.reply("❌ فعل اشتراكك الاول بكود NADER", mainMenu(ctx.from.id));
  }
  return ctx.reply("🟢 تم التشغيل بنجاح\n✅ شغال 24 ساعة\n✅ ضد كشف الفاتحون\n✅ احسن من SONA", mainMenu(ctx.from.id));
});

bot.action("BACK", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.reply("🏠 القائمة الرئيسية:", mainMenu(ctx.from.id));
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim().toUpperCase();
  if (!text.startsWith("NADER-")) return;

  const lic = licenses.get(text);
  if (!lic) return ctx.reply("❌ كود غلط - تأكد من الكود", mainMenu(ctx.from.id));
  if (lic.used) return ctx.reply("❌ الكود ده استخدم قبل كده", mainMenu(ctx.from.id));

  lic.used = true;
  lic.usedBy = ctx.from.id;
  subs.set(ctx.from.id, {
    expiresAt: Date.now() + lic.days * 86400000
  });

  return ctx.reply(
    ✅ تم التفعيل بنجاح!\n\n⏰ المدة: ${lic.days} يوم\n🟢 شغال 24 ساعة\n🏰 NADER BOT,
    mainMenu(ctx.from.id)
  );
});

// ============ LAUNCH ============
bot.launch().then(() => {
  console.log("NADER BOT 24H READY - 10000000000% ORGANIZED");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
