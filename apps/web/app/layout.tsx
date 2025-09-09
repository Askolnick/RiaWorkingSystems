import './globals.css';

// Root layout for the public and portal routes. This wraps all pages with a
// consistent background and text color based on the design tokens (bg and text).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text">
        {children}
      </body>
    </html>
  );
}