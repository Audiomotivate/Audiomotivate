import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import session from "express-session";
import path from "path";
import { z } from "zod";
import { insertCartItemSchema } from "../shared/schema";
import crypto from "crypto";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'audiomotivate-dev-secret-key-2024',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

// Direct API routes for Vercel compatibility
app.get('/api/products', async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await storage.createProduct(req.body);
    res.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await storage.updateProduct(parseInt(req.params.id), req.body);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await storage.deleteProduct(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/api/products/type/:type', async (req, res) => {
  try {
    const products = await storage.getProductsByType(req.params.type);
    res.json(products);
  } catch (error) {
    console.error('Products by type error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await storage.getProductById(parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Cart routes
app.get('/api/cart', async (req, res) => {
  try {
    const sessionId = req.session.id;
    let cart = await storage.getCart(sessionId);
    if (!cart) {
      cart = await storage.createCart({ sessionId });
    }
    const items = await storage.getCartItemsWithProducts(cart.id);
    res.json({ cart, items });
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart/items', async (req, res) => {
  try {
    const sessionId = req.session.id;
    let cart = await storage.getCart(sessionId);
    if (!cart) {
      cart = await storage.createCart({ sessionId });
    }
    const item = await storage.addCartItem({
      cartId: cart.id,
      productId: req.body.productId,
      quantity: req.body.quantity || 1
    });
    res.json(item);
  } catch (error) {
    console.error('Add cart item error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.delete('/api/cart/items/:id', async (req, res) => {
  try {
    await storage.removeCartItem(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const sessionId = req.session.id;
    const cart = await storage.getCart(sessionId);
    if (cart) {
      await storage.clearCart(cart.id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Analytics routes
app.post('/api/analytics/pageview', (req, res) => {
  res.status(200).json({ success: true });
});

app.post('/api/analytics/session', (req, res) => {
  res.status(200).json({ success: true });
});

// Testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await storage.getAllTestimonials();
    res.json(testimonials);
  } catch (error) {
    console.error('Testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Simplified admin routes
app.get('/api/admin/products', async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/admin/products', async (req, res) => {
  try {
    const product = await storage.createProduct(req.body);
    res.json(product);
  } catch (error) {
    console.error('Admin create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/api/admin/analytics', (req, res) => {
  res.json({
    totalProducts: 4,
    totalRevenue: 39600,
    todayRevenue: 0,
    totalOrders: 0
  });
});

app.get('/api/admin/settings', (req, res) => {
  res.json({
    siteName: "Audio Motívate",
    maintenanceMode: false,
    cartEnabled: true
  });
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

const port = parseInt(process.env.PORT!) || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
