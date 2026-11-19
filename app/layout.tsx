import type {Metadata, Viewport} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://unduh-media.pages.dev'),
  title: 'MEDIA Downloader — Unduh Media dari Media Sosial',
  description:
    'Tempel tautan video atau foto dari TikTok, Instagram, YouTube, dan puluhan platform lain — Media Downloader mengekstrak tautan medianya supaya bisa diunduh langsung. Gratis, tanpa login.',
  manifest: '/manifest.json',
  icons: { icon: '/icon-192.svg', apple: '/icon-192.svg' },
  openGraph: {
    title: 'MEDIA Downloader',
    description:
      'Tempel tautan video atau foto dari media sosial — tautan media aslinya diekstrak supaya bisa diunduh langsung.',
    url: 'https://unduh-media.pages.dev',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Media Downloader — tempel tautan media sosial, ekstrak tautan medianya, unduh langsung.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MEDIA Downloader',
    description:
      'Tempel tautan video atau foto dari media sosial — tautan media aslinya diekstrak supaya bisa diunduh langsung.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MEDIA Downloader',
  },
};

export const viewport: Viewport = {
  themeColor: '#E2E8F0',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#E2E8F0] font-sans text-[#020817] min-h-screen antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
