import Navigation from "@/components/navigation";

import { GeistSans } from "geist/font/sans";

import "./globals.css";

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground grid grid-rows-[auto_1fr_auto] min-h-svh">
        <Navigation />
        <main className="px-5 mt-36 md:mt-28">{children}</main>
      </body>
    </html>
  );
}
