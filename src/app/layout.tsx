import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Firefly Next - Gestión Financiera Personal",
  description: "Aplicación moderna de gestión financiera personal construida con Next.js 15",
  applicationName: "Firefly Next",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }
    ],
  // Keep default shortcut icon resolution via public/favicon.ico without explicit entry
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#15523a" },
    { media: "(prefers-color-scheme: dark)", color: "#58a686" }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                {/* Simple brand splash while first load */}
                <img src="/logo.png" alt="Firefly Next" className="h-12 w-auto" />
              </div>
            }
          >
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
