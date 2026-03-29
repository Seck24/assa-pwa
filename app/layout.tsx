import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASSA",
  description: "Votre maquis & bar sous contrôle",
  manifest: "/manifest.json",
  themeColor: "#00A650",
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
      </head>
      <body className="bg-assa-bg text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
