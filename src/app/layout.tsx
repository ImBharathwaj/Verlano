import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Container } from "../components/layout/Container";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Analytics } from "@/components/Analytics";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verlano.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Verlano — Luxury within reach",
    template: "%s | Verlano",
  },
  description: "Premium surplus fashion at insider prices.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Verlano",
    title: "Verlano — Luxury within reach",
    description: "Premium surplus fashion at insider prices.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verlano — Luxury within reach",
    description: "Premium surplus fashion at insider prices.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} bg-background text-foreground antialiased`}
      >
        <SessionProvider>
          <CartProvider>
            <Header />
            <Container>{children}</Container>
            <Footer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}


