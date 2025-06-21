import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCartItemSchema } from "@shared/schema";
import crypto from "crypto";
import path from "path";
import Stripe from "stripe";
import { registerAdminRoutes } from "./admin";
import { registerAnalyticsRoutes } from "./analytics";
import { registerMockAnalyticsRoute } from "./mock-analytics";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir archivos de preview de audio con headers CORS apropiados
  app.get('/api/previews/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'public', 'previews', filename);
    
    // Headers para permitir streaming de audio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ error: 'Audio file not found' });
      }
    });
  });
  
  // Initialize Stripe
  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any,
    });
  }

  // Register admin routes first
  registerAdminRoutes(app);

  // Create router for API routes
  const router = express.Router();
  app.use("/api", router);
  
  // Get all products
  router.get("/products", async (req: Request, res: Response) => {
    const products = await storage.getAllProducts();
    
    // Disable caching for fresh product data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(products);
  });

  // Get products by type
  router.get("/products/type/:type", async (req: Request, res: Response) => {
    const type = req.params.type;
    const products = await storage.getProductsByType(type);
    
    // Disable caching for fresh product data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    
    res.json(products);
  });

  // Get single product
  router.get("/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await storage.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  });

  // Get testimonials
  router.get("/testimonials", async (req: Request, res: Response) => {
    const testimonials = await storage.getAllTestimonials();
    res.json(testimonials);
  });

  // Cart management
  // Get or create cart for session
  router.get("/cart", async (req: Request, res: Response) => {
    let sessionId = req.cookies.cartSession;
    
    if (!sessionId) {
      // Create new session ID
      sessionId = crypto.randomUUID();
      res.cookie("cartSession", sessionId, { 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true 
      });
    }
    
    // Find or create cart
    let cart = await storage.getCart(sessionId);
    
    if (!cart) {
      cart = await storage.createCart({ sessionId });
    }
    
    // Get cart items with product details
    const cartItems = await storage.getCartItemsWithProducts(cart.id);
    
    res.json({
      cart,
      items: cartItems
    });
  });

  // Add item to cart
  router.post("/cart/items", async (req: Request, res: Response) => {
    let sessionId = req.cookies.cartSession;
    
    if (!sessionId) {
      // Create new session ID si no existe
      sessionId = crypto.randomUUID();
      res.cookie("cartSession", sessionId, { 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true 
      });
    }
    
    // Get or create cart
    let cart = await storage.getCart(sessionId);
    
    if (!cart) {
      cart = await storage.createCart({ sessionId });
    }
    
    try {
      // Imprimimos para depurar
      console.log('Body recibido:', req.body);
      console.log('Cart ID:', cart.id);
      
      // Preparar los datos del item del carrito
      const cartItemData = {
        productId: req.body.productId,
        quantity: req.body.quantity || 1,
        cartId: cart.id
      };
      
      console.log('Datos procesados para añadir al carrito:', cartItemData);
      
      // Validate request body
      const validation = insertCartItemSchema.safeParse(cartItemData);
      
      if (!validation.success) {
        console.error('Error de validación:', validation.error.errors);
        return res.status(400).json({ 
          message: "Invalid cart item data",
          errors: validation.error.errors 
        });
      }
      
      const cartItem = await storage.addCartItem(validation.data);
      
      // Get updated cart items
      const cartItems = await storage.getCartItemsWithProducts(cart.id);
      
      res.json({
        cart,
        items: cartItems
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  // Update cart item quantity
  router.patch("/cart/items/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    const quantitySchema = z.object({
      quantity: z.number().int().positive()
    });
    
    try {
      const validation = quantitySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid quantity",
          errors: validation.error.errors 
        });
      }
      
      const cartItem = await storage.updateCartItemQuantity(id, validation.data.quantity);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get updated cart
      const sessionId = req.cookies.cartSession;
      const cart = await storage.getCart(sessionId);
      const cartItems = await storage.getCartItemsWithProducts(cart!.id);
      
      res.json({
        cart,
        items: cartItems
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  router.delete("/cart/items/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    const removed = await storage.removeCartItem(0, id); // Fix: add cartId parameter
    
    if (!removed) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    // Get updated cart
    const sessionId = req.cookies.cartSession;
    const cart = await storage.getCart(sessionId);
    const cartItems = await storage.getCartItemsWithProducts(cart!.id);
    
    res.json({
      cart,
      items: cartItems
    });
  });

  // Clear all items from cart
  router.delete("/cart/clear", async (req: Request, res: Response) => {
    console.log("DELETE /cart/clear called");
    try {
      const sessionId = req.cookies.cartSession;
      console.log("Session ID:", sessionId);
      
      if (!sessionId) {
        console.log("No cart session found");
        return res.status(400).json({ message: "No cart session found" });
      }
      
      const cart = await storage.getCart(sessionId);
      console.log("Cart found:", cart);
      
      if (!cart) {
        console.log("Cart not found");
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Get all cart items and remove them
      const cartItems = await storage.getCartItems(cart.id);
      console.log("Cart items to remove:", cartItems.length);
      
      for (const item of cartItems) {
        console.log("Removing item:", item.id);
        await storage.removeCartItem(0, item.id); // Fix: use cartId instead of sessionId
      }
      
      console.log("Cart cleared successfully");
      res.json({
        cart,
        items: []
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Stripe payment intent creation
  router.post("/create-payment-intent", async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(500).json({ 
        error: "Stripe not configured. Please add STRIPE_SECRET_KEY environment variable." 
      });
    }

    try {
      const { amount, currency = "mxn" } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook endpoint for Stripe events
  router.post("/webhook/stripe", express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error("Stripe webhook secret not configured");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        // Here you can add logic to fulfill the order, send email receipts, etc.
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedPayment.id}`);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Admin system info route
  router.get("/admin/system", async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getAnalytics();
      const products = await storage.getAllProducts();
      const testimonials = await storage.getAllTestimonials();
      
      const systemInfo = {
        status: "operational",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: "connected",
          provider: "neon-postgresql"
        },
        analytics: {
          totalPageViews: analytics.pageViews,
          totalSessions: analytics.sessions,
          uniqueVisitors: analytics.visitors
        },
        content: {
          totalProducts: products.length,
          activeProducts: products.filter(p => p.isActive).length,
          productsByType: {
            audiobook: products.filter(p => p.type === 'audiobook').length,
            video: products.filter(p => p.type === 'video').length,
            guide: products.filter(p => p.type === 'guide').length,
            pdf: products.filter(p => p.type === 'pdf').length
          },
          totalTestimonials: testimonials.length
        }
      };

      res.json(systemInfo);
    } catch (error) {
      console.error("Error getting system info:", error);
      res.status(500).json({ error: "Failed to get system information" });
    }
  });

  // Admin settings routes
  router.get("/admin/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error getting settings:", error);
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  router.put("/admin/settings", async (req: Request, res: Response) => {
    try {
      const updatedSettings = await storage.updateAdminSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Register analytics routes
  registerAnalyticsRoutes(app);
  
  // Register mock analytics route for development
  registerMockAnalyticsRoute(app);

  // Serve admin panel (only in production)
  if (process.env.NODE_ENV === "production") {
    app.get("/admin", (req: Request, res: Response) => {
      const distPath = path.join(process.cwd(), "dist", "public");
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath);
    });

    app.get("/admin/*", (req: Request, res: Response) => {
      const distPath = path.join(process.cwd(), "dist", "public");
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath);
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
