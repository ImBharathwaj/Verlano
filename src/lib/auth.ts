import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user: oauthUser, account }) {
      if (account?.provider !== "google" || !oauthUser.email) return true;

      const email = oauthUser.email.trim().toLowerCase();
      const name = oauthUser.name ?? email.split("@")[0];

      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          name,
          password: null, // OAuth-only user
          emailVerifiedAt: new Date(), // Google-verified
        },
        update: {
          name,
          emailVerifiedAt: new Date(),
        },
      });
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.trim().toLowerCase() },
          select: { id: true },
        });
        if (dbUser) token.userId = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { userId?: string }).userId = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
