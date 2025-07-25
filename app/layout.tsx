import type { Metadata } from 'next';
import { IBM_Plex_Serif } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

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
      <body className={`${ibmPlexSerif.variable} antialiased overflow-hidden h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
