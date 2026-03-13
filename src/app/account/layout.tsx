import { redirect } from "next/navigation";
import { getCurrentUserFromContext } from "@/lib/customer-auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserFromContext();
  if (!user) {
    redirect("/login?redirect=/account");
  }
  return <>{children}</>;
}
