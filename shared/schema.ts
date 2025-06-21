import { pgTable, text, varchar, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const productTypes = ["audiobook", "video", "pdf", "guide"] as const;
export type ProductType = typeof productTypes[number];

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: productTypes }).notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(), // Price in cents
  imageUrl: text("image_url").notNull(),
  previewUrl: text("preview_url"),
  downloadUrl: text("download_url"),
  duration: text("duration"),
  badge: text("badge"), // Optional badge like "Premium", "Nuevo", "Bestseller"
  isBestseller: boolean("is_bestseller").default(false),
  isNew: boolean("is_new").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Analytics tables for tracking user behavior and sales
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  page: text("page").notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  duration: integer("duration"), // Time spent on page in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions_analytics", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  ip: text("ip"),
  country: text("country"),
  city: text("city"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  totalDuration: integer("total_duration"), // Total session time in seconds
  pagesVisited: integer("pages_visited").default(1),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(), // Price in cents at time of sale
  totalAmount: integer("total_amount").notNull(), // Total in cents
  paymentMethod: text("payment_method"), // 'stripe', 'paypal', etc
  sessionId: text("session_id"),
  customerEmail: text("customer_email"),
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'refunded'
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  totalVisitors: integer("total_visitors").notNull().default(0),
  totalPageViews: integer("total_page_views").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0), // Amount in cents
  salesCount: integer("sales_count").notNull().default(0),
  avgSessionDuration: integer("avg_session_duration").default(0), // In seconds
  bounceRate: integer("bounce_rate").default(0), // Percentage * 100
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Audio Motívate"),
  siteDescription: text("site_description").notNull().default("Plataforma de contenido motivacional digital"),
  enableRegistration: boolean("enable_registration").notNull().default(true),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  analyticsEnabled: boolean("analytics_enabled").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCartSchema = createInsertSchema(carts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type User = typeof users.$inferSelect;

export type InsertPageView = typeof pageViews.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type AdminSettings = typeof adminSettings.$inferSelect;

export type InsertSession = typeof sessions.$inferInsert;
export type Session = typeof sessions.$inferSelect;

export type InsertSale = typeof sales.$inferInsert;
export type Sale = typeof sales.$inferSelect;

export type InsertDailyStats = typeof dailyStats.$inferInsert;
export type DailyStats = typeof dailyStats.$inferSelect;

// Site Settings Table
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 200 }).notNull().default('Audio Motívate'),
  siteDescription: text("site_description").notNull().default('Tu plataforma de contenido motivacional premium sin anuncios'),
  contactEmail: varchar("contact_email", { length: 200 }).notNull().default('info.audiomotivate@gmail.com'),
  domainUrl: varchar("domain_url", { length: 200 }).notNull().default('www.audiomotivate.com'),
  enableAnalytics: boolean("enable_analytics").default(true),
  enableEmailNotifications: boolean("enable_email_notifications").default(true),
  maintenanceMode: boolean("maintenance_mode").default(false),
  maxUploadSize: integer("max_upload_size").default(100),
  allowGuestCheckout: boolean("allow_guest_checkout").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;

// CartItem with product information
export type CartItemWithProduct = CartItem & {
  product: Product;
};
