*🏰 مرحبا بك في NADER BOT*\n +
      *النسخة الرسمية - Conquerors Golden Age*\n +
      *الفاتحون العصر الذهبي*\n\n +
      *مثل SONA BOT بالظبط ولكن باسمك*\n\n +
      (isAdm? 👑 *انت المالك - NADER*\n\n : "") +
      (hasSub(uid)? ✅ اشتراكك فعال في *NADER BOT*\n⏰ باقي: *${daysLeft(uid)} يوم*\n\n : ❌ غير مفعل في *NADER BOT*\n🎟️ فعل كود من الادمن NADER\n\n) +
      *NADER BOT يقدر:*\n +
      🏰 يلعب حدث النداء تلقائي\n +
      ⚔️ يجمع جوائز النداء\n +
      🤖 يشتغل 24 ساعة\n +
      🛡️ محمي من الحظر\n\n +
      *اختر من القائمة:*,
      mainKeyboard(uid)
    );
  });

  bot.action("ADMIN_PANEL", async (ctx) => {
    if (ctx.from!.id!== ADMIN_ID) return ctx.answerCbQuery("❌ انت مش NADER");
    await ctx.answerCbQuery();
    ctx.replyWithMarkdown(
      *👑 NADER ADMIN PANEL*\n\n +
      *مرحبا NADER - لوحة تحكم بوتك الخاص*\n\n +
      🎲 توليد كود - يولد كود عشوائي باسم NADER BOT\n +
      ⏰ تختار المدة\n +
      🎟️ الكود لمرة واحدة بس,
      adminKeyboard()
    );
  });

  const doGen = async (ctx: any, days: number) => {
    if (ctx.from!.id!== ADMIN_ID) return;
    const code = genCode();
    licenses.set(code, { code, days, used: false, createdAt: Date.now() });
    await ctx.answerCbQuery(تم توليد ${code});
    ctx.replyWithMarkdown(
      *✅ NADER BOT - تم توليد كود جديد*\n\n +
      🎟️ الكود: \${code}\\n +
      ⏰ المدة: *${days} يوم*\n +
      👑 البوت: *NADER BOT*\n +
      🔒 الاستخدام: *مرة واحدة فقط*\n\n +
      *ابعته للعميل كده:*\n +
      \مرحبا، كود تفعيل NADER BOT الخاص بك:\n${code}\nالمدة ${days} يوم\\n\n +
      العميل هيدخل يفعله في البوت,
      adminKeyboard()
    );
  };

  bot.action("ADMIN_GEN", async (ctx) => { if (ctx.from!.id!== ADMIN_ID) return; await ctx.answerCbQuery(); ctx.reply("اختار مدة كود NADER BOT:", adminKeyboard()); });
  bot.action("GEN_1", (ctx) => doGen(ctx, 1));
  bot.action("GEN_3", (ctx) => doGen(ctx, 3));
  bot.action("GEN_7", (ctx) => doGen(ctx, 7));
  bot.action("GEN_15", (ctx) => doGen(ctx, 15));
  bot.action("GEN_30", (ctx) => doGen(ctx, 30));
  bot.action("GEN_90", (ctx) => doGen(ctx, 90));

  bot.action("LIST_CODES", async (ctx) => {
    if (ctx.from!.id!== ADMIN_ID) return;
    await ctx.answerCbQuery();
    if (!licenses.size) return ctx.reply("مفيش اكواد NADER", adminKeyboard());
    let msg = *📋 اكواد NADER BOT (${licenses.size}):*\n\n;
    licenses.forEach(l => { msg += ${l.used? "✅" : "⏳"} \${l.code}\ - ${l.days} يوم ${l.used? استخدم بواسطة ${l.usedBy} : ""}\n; });
    ctx.replyWithMarkdown(msg, adminKeyboard());
  });

  bot.action("LIST_CLIENTS", async (ctx) => {
    if (ctx.from!.id!== ADMIN_ID) return;
    await ctx.answerCbQuery();
    if (!subs.size) return ctx.reply("مفيش عملاء NADER BOT", adminKeyboard());
    let msg = *👥 عملاء NADER BOT (${subs.size}):*\n\n;
    subs.forEach((s, id) => { msg += 👤 ${id} - باقي ${daysLeft(id)} يوم\n; });
    ctx.replyWithMarkdown(msg, adminKeyboard());
  });

  bot.action("BACK_HOME", async (ctx) => { await ctx.answerCbQuery(); ctx.reply("🏠 الرئيسية - NADER BOT", mainKeyboard(ctx.from!.id)); });
  bot.action("MY_ACCOUNTS", async (ctx) => {
    await ctx.answerCbQuery();
    const accs = db.get(ctx.from!.id) || [];
    if (!accs.length) return ctx.reply("📭 مفيش حسابات في NADER BOT", mainKeyboard(ctx.from!.id));
    let m = *👤 حساباتك في NADER BOT (${accs.length}):*\n\n;
    accs.forEach((a, i) => m += ${i + 1}. 🏰 قلعة \${a.castleId}\ - ${a.active? "🟢 شغال" : "🔴 واقف"}\n);
    ctx.replyWithMarkdown(m, mainKeyboard(ctx.from!.id));
  });
  bot.action("ADD_ACCOUNT", async (ctx) => { if (!hasSub(ctx.from!.id)) return ctx.reply("🔒 فعل كود NADER BOT الاول", mainKeyboard(ctx.from!.id)); await ctx.answerCbQuery(); ctx.replyWithMarkdown("✍️ ابعت حسابك في *NADER BOT* كده:\n\nemail password castleID\nمثال:\nnader@gmail.com pass123 1234567"); });
