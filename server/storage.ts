import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { products, carts, cartItems, testimonials, users, adminSettings } from "../shared/schema";
import type { Product, Cart, CartItem, InsertCartItem, Testimonial, AdminSettings } from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductsByType(type: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Cart
  getCart(sessionId: string): Promise<Cart>;
  createCart(data: { sessionId: string }): Promise<Cart>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(cartId: number, productId: number, quantity: number): Promise<CartItem | undefined>;
  updateCartItemQuantity(itemId: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(cartId: number, productId: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  getCartItemsWithProducts(cartId: number): Promise<any[]>;

  // Testimonials
  getAllTestimonials(): Promise<Testimonial[]>;

  // Analytics
  recordPageView(page: string, userAgent?: string, ip?: string): Promise<void>;
  recordSession(sessionId: string, userAgent?: string, ip?: string): Promise<void>;
  getAnalytics(): Promise<any>;

  // Admin Settings
  getAdminSettings(): Promise<AdminSettings>;
  updateAdminSettings(settings: Partial<AdminSettings>): Promise<AdminSettings>;
}

export class PostgresStorage implements IStorage {
  // In-memory storage for demo purposes (can be replaced with actual database calls)
  private cartItems = new Map<number, CartItem[]>();
  private analytics = {
    pageViews: [] as any[],
    sessions: [] as any[],
    visitors: new Set<string>()
  };

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProductsByType(type: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.type, type as any), eq(products.isActive, true)));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.getProduct(id);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const [newProduct] = await db.insert(products).values({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getCart(sessionId: string): Promise<Cart> {
    let [cart] = await db.select().from(carts).where(eq(carts.sessionId, sessionId));
    
    if (!cart) {
      [cart] = await db.insert(carts).values({
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
    }
    
    return cart;
  }

  async createCart(data: { sessionId: string }): Promise<Cart> {
    const [cart] = await db.insert(carts).values({
      sessionId: data.sessionId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return cart;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async getCartItemsWithProducts(cartId: number): Promise<any[]> {
    const items = this.cartItems.get(cartId) || [];
    const result = [];
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        result.push({
          ...item,
          product
        });
      }
    }
    
    return result;
  }

  async addCartItem(insertItem: InsertCartItem): Promise<CartItem> {
    const items = this.cartItems.get(insertItem.cartId) || [];
    const existingItem = items.find(item => item.productId === insertItem.productId);
    
    if (existingItem && insertItem.quantity) {
      existingItem.quantity += insertItem.quantity;
      return existingItem;
    }
    
    const newItem: CartItem = {
      id: Date.now(),
      cartId: insertItem.cartId,
      productId: insertItem.productId,
      quantity: insertItem.quantity || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    items.push(newItem);
    this.cartItems.set(insertItem.cartId, items);
    
    return newItem;
  }

  async updateCartItem(cartId: number, productId: number, quantity: number): Promise<CartItem | undefined> {
    const items = this.cartItems.get(cartId) || [];
    const item = items.find(item => item.productId === productId);
    
    if (item) {
      item.quantity = quantity;
      return item;
    }
    
    return undefined;
  }

  async removeCartItem(cartId: number, productId: number): Promise<boolean> {
    const items = this.cartItems.get(cartId) || [];
    const index = items.findIndex(item => item.productId === productId);
    
    if (index !== -1) {
      items.splice(index, 1);
      this.cartItems.set(cartId, items);
      return true;
    }
    
    return false;
  }

  async updateCartItemQuantity(itemId: number, quantity: number): Promise<CartItem | undefined> {
    for (const [cartId, items] of this.cartItems.entries()) {
      const item = items.find(item => item.id === itemId);
      if (item) {
        item.quantity = quantity;
        return item;
      }
    }
    return undefined;
  }

  async clearCart(cartId: number): Promise<boolean> {
    this.cartItems.set(cartId, []);
    return true;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async recordPageView(page: string, userAgent?: string, ip?: string): Promise<void> {
    this.analytics.pageViews.push({
      page,
      userAgent,
      ip,
      timestamp: new Date()
    });
    
    if (ip) {
      this.analytics.visitors.add(ip);
    }
  }

  async recordSession(sessionId: string, userAgent?: string, ip?: string): Promise<void> {
    this.analytics.sessions.push({
      sessionId,
      userAgent,
      ip,
      timestamp: new Date()
    });
  }

  async getAnalytics(): Promise<any> {
    return {
      totalPageViews: this.analytics.pageViews.length,
      totalSessions: this.analytics.sessions.length,
      uniqueVisitors: this.analytics.visitors.size,
      recentPageViews: this.analytics.pageViews.slice(-10),
      recentSessions: this.analytics.sessions.slice(-10)
    };
  }

  async getAdminSettings(): Promise<AdminSettings> {
    const [settings] = await db.select().from(adminSettings).limit(1);
    
    if (!settings) {
      const [newSettings] = await db.insert(adminSettings).values({
        siteName: "Audio Motívate",
        siteDescription: "Plataforma de contenido motivacional digital",
        enableRegistration: true,
        maintenanceMode: false,
        analyticsEnabled: true,
        emailNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return newSettings;
    }
    
    return settings;
  }

  async updateAdminSettings(settingsData: Partial<AdminSettings>): Promise<AdminSettings> {
    const [updatedSettings] = await db.update(adminSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .returning();
    
    return updatedSettings;
  }
}

export const storage = new PostgresStorage();
