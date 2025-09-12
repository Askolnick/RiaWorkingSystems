import './globals.css';
import AppLayout from './_components/AppLayout';
import PWARegistration from './_components/PWARegistration';

// Root layout metadata for PWA
export const metadata = {
  title: 'RIA Management Software',
  description: 'Comprehensive business management platform',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

// Viewport configuration (Next.js 14+ requires separate export)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
};

// Root layout for the public and portal routes. This wraps all pages with a
// consistent background and text color based on the design tokens (bg and text).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RIA Management" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-bg text-text">
        <AppLayout>
          {children}
        </AppLayout>
        <PWARegistration />
      </body>
    </html>
  );
}