import { 
  products, 
  type Product, 
  type InsertProduct,
  carts,
  type Cart,
  type InsertCart,
  cartItems,
  type CartItem,
  type InsertCartItem,
  testimonials,
  type Testimonial,
  type InsertTestimonial,
  users,
  type User,
  type InsertUser,
  siteSettings,
  type SiteSettings,
  type InsertSiteSettings
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductsByType(type: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart operations
  getCart(sessionId: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  
  // Cart items operations
  getCartItems(cartId: number): Promise<CartItem[]>;
  getCartItemsWithProducts(cartId: number): Promise<(CartItem & { product: Product })[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  
  // Testimonial operations
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
  initializeSiteSettings(): Promise<SiteSettings>;
}

// Use database storage
export class DatabaseStorage implements IStorage {
  // User operations - simplified for now
  async getUser(id: number): Promise<User | undefined> {
    return undefined; // Will implement when auth is needed
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  }

  // Product operations using database
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByType(type: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.type, type), eq(products.isActive, true)));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.getProduct(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  // Cart operations - keep in memory for session management
  private carts = new Map<string, Cart>();
  private cartItems = new Map<number, CartItem[]>();
  private cartId = 1;

  async getCart(sessionId: string): Promise<Cart | undefined> {
    return this.carts.get(sessionId);
  }

  async createCart(insertCart: InsertCart): Promise<Cart> {
    const cart: Cart = {
      id: this.cartId++,
      sessionId: insertCart.sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.carts.set(insertCart.sessionId, cart);
    this.cartItems.set(cart.id, []);
    return cart;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return this.cartItems.get(cartId) || [];
  }

  async getCartItemsWithProducts(cartId: number): Promise<(CartItem & { product: Product })[]> {
    const items = this.cartItems.get(cartId) || [];
    const result: (CartItem & { product: Product })[] = [];
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        result.push({ ...item, product });
      }
    }
    
    return result;
  }

  async addCartItem(insertItem: InsertCartItem): Promise<CartItem> {
    const items = this.cartItems.get(insertItem.cartId) || [];
    const existingItem = items.find(item => item.productId === insertItem.productId);
    
    if (existingItem) {
      existingItem.quantity += insertItem.quantity;
      return existingItem;
    }
    
    const newItem: CartItem = {
      id: items.length + 1,
      cartId: insertItem.cartId,
      productId: insertItem.productId,
      quantity: insertItem.quantity,
    };
    
    items.push(newItem);
    this.cartItems.set(insertItem.cartId, items);
    return newItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    for (const [cartId, items] of this.cartItems.entries()) {
      const item = items.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
        return item;
      }
    }
    return undefined;
  }

  async removeCartItem(id: number): Promise<boolean> {
    for (const [cartId, items] of this.cartItems.entries()) {
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  // Testimonial operations
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    throw new Error("Not implemented");
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    if (!settings) {
      return await this.initializeSiteSettings();
    }
    return settings;
  }

  async updateSiteSettings(settingsUpdate: Partial<SiteSettings>): Promise<SiteSettings> {
    const currentSettings = await this.getSiteSettings();
    
    if (!currentSettings) {
      const newSettings = await this.initializeSiteSettings();
      if (Object.keys(settingsUpdate).length === 0) {
        return newSettings;
      }
    }

    const [updatedSettings] = await db
      .update(siteSettings)
      .set({
        ...settingsUpdate,
        updatedAt: new Date(),
      })
      .returning();

    return updatedSettings;
  }

  async initializeSiteSettings(): Promise<SiteSettings> {
    const defaultSettings: InsertSiteSettings = {
      siteName: 'Audio Motívate',
      siteDescription: 'Tu plataforma de contenido motivacional premium sin anuncios',
      contactEmail: 'info.audiomotivate@gmail.com',
      domainUrl: 'www.audiomotivate.com',
      enableAnalytics: true,
      enableEmailNotifications: true,
      maintenanceMode: false,
      maxUploadSize: 100,
      allowGuestCheckout: true,
    };

    const [settings] = await db.insert(siteSettings).values(defaultSettings).returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();