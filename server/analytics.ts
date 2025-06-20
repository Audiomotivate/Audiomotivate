import type { Express } from "express";
import { 
  pageViews, 
  sessions, 
  sales, 
  dailyStats,
  products,
  type PageView,
  type Session,
  type Sale,
  type DailyStats
} from "../shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";

// Middleware to check admin access
export const isAdmin = (req: any, res: any, next: any) => {
  // For now, allow access - you can add proper admin authentication later
  next();
};

export function registerAnalyticsRoutes(app: Express) {
  // Track page view
  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const { sessionId, page, userAgent, referrer, duration } = req.body;
      
      await db.insert(pageViews).values({
        sessionId,
        page,
        userAgent,
        referrer,
        duration
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking page view:", error);
      res.status(500).json({ error: "Failed to track page view" });
    }
  });

  // Track session
  app.post("/api/analytics/session", async (req, res) => {
    try {
      const { sessionId, ip, country, city, totalDuration, pagesVisited } = req.body;
      
      await db.insert(sessions).values({
        sessionId,
        ip,
        country,
        city,
        totalDuration,
        pagesVisited
      }).onConflictDoUpdate({
        target: sessions.sessionId,
        set: {
          totalDuration,
          pagesVisited,
          endTime: new Date()
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking session:", error);
      res.status(500).json({ error: "Failed to track session" });
    }
  });

  // Track sale
  app.post("/api/analytics/sale", async (req, res) => {
    try {
      const { 
        orderId, 
        productId, 
        quantity, 
        unitPrice, 
        totalAmount, 
        paymentMethod, 
        sessionId, 
        customerEmail 
      } = req.body;
      
      await db.insert(sales).values({
        orderId,
        productId,
        quantity,
        unitPrice,
        totalAmount,
        paymentMethod,
        sessionId,
        customerEmail
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking sale:", error);
      res.status(500).json({ error: "Failed to track sale" });
    }
  });

  // Get analytics dashboard data
  app.get("/api/admin/analytics", isAdmin, async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || '7d';
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get total visitors (unique sessions)
      const [{ totalVisitors }] = await db
        .select({ totalVisitors: sql<number>`count(distinct ${sessions.sessionId})` })
        .from(sessions)
        .where(gte(sessions.startTime, startDate));

      // Get total page views
      const [{ totalPageViews }] = await db
        .select({ totalPageViews: sql<number>`count(*)` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, startDate));

      // Get total sales and revenue
      const [salesData] = await db
        .select({ 
          totalSales: sql<number>`coalesce(sum(${sales.totalAmount}), 0)`,
          salesCount: sql<number>`count(*)`
        })
        .from(sales)
        .where(gte(sales.createdAt, startDate));

      // Get average session duration
      const avgSessionResult = await db
        .select({ 
          avgSessionDuration: sql<number>`coalesce(avg(${sessions.totalDuration}), 0)` 
        })
        .from(sessions)
        .where(gte(sessions.startTime, startDate));
      
      const avgSessionDuration = avgSessionResult[0]?.avgSessionDuration || 0;

      // Calculate bounce rate (sessions with only 1 page view)
      const bounceResult = await db
        .select({ bounceCount: sql<number>`count(*)` })
        .from(sessions)
        .where(and(
          gte(sessions.startTime, startDate),
          eq(sessions.pagesVisited, 1)
        ));

      const bounceCount = bounceResult[0]?.bounceCount || 0;
      const bounceRate = totalVisitors > 0 ? Math.round((bounceCount / totalVisitors) * 100) : 0;

      // Get today's stats
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const todayVisitorsResult = await db
        .select({ todayVisitors: sql<number>`count(distinct ${sessions.sessionId})` })
        .from(sessions)
        .where(gte(sessions.startTime, todayStart));
      
      const todayVisitors = todayVisitorsResult[0]?.todayVisitors || 0;

      const todayPageViewsResult = await db
        .select({ todayPageViews: sql<number>`count(*)` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, todayStart));
      
      const todayPageViews = todayPageViewsResult[0]?.todayPageViews || 0;

      const todaySalesResult = await db
        .select({ 
          todaySales: sql<number>`coalesce(sum(${sales.totalAmount}), 0)`,
          todaySalesCount: sql<number>`count(*)`
        })
        .from(sales)
        .where(gte(sales.createdAt, todayStart));
      
      const todaySalesData = todaySalesResult[0] || { todaySales: 0, todaySalesCount: 0 };

      // Get top products
      const topProducts = await db
        .select({
          id: products.id,
          title: products.title,
          salesCount: sql<number>`count(${sales.id})`,
          revenue: sql<number>`sum(${sales.totalAmount})`
        })
        .from(products)
        .leftJoin(sales, eq(products.id, sales.productId))
        .where(gte(sales.createdAt, startDate))
        .groupBy(products.id, products.title)
        .orderBy(desc(sql`count(${sales.id})`))
        .limit(10);

      // Get recent sales
      const recentSales = await db
        .select({
          id: sales.id,
          productTitle: products.title,
          amount: sales.totalAmount,
          customerEmail: sales.customerEmail,
          createdAt: sales.createdAt
        })
        .from(sales)
        .leftJoin(products, eq(sales.productId, products.id))
        .orderBy(desc(sales.createdAt))
        .limit(20);

      // Get top locations
      const topLocations = await db
        .select({
          country: sessions.country,
          city: sessions.city,
          visitors: sql<number>`count(distinct ${sessions.sessionId})`
        })
        .from(sessions)
        .where(and(
          gte(sessions.startTime, startDate),
          sql`${sessions.country} IS NOT NULL`,
          sql`${sessions.city} IS NOT NULL`
        ))
        .groupBy(sessions.country, sessions.city)
        .orderBy(desc(sql`count(distinct ${sessions.sessionId})`))
        .limit(10);

      // Get top pages
      const topPages = await db
        .select({
          page: pageViews.page,
          views: sql<number>`count(*)`
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, startDate))
        .groupBy(pageViews.page)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Mock daily stats for chart (replace with real data later)
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dailyStats.push({
          date: date.toISOString().split('T')[0],
          visitors: Math.floor(Math.random() * 100) + 50,
          sales: Math.floor(Math.random() * 10) + 5,
          revenue: Math.floor(Math.random() * 5000) + 1000
        });
      }

      const analyticsData = {
        totalVisitors: totalVisitors || 0,
        totalPageViews: totalPageViews || 0,
        totalSales: salesData?.totalSales || 0,
        salesCount: salesData?.salesCount || 0,
        avgSessionDuration: Math.round(avgSessionDuration),
        bounceRate,
        todayVisitors,
        todayPageViews,
        todaySales: todaySalesData?.todaySales || 0,
        todaySalesCount: todaySalesData?.todaySalesCount || 0,
        topProducts: topProducts || [],
        dailyStats,
        recentSales: recentSales || [],
        topLocations: topLocations || [],
        topPages: topPages || []
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get sales analytics
  app.get("/api/admin/analytics/sales", isAdmin, async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || '30d';
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Sales by product type
      const salesByType = await db
        .select({
          type: products.type,
          count: sql<number>`count(${sales.id})`,
          revenue: sql<number>`sum(${sales.totalAmount})`
        })
        .from(sales)
        .leftJoin(products, eq(sales.productId, products.id))
        .where(gte(sales.createdAt, startDate))
        .groupBy(products.type);

      // Daily sales
      const dailySales = await db
        .select({
          date: sql<string>`date(${sales.createdAt})`,
          count: sql<number>`count(*)`,
          revenue: sql<number>`sum(${sales.totalAmount})`
        })
        .from(sales)
        .where(gte(sales.createdAt, startDate))
        .groupBy(sql`date(${sales.createdAt})`)
        .orderBy(sql`date(${sales.createdAt})`);

      res.json({
        salesByType: salesByType || [],
        dailySales: dailySales || []
      });
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ error: "Failed to fetch sales analytics" });
    }
  });
}