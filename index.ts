return ctx.reply(m, adminMenu());
  });
  bot.action("BACK", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("الرئيسية", mainMenu(ctx.from.id)); });
  bot.action("MYSUB", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply(hasSub(ctx.from.id)? ✅ فعال باقي ${daysLeft(ctx.from.id)} يوم : "❌ غير مفعل", mainMenu(ctx.from.id)); });
  bot.action("REDEEM", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("🎟️ ابعت كود NADER: مثال NADER-A1B2C3D4"); });
  bot.action("START", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("🚀 NADER BOT شغال", mainMenu(ctx.from.id)); });
  bot.action("STOP", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("⏹️ وقف", mainMenu(ctx.from.id)); });

  bot.on("text", async (ctx) => {
    const raw = ctx.message.text.trim();
    const uid = ctx.from.id;

    if (captcha.has(uid)) {
      const c = captcha.get(uid);
      if (Number(raw) === c.a) { captcha.delete(uid); clicks.delete(uid); return ctx.reply("✅ تم التحقق", mainMenu(uid)); }
      return ctx.reply(❌ غلط حل ${c.q});
    }

    if (/^NADER-[A-Z0-9]{8}$/.test(raw.toUpperCase())) {
      const code = raw.toUpperCase();
      const lic = licenses.get(code);
      if (!lic) return ctx.reply("❌ الكود مش موجود", mainMenu(uid));
      if (lic.used) return ctx.reply("❌ استخدم قبل كده مرة واحدة بس", mainMenu(uid));
      lic.used = true;
      lic.usedBy = uid;
      const cur = subs.get(uid);
      const newExp = cur && cur.expiresAt > Date.now()? cur.expiresAt + lic.days * 86400000 : Date.now() + lic.days * 86400000;
      subs.set(uid, { expiresAt: newExp });
      return ctx.reply(🎉 تم تفعيل NADER BOT\n🎟️ ${code}\n⏰ ${lic.days} يوم, mainMenu(uid));
    }
    return ctx.reply("❓ ابعت كود NADER BOT", mainMenu(uid));
  });

  bot.launch().then(() => console.log("NADER BOT LIVE"));
}
