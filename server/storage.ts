import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";
import { 
  products, 
  testimonials, 
  carts, 
  cartItems,
  type Product, 
  type Testimonial, 
  type Cart, 
  type CartItem,
  type InsertCart,
  type InsertCartItem,
  adminSettings,
  type AdminSettings
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

interface IStorage {
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  getProductsByType(type: string): Promise<Product[]>;
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: number): Promise<boolean>;

  // Testimonials
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial>;

  // Cart operations
  getCart(sessionId: string): Promise<Cart | null>;
  createCart(data: { sessionId: string }): Promise<Cart>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  getCartItemsWithProducts(cartId: number): Promise<any[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(itemId: number, quantity: number): Promise<CartItem | null>;
  removeCartItem(cartId: number, productId: number): Promise<boolean>;

  // Admin settings
  getAdminSettings(): Promise<AdminSettings | null>;
  updateAdminSettings(settings: Partial<AdminSettings>): Promise<AdminSettings>;
}

class PostgresStorage implements IStorage {
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.createdAt);
  }

  async getProductById(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0] || null;
  }

  async getProductsByType(type: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.type, type as "audiobook" | "video" | "pdf" | "guide"));
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const [newProduct] = await db.insert(products).values({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    const [updatedProduct] = await db.update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || null;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> {
    const [newTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return newTestimonial;
  }

  async getCart(sessionId: string): Promise<Cart | null> {
    const result = await db.select().from(carts).where(eq(carts.sessionId, sessionId));
    return result[0] || null;
  }

  async createCart(data: { sessionId: string }): Promise<Cart> {
    let cart = await this.getCart(data.sessionId);
    
    if (cart) {
      return cart;
    }
    
    const [newCart] = await db.insert(carts).values({
      sessionId: data.sessionId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return newCart;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async getCartItemsWithProducts(cartId: number): Promise<any[]> {
    const items = await db.select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
      product: products
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));
    
    return items;
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const existingItem = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.cartId, item.cartId),
        eq(cartItems.productId, item.productId)
      ));

    if (existingItem.length > 0) {
      const [updatedItem] = await db.update(cartItems)
        .set({ 
          quantity: existingItem[0].quantity + (item.quantity || 1)
        })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      return updatedItem;
    }

    const [newItem] = await db.insert(cartItems).values({
      ...item,
      quantity: item.quantity || 1
    }).returning();
    return newItem;
  }

  async updateCartItemQuantity(itemId: number, quantity: number): Promise<CartItem | null> {
    const [updatedItem] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId))
      .returning();
    return updatedItem || null;
  }

  async removeCartItem(cartId: number, productId: number): Promise<boolean> {
    const result = await db.delete(cartItems)
      .where(and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId)
      ));
    return result.rowCount > 0;
  }

  async getAdminSettings(): Promise<AdminSettings | null> {
    const result = await db.select().from(adminSettings).limit(1);
    return result[0] || null;
  }

  async updateAdminSettings(settingsData: Partial<AdminSettings>): Promise<AdminSettings> {
    const existing = await this.getAdminSettings();
    
    if (!existing) {
      const [newSettings] = await db.insert(adminSettings).values({
        ...settingsData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any).returning();
      return newSettings;
    }
    
    const [updatedSettings] = await db.update(adminSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .returning();
    
    return updatedSettings;
  }
}

export const storage = new PostgresStorage();
