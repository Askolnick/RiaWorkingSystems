// Route configuration and utilities for the application
// This centralizes route definitions and provides utilities for dynamic routing

export const ROUTES = {
  // Public routes
  HOME: '/',
  
  // Auth routes
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  
  // Portal routes
  PORTAL: '/portal',
  
  // Module routes
  MESSAGING: '/messaging',
  TASKS: '/tasks',
  LIBRARY: '/library',
  LIBRARY_WIKI: '/library/wiki',
  LIBRARY_LEARNING: '/library/learning',
  LIBRARY_UPLOADS: '/library/uploads',
  INSIGHTS: '/insights',
  FINANCE: '/finance',
  FINANCE_INVOICES: '/finance/invoices',
  FINANCE_BILLS: '/finance/bills',
  FINANCE_EXPENSES: '/finance/expenses',
  FINANCE_BALANCE_SHEET: '/finance/balance-sheet',
  PRODUCT: '/product',
  CAMPAIGNS: '/campaigns',
  ADMIN: '/admin',
  SETTINGS: '/settings',
} as const;

// Type for route keys
export type RouteKey = keyof typeof ROUTES;

// Type for route values
export type RouteValue = typeof ROUTES[RouteKey];

// Route builder utility - can be extended for dynamic base URLs
export class RouteBuilder {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Build a full URL with the base URL
  build(route: RouteValue): string {
    return `${this.baseUrl}${route}`;
  }

  // Get the route without base URL (for Next.js router)
  route(route: RouteValue): string {
    return route;
  }

  // Update base URL if needed
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }
}

// Default route builder instance
export const routes = new RouteBuilder();

// Helper function to get a route
export const getRoute = (route: RouteValue): string => routes.route(route);

// Helper function to build full URL
export const buildUrl = (route: RouteValue): string => routes.build(route);