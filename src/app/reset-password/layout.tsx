import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your Verlano account.",
  robots: "noindex, nofollow",
};

export default function ResetPasswordLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
