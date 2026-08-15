import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Clima histórico — AEMET',
  description: 'Consulta los datos climáticos históricos de cualquier población española',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      {...mantineHtmlProps}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className="flex min-h-full flex-col">
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
