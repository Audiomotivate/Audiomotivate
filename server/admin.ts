import type { Express } from "express";
import { products, testimonials, type Product } from "../shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Middleware to check admin access
export const isAdmin = (req: any, res: any, next: any) => {
  // For now, allow access - you can add proper admin authentication later
  // In production, check if user is admin: req.user?.isAdmin
  next();
};

export function registerAdminRoutes(app: Express) {
  // Get all products for admin
  app.get("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // Create new product
  app.post("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const productData = req.body;
      
      // Validate required fields
      if (!productData.title || !productData.description || !productData.type || 
          !productData.category || !productData.price || !productData.downloadUrl) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const insertData: any = {
        title: productData.title,
        description: productData.description,
        type: productData.type,
        category: productData.category,
        price: productData.price,
        imageUrl: productData.imageUrl || null,
        previewUrl: productData.previewUrl || null,
        downloadUrl: productData.downloadUrl,
        duration: productData.duration || null,
        badge: productData.badge || null,
        isBestseller: productData.isBestseller || false,
        isNew: productData.isNew || false,
        isActive: true,
      };

      // Include custom ID if provided
      if (productData.id && !isNaN(parseInt(productData.id))) {
        insertData.id = parseInt(productData.id);
      }

      const [newProduct] = await db.insert(products).values(insertData).returning();

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error creating product" });
    }
  });

  // Update product
  app.put("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = req.body;

      const [updatedProduct] = await db.update(products)
        .set({
          title: productData.title,
          description: productData.description,
          type: productData.type,
          category: productData.category,
          price: productData.price,
          imageUrl: productData.imageUrl || null,
          previewUrl: productData.previewUrl || null,
          downloadUrl: productData.downloadUrl,
          duration: productData.duration || null,
          badge: productData.badge || null,
          isBestseller: productData.isBestseller || false,
          isNew: productData.isNew || false,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product" });
    }
  });

  // Delete product
  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);

      const [deletedProduct] = await db.delete(products)
        .where(eq(products.id, productId))
        .returning();

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Toggle product active status
  app.patch("/api/admin/products/:id/toggle", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);

      // First get current status
      const [currentProduct] = await db.select().from(products).where(eq(products.id, productId));
      
      if (!currentProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Toggle status
      const [updatedProduct] = await db.update(products)
        .set({
          isActive: !currentProduct.isActive,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error toggling product status:", error);
      res.status(500).json({ message: "Error toggling product status" });
    }
  });

  // TESTIMONIALS ROUTES
  
  // Get all testimonials (public endpoint, already exists)
  // POST /api/testimonials is handled in the main routes

  // Create testimonial
  app.post("/api/admin/testimonials", isAdmin, async (req, res) => {
    try {
      const testimonialData = req.body;

      if (!testimonialData.name || !testimonialData.imageUrl || 
          !testimonialData.rating || !testimonialData.comment) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const [newTestimonial] = await db.insert(testimonials).values({
        name: testimonialData.name,
        imageUrl: testimonialData.imageUrl,
        rating: testimonialData.rating,
        comment: testimonialData.comment,
      }).returning();

      res.status(201).json(newTestimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Error creating testimonial" });
    }
  });

  // Update testimonial
  app.put("/api/admin/testimonials/:id", isAdmin, async (req, res) => {
    try {
      const testimonialId = parseInt(req.params.id);
      const testimonialData = req.body;

      const [updatedTestimonial] = await db.update(testimonials)
        .set({
          name: testimonialData.name,
          imageUrl: testimonialData.imageUrl,
          rating: testimonialData.rating,
          comment: testimonialData.comment,
        })
        .where(eq(testimonials.id, testimonialId))
        .returning();

      if (!updatedTestimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }

      res.json(updatedTestimonial);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(500).json({ message: "Error updating testimonial" });
    }
  });

  // Delete testimonial
  app.delete("/api/admin/testimonials/:id", isAdmin, async (req, res) => {
    try {
      const testimonialId = parseInt(req.params.id);

      const [deletedTestimonial] = await db.delete(testimonials)
        .where(eq(testimonials.id, testimonialId))
        .returning();

      if (!deletedTestimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }

      res.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ message: "Error deleting testimonial" });
    }
  });
}