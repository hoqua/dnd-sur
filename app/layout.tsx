import type { Metadata } from 'next';
import { IBM_Plex_Serif } from 'next/font/google';

import './globals.css';
import { Providers } from '@/components/providers';

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chat-sdk.vercel.app'),
  title: 'Adventure Realm',
  description: 'AI-powered roguelike adventure game',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlexSerif.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
