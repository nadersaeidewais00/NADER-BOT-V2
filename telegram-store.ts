import {
  bigint,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const storeWallets = pgTable("store_wallets", {
  telegramUserId: bigint("telegram_user_id", { mode: "number" }).primaryKey(),
  balanceEgp: integer("balance_egp").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storeOrders = pgTable("store_orders", {
  id: serial("id").primaryKey(),
  telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
  kind: text("kind").notNull(),
  productId: text("product_id"),
  productName: text("product_name").notNull(),
  amountEgp: integer("amount_egp").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("awaiting_payment"),
  paymentScreenshotFileId: text("payment_screenshot_file_id"),
  paymentScreenshotSubmittedAt: timestamp("payment_screenshot_submitted_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
});

export const storeWalletTransactions = pgTable("store_wallet_transactions", {
  id: serial("id").primaryKey(),
  telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
  amountEgp: integer("amount_egp").notNull(),
  reason: text("reason").notNull(),
  orderId: integer("order_id"),
  createdByTelegramId: bigint("created_by_telegram_id", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storePaymentSettings = pgTable("store_payment_settings", {
  method: text("method").primaryKey(),
  destination: text("destination").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storeSupportTickets = pgTable("store_support_tickets", {
  id: serial("id").primaryKey(),
  telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
  username: text("username"),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storeUserModeration = pgTable("store_user_moderation", {
  telegramUserId: bigint("telegram_user_id", { mode: "number" }).primaryKey(),
  warnCount: integer("warn_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
