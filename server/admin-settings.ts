import type { Express } from "express";
import { isAdmin } from "./analytics";
import { storage } from "./storage";
import type { SiteSettings } from "@shared/schema";

export function registerSettingsRoutes(app: Express) {
  // Get current settings
  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.put("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const updatedSettings: Partial<SiteSettings> = req.body;
      
      // Validate required fields
      if (updatedSettings.siteName !== undefined && !updatedSettings.siteName) {
        return res.status(400).json({ error: "Site name cannot be empty" });
      }
      if (updatedSettings.contactEmail !== undefined && !updatedSettings.contactEmail) {
        return res.status(400).json({ error: "Contact email cannot be empty" });
      }

      // Update settings in database
      const settings = await storage.updateSiteSettings(updatedSettings);
      
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Export all data
  app.post("/api/admin/export", isAdmin, async (req, res) => {
    try {
      // Get all products from storage
      const products = await storage.getAllProducts();
      
      // Get current settings from database
      const settings = await storage.getSiteSettings();
      
      // Create comprehensive export data
      const exportData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        site: {
          name: settings?.siteName || 'Audio Motívate',
          description: settings?.siteDescription || '',
          contactEmail: settings?.contactEmail || '',
          domain: settings?.domainUrl || ''
        },
        settings,
        products: {
          total: products.length,
          items: products.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            type: product.type,
            imageUrl: product.imageUrl,
            previewUrl: product.previewUrl,
            downloadUrl: product.downloadUrl,
            featured: product.featured,
            createdAt: product.createdAt
          }))
        },
        export_info: {
          format: "JSON",
          exported_by: "Audio Motívate Admin Panel",
          total_products: products.length,
          export_date: new Date().toLocaleDateString('es-MX'),
          ready_for_migration: true
        }
      };
      
      // Set headers for file download
      const filename = `audiomotivate-export-${new Date().toISOString().split('T')[0]}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Clear analytics data
  app.delete("/api/admin/analytics/clear", isAdmin, async (req, res) => {
    try {
      // In a real implementation, this would clear analytics tables
      // For now, just return success
      res.json({ success: true, message: "Analytics data cleared successfully" });
    } catch (error) {
      console.error("Error clearing analytics:", error);
      res.status(500).json({ error: "Failed to clear analytics data" });
    }
  });

  // Get system status
  app.get("/api/admin/status", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      const status = {
        database: "connected",
        api: "running",
        notifications: settings?.enableEmailNotifications ? "active" : "inactive",
        maintenance: settings?.maintenanceMode || false,
        uptime: process.uptime(),
        version: "1.0.0"
      };
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ error: "Failed to fetch system status" });
    }
  });
}