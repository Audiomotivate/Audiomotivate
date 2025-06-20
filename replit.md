# Audio Motívate - Replit.md

## Overview

Audio Motívate is a full-stack e-commerce platform for selling digital motivational content including audiobooks, videos, guides, and PDFs. The application is built as a modern web application with React frontend and Express backend, designed for deployment on Vercel with PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React Context for cart management
- **UI Components**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with TSX for development
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with cookie-based authentication
- **File Structure**: Modular architecture with separate routes, storage, and utilities

### Database Architecture
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Relational design with products, carts, cart items, testimonials, and users tables
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Product Management
- Multi-type product system (audiobook, video, pdf, guide)
- Price management in cents for precise calculations
- Image and preview URL support
- Category-based organization

### Shopping Cart System
- Session-based cart persistence
- Real-time cart updates with React Query
- Cart drawer UI component
- Quantity management and item removal

### User Interface
- Responsive design optimized for mobile and desktop
- Dark/light theme support
- Accessibility features with proper ARIA labels
- Loading states and error handling

### Payment Integration
- Stripe integration for secure payments
- PayPal SDK integration as alternative payment method
- Checkout process with form validation
- Order confirmation and receipt generation

## Data Flow

### Client-Server Communication
1. Frontend makes API requests through TanStack Query
2. Express server processes requests and validates data
3. Drizzle ORM executes database operations
4. Results are returned as JSON responses
5. Frontend updates UI based on server responses

### Cart Management Flow
1. User adds products to cart via AddToCartButton component
2. Cart context updates local state
3. API call persists changes to database
4. Cart drawer updates to reflect new items
5. Checkout process retrieves cart data for payment

### Authentication Flow
- Session-based authentication using Express sessions
- Cookie storage for session persistence
- Protected routes for user-specific data
- Logout clears session and redirects to home

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **State Management**: TanStack Query, React Context
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **Backend**: Express.js, TypeScript, TSX
- **Database**: Drizzle ORM, Neon Database driver
- **Validation**: Zod for schema validation

### Payment Processing
- **Stripe**: @stripe/stripe-js, @stripe/react-stripe-js
- **PayPal**: @paypal/paypal-server-sdk

### Development Tools
- **Build Tools**: Vite, ESBuild
- **Type Checking**: TypeScript compiler
- **Database Tools**: Drizzle Kit for migrations
- **Development Server**: TSX for hot reloading

## Deployment Strategy

### Vercel Deployment
- **Build Process**: Vite builds client-side code to public directory
- **Server Functions**: Express server deployed as Vercel functions
- **Static Assets**: Client files served from public directory
- **Environment Variables**: Database URL, Stripe keys configured in Vercel dashboard

### Database Setup
- **Production Database**: Neon PostgreSQL for production
- **Development**: Local PostgreSQL or Neon for development
- **Migrations**: Automated via Drizzle Kit
- **Seeding**: Production seed scripts for initial data

### Configuration Files
- **vercel.json**: Deployment configuration with build commands
- **Multiple vite configs**: Different configurations for development and production
- **Package.json variants**: Optimized dependency lists for different environments

## Changelog

### June 13, 2025
- Initial project setup with React frontend and Express backend
- Systematic resolution of Vercel build errors through alias import conversion
- Fixed 55+ component files by converting @/ imports to relative paths
- Completed import path corrections for production deployment compatibility
- Restored complete functionality: mobile menu, cart drawer, checkout navigation
- All UI components now use relative imports for Vercel compatibility
- Cart functionality fully operational with add/remove/clear capabilities
- Logo styling restored: "Audio" in yellow, "Motívate" in blue

### June 17, 2025
- Enhanced hero section with increased desktop height (md:h-[30vh])
- Optimized city notification popup: removed "Ver productos" button, auto-hide after 5 seconds
- Improved user experience with cleaner, less intrusive popup design

### June 18, 2025
- Fixed Stripe payment integration: resolved client_secret/clientSecret naming mismatch
- Payment flow now working correctly with test cards (4242 4242 4242 4242)
- Created dedicated order-success page with motivational design and clear next steps
- Updated checkout flow to redirect to confirmation page instead of homepage
- Enhanced post-purchase experience with professional success messaging
- Applied modern carousel layouts to all product sections (audiobooks, videos, guides, PDFs)
- Implemented Spotify-style dark theme for audio preview sections with green accent colors
- Made product titles always visible across homepage carousels for better user experience
- Updated category naming from "Videos de Superación" to "Audios de Superación" with Volume2 icon

