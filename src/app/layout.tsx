import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Container } from "../components/layout/Container";
import { CartProvider } from "@/contexts/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Verlano — Luxury within reach",
  description: "Premium surplus fashion at insider prices.",
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
        <CartProvider>
          <Header />
          <Container>{children}</Container>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}


