import type { Express } from "express";
import { 
  pageViews, 
  sessions as sessionsAnalytics, 
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
  // Track page views
  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const { path } = req.body;
      const sessionId = req.sessionID;
      
      await db.insert(pageViews).values({
        sessionId,
        path: path || req.headers.referer || '/',
        createdAt: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking page view:", error);
      res.json({ success: false });
    }
  });

  // Track sessions
  app.post("/api/analytics/session", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const { userAgent, country, city, latitude, longitude } = req.body;
      
      // Check if session already exists
      const existingSession = await db
        .select()
        .from(sessionsAnalytics)
        .where(eq(sessionsAnalytics.sessionId, sessionId))
        .limit(1);

      if (existingSession.length === 0) {
        await db.insert(sessionsAnalytics).values({
          sessionId,
          userAgent: userAgent || req.headers['user-agent'] || '',
          country: country || 'Unknown',
          city: city || 'Unknown',
          latitude: latitude || null,
          longitude: longitude || null,
          startTime: new Date()
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking session:", error);
      res.json({ success: false });
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
      console.log("Analytics request for timeRange:", timeRange);
      
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

      console.log("Start date for query:", startDate.toISOString());

      // Get total visitors (unique sessions)
      const [{ totalVisitors }] = await db
        .select({ totalVisitors: sql<number>`count(distinct ${sessionsAnalytics.sessionId})` })
        .from(sessionsAnalytics)
        .where(gte(sessionsAnalytics.startTime, startDate));

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
          avgSessionDuration: sql<number>`coalesce(avg(${sessionsAnalytics.totalDuration}), 0)` 
        })
        .from(sessionsAnalytics)
        .where(gte(sessionsAnalytics.startTime, startDate));
      
      const avgSessionDuration = avgSessionResult[0]?.avgSessionDuration || 0;

      // Calculate bounce rate (sessions with only 1 page view)
      const bounceResult = await db
        .select({ bounceCount: sql<number>`count(*)` })
        .from(sessionsAnalytics)
        .where(and(
          gte(sessionsAnalytics.startTime, startDate),
          eq(sessionsAnalytics.pagesVisited, 1)
        ));

      const bounceCount = bounceResult[0]?.bounceCount || 0;
      const bounceRate = totalVisitors > 0 ? Math.round((bounceCount / totalVisitors) * 100) : 0;

      // Get today's stats
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const todayVisitorsResult = await db
        .select({ todayVisitors: sql<number>`count(distinct ${sessionsAnalytics.sessionId})` })
        .from(sessionsAnalytics)
        .where(gte(sessionsAnalytics.startTime, todayStart));
      
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
          country: sessionsAnalytics.country,
          city: sessionsAnalytics.city,
          visitors: sql<number>`count(distinct ${sessionsAnalytics.sessionId})`
        })
        .from(sessionsAnalytics)
        .where(and(
          gte(sessionsAnalytics.startTime, startDate),
          sql`${sessionsAnalytics.country} IS NOT NULL`,
          sql`${sessionsAnalytics.city} IS NOT NULL`
        ))
        .groupBy(sessionsAnalytics.country, sessionsAnalytics.city)
        .orderBy(desc(sql`count(distinct ${sessionsAnalytics.sessionId})`))
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
        todaySales: todaySales.toString(),
        todaySalesCount,
        topProducts,
        dailyStats: [], // TODO: implement daily stats
        recentSales: [], // TODO: implement recent sales
        topLocations,
        topPages
      });

      // Get total page views
      const [{ totalPageViews }] = await db
        .select({ totalPageViews: sql<number>`count(*)` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, startDate));

      // Get sales data for the period
      const [{ totalSales, salesCount }] = await db
        .select({ 
          totalSales: sql<number>`coalesce(sum(${sales.totalAmount}), 0)`,
          salesCount: sql<number>`count(${sales.id})`
        })
        .from(sales)
        .where(gte(sales.createdAt, startDate));

      // Get today's data
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [{ todayVisitors }] = await db
        .select({ todayVisitors: sql<number>`count(distinct ${sessionsAnalytics.sessionId})` })
        .from(sessionsAnalytics)
        .where(gte(sessionsAnalytics.startTime, todayStart));

      const [{ todayPageViews }] = await db
        .select({ todayPageViews: sql<number>`count(*)` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, todayStart));

      const [{ todaySales, todaySalesCount }] = await db
        .select({ 
          todaySales: sql<number>`coalesce(sum(${sales.totalAmount}), 0)`,
          todaySalesCount: sql<number>`count(${sales.id})`
        })
        .from(sales)
        .where(gte(sales.createdAt, todayStart));

      // Calculate avg session duration (mock data for now)
      const avgSessionDuration = 273; // seconds
      const bounceRate = 42; // percentage

      // Get top products
      const topProducts = await db
        .select({
          id: products.id,
          title: products.title,
          salesCount: sql<number>`count(${sales.id})`,
          revenue: sql<number>`coalesce(sum(${sales.totalAmount}), 0)`
        })
        .from(products)
        .leftJoin(sales, eq(products.id, sales.productId))
        .where(gte(sales.createdAt, startDate))
        .groupBy(products.id, products.title)
        .orderBy(sql`count(${sales.id}) desc`)
        .limit(5);

      // Get top locations (mock data)
      const topLocations = [
        { country: "México", city: "Ciudad de México", visitors: Math.floor(totalVisitors * 0.4) },
        { country: "Colombia", city: "Bogotá", visitors: Math.floor(totalVisitors * 0.2) },
        { country: "Argentina", city: "Buenos Aires", visitors: Math.floor(totalVisitors * 0.15) }
      ];

      // Get top pages
      const topPages = await db
        .select({
          page: pageViews.path,
          views: sql<number>`count(*)`
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, startDate))
        .groupBy(pageViews.path)
        .orderBy(sql`count(*) desc`)
        .limit(5);

      res.json({
        totalVisitors: totalVisitors.toString(),
        totalPageViews: totalPageViews.toString(),
        totalSales: totalSales.toString(),
        salesCount: salesCount,
        avgSessionDuration,
        bounceRate,
        todayVisitors,
        todayPageViews,
        todaySales: todaySales.toString(),
        todaySalesCount,
        topProducts,
        dailyStats: [], // TODO: implement daily stats
        recentSales: [], // TODO: implement recent sales
        topLocations,
        topPages
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get detailed analytics
  app.get("/api/admin/analytics/detailed", isAdmin, async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || '7d';
      console.log("Detailed analytics request for timeRange:", timeRange);
      
      // Get actual hourly stats from database
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

      // Get hourly statistics from database
      const hourlyStats = await db
        .select({
          hour: sql<string>`EXTRACT(HOUR FROM ${pageViews.createdAt})`,
          visitors: sql<number>`count(distinct ${pageViews.sessionId})`,
          views: sql<number>`count(*)`
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, startDate))
        .groupBy(sql`EXTRACT(HOUR FROM ${pageViews.createdAt})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${pageViews.createdAt})`);

      // Create 24-hour array with actual data
      const hourlyStatsFormatted = Array.from({ length: 24 }, (_, i) => {
        const hourData = hourlyStats.find(h => parseInt(h.hour) === i);
        return {
          hour: `${i.toString().padStart(2, '0')}:00`,
          visitors: hourData?.visitors || 0,
          sales: Math.floor((hourData?.visitors || 0) * 0.05) // Approximate 5% conversion
        };
      });

      // Get basic stats for the period
      const [{ totalVisitors }] = await db
        .select({ totalVisitors: sql<number>`count(distinct ${sessionsAnalytics.sessionId})` })
        .from(sessionsAnalytics)
        .where(gte(sessionsAnalytics.startTime, startDate));
      
      const detailedData = {
        hourlyStats: hourlyStatsFormatted,
        deviceStats: [
          { device: 'Desktop', percentage: 65, visitors: Math.floor(totalVisitors * 0.65) },
          { device: 'Mobile', percentage: 28, visitors: Math.floor(totalVisitors * 0.28) },
          { device: 'Tablet', percentage: 7, visitors: Math.floor(totalVisitors * 0.07) }
        ],
        browserStats: [
          { browser: 'Chrome', percentage: 68, visitors: Math.floor(totalVisitors * 0.68) },
          { browser: 'Safari', percentage: 18, visitors: Math.floor(totalVisitors * 0.18) },
          { browser: 'Firefox', percentage: 9, visitors: Math.floor(totalVisitors * 0.09) },
          { browser: 'Edge', percentage: 5, visitors: Math.floor(totalVisitors * 0.05) }
        ],
        countryStats: [
          { country: 'México', visitors: Math.floor(totalVisitors * 0.6), sales: Math.floor(totalVisitors * 0.03), revenue: Math.floor(totalVisitors * 520) },
          { country: 'Colombia', visitors: Math.floor(totalVisitors * 0.25), sales: Math.floor(totalVisitors * 0.015), revenue: Math.floor(totalVisitors * 425) },
          { country: 'Argentina', visitors: Math.floor(totalVisitors * 0.15), sales: Math.floor(totalVisitors * 0.01), revenue: Math.floor(totalVisitors * 390) }
        ]
      };

      res.json(detailedData);
    } catch (error) {
      console.error("Error fetching detailed analytics:", error);
      res.status(500).json({ error: "Failed to fetch detailed analytics" });
    }
  });
}