### June 19, 2025
- Completely eliminated white screen delays during payment processing
- Implemented step-by-step progress feedback in checkout: "Verificando compra" → "Preparando acceso" → "Finalizando"
- Replaced window.location.replace() with wouter's setLocation() for seamless navigation
- Enhanced checkout UX with animated progress indicators and green checkmark feedback
- Payment flow now shows all processing steps within checkout before smooth transition to success page
- Users experience continuous visual feedback throughout the entire purchase journey
- Fixed ArrowLeft icon import errors across all product category pages (videos, audiobooks, guides, scripts)
- Optimized cart clearing sequence to prevent intermediate empty cart displays
- Simplified footer design by removing product links and implementing clean horizontal layout
- Completed comprehensive payment flow testing with successful cart management
- Created comprehensive admin panel with PostgreSQL database integration for product management
- Built Google Drive integration with automatic URL conversion for 300+ products migration
- Admin panel includes create, edit, delete operations with downloadUrl and isActive fields
- Configured product structure: Audiolibros, Audios (not Videos), Guías, Scripts
- Fixed decimal pricing support (4.99, 19.95) and image URL conversion for Google Drive
- Successfully migrated first real product with working Google Drive links and image display
- Resolved cache issues to ensure new products appear immediately on homepage
- **MILESTONE: First real product migration and purchase flow validation completed**
- Migrated "El Único Audiolibro que Necesitas para Dominar la Energía Cuántica" at $4.99
- Validated complete end-to-end purchase flow: add to cart → checkout → Stripe payment → order success
- **Audio preview system implemented with Dropbox integration** - users can now preview content before purchase
- Enhanced cart UI with larger product images (w-20 h-28) for better visual presentation
- **Badge system implemented** - Dynamic product labels (Premium, Nuevo, etc.) configurable in admin panel
- Badge field added to database schema and all product display components
- Fixed badge field not saving in admin panel - now correctly persists to database
- **Audio preview auto-pause implemented** - Audio automatically pauses when user navigates to different pages
- Enhanced checkout and product detail images with better proportions and object-contain fit
- **System converted to Mexican Pesos (MXN)** - Changed from USD to better serve Mexican/Latin American audience
- Updated all currency formatting, Stripe configuration, and converted existing product prices to MXN
- Currency labels updated throughout platform for transparency
- **Admin panel UX improvement** - Edit button now auto-scrolls to form for better workflow
- **Custom ID field enabled** - Admin can now specify product IDs manually for organized migration
- **Product type terminology updated** - Changed "Videos" to "Audios" throughout platform for better content accuracy
- **Admin panel price field enhanced** - Added MXN currency symbol and Mexican peso formatting with helpful examples
- **Complete analytics dashboard implemented** - Advanced admin panel with metrics, sales tracking, user analytics, and data visualization inspired by modern e-commerce platforms
- **Multi-tab admin interface** - Organized dashboard with separate sections for analytics, product management, and configuration
- **Geographic analytics added** - Traffic section now includes visitor location tracking by country and city for better audience insights
- **Dashboard sections differentiated** - Dashboard shows executive summary, Analytics shows detailed technical metrics
- **Visitor totals prominently displayed** - Total visitor count now visible in both dashboard and analytics headers
- **Complete settings panel implemented** - Site configuration, functionality toggles, data management, and system status monitoring
- **Settings migrated to PostgreSQL database** - All admin configurations now persist permanently in database instead of memory
- **Production deployment preparation completed** - All import paths corrected, build process verified, backup plan ready
- Enhanced product detail benefits section to highlight ad-free experience vs YouTube version
- System ready for bulk migration of remaining 299 products from Wix store

### June 20, 2025
- **Navigation terminology updated** - Changed "Videos" to "Audios" in both desktop and mobile menu navigation for content accuracy
- **Product duration display fixed** - All products now show their actual duration instead of hardcoded "49:30" value
- **Google Drive image URLs corrected** - Applied automatic conversion system to ensure all product images display properly using lh3.googleusercontent.com format
- **Database cleanup completed** - Removed test products while preserving real content and user testimonials
- **Image display system optimized** - All audiolibros and audios sections now show correct product images and durations
- **Search results redesign completed** - Updated search results page to use consistent grid layout matching homepage carousel style with responsive design and optimized image display
- **GitHub migration prepared** - Project cleaned and packaged for professional GitHub repository with comprehensive documentation

## User Preferences

Preferred communication style: Simple, everyday language.
UX Priority: Eliminate white screens and loading delays - users prefer visible progress over blank screens.
Payment Flow: Show all processing steps in checkout interface before navigation to maintain user engagement.