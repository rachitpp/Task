import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/providers/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Task Management System",
  description: "A comprehensive task management system with real-time updates",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.png",
  },
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="application-name" content="Task Management System" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tasks" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script src="/engine.io.js" defer></script>
      </head>
      <body className={`${inter.className} text-black`}>
        <Providers>
          <div className="min-h-screen bg-gray-50 pb-6">
            {/* Header removed from here - we'll handle it in each page */}
            <main className="overflow-x-hidden relative">
              <div className="page-transition-enter-active">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
