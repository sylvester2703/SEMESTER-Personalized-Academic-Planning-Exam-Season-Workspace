import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SEMESTER — Exam Season Planner',
  description:
    'Make a plan. Find your focus. Walk in prepared. One thoughtful workspace for university exam dates, daily study sessions, revision readiness, and focus. Free for students.',
  keywords: ['exam planner', 'study schedule', 'university exam prep', 'student productivity', 'revision tracker'],
  authors: [{ name: 'SEMESTER Student Team' }],
  openGraph: {
    title: 'SEMESTER — Exam Season Planner',
    description: 'Make a plan. Find your focus. Walk in prepared.',
    url: 'https://semester-planner.vercel.app',
    siteName: 'SEMESTER',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#F7F5EF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="font-sans min-h-screen bg-paper-100 dark:bg-paper-950 text-ink-900 dark:text-ink-50 selection:bg-forest selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
