import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASSA",
  description: "Votre maquis & bar sous contrôle",
  manifest: "/manifest.json",
  themeColor: "#00e676",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ASSA",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-assa-surface text-assa-on-surface min-h-screen font-body">
        {children}
      </body>
    </html>
  );
}
