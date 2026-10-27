import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/ui/NavBar';
import SyncProvider from '@/components/sync/SyncProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Prep Dashboard',
  description: 'Local-first DSA + Web Dev interview preparation tracker',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Prep Dashboard' },
  icons: { icon: '/icons/prep-192.png', apple: '/icons/prep-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030712',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-gray-950 text-gray-100 min-h-screen`}>
        <SyncProvider>
          <NavBar />
          <main className="pt-16">{children}</main>
        </SyncProvider>
      </body>
    </html>
  );
}
