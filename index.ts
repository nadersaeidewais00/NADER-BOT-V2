bot.action("LISTC", async (ctx) => {
    await ctx.answerCbQuery();
    if (!licenses.size) return ctx.reply("مفيش اكواد", adminMenu());
    let msg = 📋 اكواد NADER (${licenses.size}):\n\n;
    licenses.forEach((l) => { msg += ${l.used? "✅" : "⏳"} ${l.code} - ${l.days} يوم\n; });
    return ctx.reply(msg, adminMenu());
  });

  bot.action("LISTU", async (ctx) => {
    await ctx.answerCbQuery();
    if (!subs.size) return ctx.reply("مفيش عملاء", adminMenu());
    let msg = 👥 عملاء NADER:\n\n;
    subs.forEach((s, id) => { msg += ${id} - باقي ${daysLeft(id)} يوم\n; });
    return ctx.reply(msg, adminMenu());
  });

  bot.action("BACK", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("الرئيسية", mainMenu(ctx.from.id)); });
  bot.action("MY_ACC", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("📭 حساباتك", mainMenu(ctx.from.id)); });
  bot.action("ADD", async (ctx) => { if (!hasSub(ctx.from.id)) return ctx.reply("🔒 فعل كود الاول", mainMenu(ctx.from.id)); await ctx.answerCbQuery(); return ctx.reply("ابعت: email password castleID"); });
  bot.action("START", async (ctx) => { if (!hasSub(ctx.from.id)) return ctx.reply("🔒 فعل كود", mainMenu(ctx.from.id)); await ctx.answerCbQuery(); return ctx.reply("🚀 NADER BOT بدأ النداء", mainMenu(ctx.from.id)); });
  bot.action("STOP", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("⏹️ وقف", mainMenu(ctx.from.id)); });
  bot.action("MYSUB", async (ctx) => { await ctx.answerCbQuery(); const uid = ctx.from.id; return ctx.reply(hasSub(uid)? ✅ فعال - باقي ${daysLeft(uid)} يوم : "❌ غير مفعل", mainMenu(uid)); });
  bot.action("REDEEM", async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("🎟️ ابعت كود NADER: مثال NADER-A1B2C3D4"); });

  bot.on("text", async (ctx) => {
    const raw = ctx.message.text.trim();
    const uid = ctx.from.id;

    if (captcha.has(uid)) {
      const c = captcha.get(uid);
      if (parseInt(raw) === c.a) { captcha.delete(uid); clicks.delete(uid); return ctx.reply("✅ تم التحقق - انت مش روبوت", mainMenu(uid)); }
      else return ctx.reply(❌ غلط، حل ${c.q} = ؟);
    }

    if (/^NADER-[A-Z0-9]{6,10}$/.test(raw.toUpperCase())) {
      const code = raw.toUpperCase();
      const lic = licenses.get(code);
      if (!lic) return ctx.reply("❌ الكود مش موجود", mainMenu(uid));
      if (lic.used) return ctx.reply("❌ استخدم قبل كده - مرة واحدة بس", mainMenu(uid));
      lic.used = true; lic.usedBy = uid;
      const cur = subs.get(uid);
      const newExp = cur && cur.expiresAt > Date.now()? cur.expiresAt + lic.days * 86400000 : Date.now() + lic.days * 86400000;
      subs.set(uid, { expiresAt: newExp });
      return ctx.reply(🎉 تم التفعيل في NADER BOT\n🎟️ ${code}\n⏰ ${lic.days} يوم, mainMenu(uid));
    }

    const p = raw.split(/\s+/);
    if (p.length >= 3 && p[0].includes("@")) {
      if (!hasSub(uid)) return ctx.reply("🔒 فعل كود الاول", mainMenu(uid));
      const accs = db.get(uid) || [];
      accs.push({ email: p[0].toLowerCase(), password: p[1], castleId: p[2] });
      db.set(uid, accs);
      return ctx.reply(✅ حفظ قلعة ${p[2]}, mainMenu(uid));
    }

    return ctx.reply("❓ ابعت كود NADER BOT", mainMenu(uid));
  });

  bot.launch().then(() => console.log(✅ NADER BOT LIVE ADMIN=${ADMIN_ID}));
           }
