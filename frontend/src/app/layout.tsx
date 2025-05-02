import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/providers/Providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header removed from here - we'll handle it in each page */}
            <main className="overflow-x-hidden pb-6 relative">
              <div className="page-transition-enter-active">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
