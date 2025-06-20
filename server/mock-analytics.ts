import type { Express } from "express";
import { db } from "./db";
import { 
  pageViews, 
  sessions, 
  sales, 
  dailyStats,
  products
} from "../shared/schema";

// Generate mock analytics data for demonstration
export async function generateMockAnalyticsData() {
  try {
    console.log("Generating mock analytics data...");
    
    const now = new Date();
    const sessionId = Math.random().toString(36).substring(7) + Date.now().toString();
    
    // Insert sample page views
    await db.insert(pageViews).values([
      {
        sessionId: sessionId + '1',
        page: '/',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referrer: 'https://google.com',
        duration: 45
      },
      {
        sessionId: sessionId + '2',
        page: '/audiolibros',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        referrer: 'https://facebook.com',
        duration: 120
      },
      {
        sessionId: sessionId + '3',
        page: '/audios',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        referrer: 'direct',
        duration: 89
      }
    ]).onConflictDoNothing();

    // Insert sample sessions with diverse Mexican locations
    await db.insert(sessions).values([
      {
        sessionId: sessionId + '1',
        ip: '192.168.1.1',
        country: 'Mexico',
        city: 'Ciudad de México',
        totalDuration: 300,
        pagesVisited: 3
      },
      {
        sessionId: sessionId + '2',
        ip: '192.168.1.2',
        country: 'Mexico',
        city: 'Guadalajara',
        totalDuration: 180,
        pagesVisited: 2
      },
      {
        sessionId: sessionId + '3',
        ip: '192.168.1.3',
        country: 'Mexico',
        city: 'Monterrey',
        totalDuration: 250,
        pagesVisited: 4
      },
      {
        sessionId: sessionId + '4',
        ip: '192.168.1.4',
        country: 'Mexico',
        city: 'Puebla',
        totalDuration: 220,
        pagesVisited: 2
      },
      {
        sessionId: sessionId + '5',
        ip: '192.168.1.5',
        country: 'Mexico',
        city: 'Tijuana',
        totalDuration: 190,
        pagesVisited: 3
      },
      {
        sessionId: sessionId + '6',
        ip: '192.168.1.6',
        country: 'Colombia',
        city: 'Bogotá',
        totalDuration: 280,
        pagesVisited: 3
      },
      {
        sessionId: sessionId + '7',
        ip: '192.168.1.7',
        country: 'Argentina',
        city: 'Buenos Aires',
        totalDuration: 240,
        pagesVisited: 2
      },
      {
        sessionId: sessionId + '8',
        ip: '192.168.1.8',
        country: 'España',
        city: 'Madrid',
        totalDuration: 210,
        pagesVisited: 4
      }
    ]).onConflictDoNothing();

    // Get existing products for sales
    const existingProducts = await db.select().from(products).limit(3);
    
    if (existingProducts.length > 0) {
      // Insert sample sales
      await db.insert(sales).values([
        {
          orderId: 'order_' + Date.now() + '_1',
          productId: existingProducts[0].id,
          quantity: 1,
          unitPrice: existingProducts[0].price,
          totalAmount: existingProducts[0].price,
          paymentMethod: 'stripe',
          sessionId: sessionId + '1',
          customerEmail: 'cliente1@example.com'
        },
        {
          orderId: 'order_' + Date.now() + '_2',
          productId: existingProducts[1] ? existingProducts[1].id : existingProducts[0].id,
          quantity: 1,
          unitPrice: existingProducts[1] ? existingProducts[1].price : existingProducts[0].price,
          totalAmount: existingProducts[1] ? existingProducts[1].price : existingProducts[0].price,
          paymentMethod: 'paypal',
          sessionId: sessionId + '2',
          customerEmail: 'cliente2@example.com'
        }
      ]).onConflictDoNothing();
    }

    // Insert daily stats for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      await db.insert(dailyStats).values({
        date: dateStr,
        totalVisitors: Math.floor(Math.random() * 100) + 20,
        totalPageViews: Math.floor(Math.random() * 300) + 50,
        totalSales: Math.floor(Math.random() * 5000) + 500,
        salesCount: Math.floor(Math.random() * 10) + 1,
        avgSessionDuration: Math.floor(Math.random() * 200) + 60,
        bounceRate: Math.floor(Math.random() * 30) + 20
      }).onConflictDoUpdate({
        target: dailyStats.date,
        set: {
          totalVisitors: Math.floor(Math.random() * 100) + 20,
          totalPageViews: Math.floor(Math.random() * 300) + 50,
          totalSales: Math.floor(Math.random() * 5000) + 500,
          salesCount: Math.floor(Math.random() * 10) + 1,
          avgSessionDuration: Math.floor(Math.random() * 200) + 60,
          bounceRate: Math.floor(Math.random() * 30) + 20
        }
      });
    }

    console.log("Mock analytics data generated successfully!");
  } catch (error) {
    console.error("Error generating mock analytics data:", error);
  }
}

export function registerMockAnalyticsRoute(app: Express) {
  app.post("/api/admin/generate-mock-data", async (req, res) => {
    try {
      await generateMockAnalyticsData();
      res.json({ success: true, message: "Mock analytics data generated" });
    } catch (error) {
      console.error("Error in mock data generation:", error);
      res.status(500).json({ error: "Failed to generate mock data" });
    }
  });
}