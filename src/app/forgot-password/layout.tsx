import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Verlano account password.",
  robots: "noindex, nofollow",
};

export default function ForgotPasswordLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
