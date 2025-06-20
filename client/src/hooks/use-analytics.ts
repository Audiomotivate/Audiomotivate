import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Simple analytics hook to track page views
export function useAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        // Get or create session ID
        let sessionId = localStorage.getItem('analytics_session');
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(7) + Date.now().toString();
          localStorage.setItem('analytics_session', sessionId);
        }

        // Track page view
        await fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            page: location,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          }),
        });

        // Geolocation disabled to prevent errors
        const geoData = {
          country: 'Mexico',
          city: 'Unknown',
          ip: 'Unknown'
        };

        // Update session with geo data
        await fetch('/api/analytics/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            pagesVisited: 1,
            ...geoData,
          }),
        });
      } catch (error) {
        // Silently fail analytics
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [location]);

  // Track time spent on page
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      // Track duration when leaving page
      if (duration > 5) { // Only track if stayed more than 5 seconds
        const sessionId = localStorage.getItem('analytics_session');
        if (sessionId) {
          fetch('/api/analytics/pageview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              page: location,
              duration,
            }),
          }).catch(() => {
            // Silently fail
          });
        }
      }
    };
  }, [location]);
}

// Function to track sales
export function trackSale(saleData: {
  orderId: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: string;
  customerEmail?: string;
}) {
  const sessionId = localStorage.getItem('analytics_session');
  
  fetch('/api/analytics/sale', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...saleData,
      sessionId,
    }),
  }).catch(() => {
    // Silently fail
  });
}