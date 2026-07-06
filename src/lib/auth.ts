import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Using JWT strategy to support session properties easily in middleware & routes
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_google_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_google_secret",
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "localhost",
        port: parseInt(process.env.EMAIL_SERVER_PORT || "2525"),
        auth: {
          user: process.env.EMAIL_SERVER_USER || "",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@hatiyar.in",
    }),
    // Development fallback credentials login for frictionless testing
    CredentialsProvider({
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "developer@hatiyar.in" },
        name: { label: "Name", type: "text", placeholder: "Lead Dev" },
        plan: { label: "Plan Tier", type: "text", placeholder: "free" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        // Find or create the user in database
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || "Lead Dev",
              plan: credentials.plan === "pro" ? "pro" : "free",
            },
          });
        } else if (credentials.plan && credentials.plan !== user.plan) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: credentials.plan === "pro" ? "pro" : "free",
            },
          });
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan || "free";
      }
      
      // Update session updates dynamically (e.g., after subscription webhook updates the DB)
      if (trigger === "update" && session?.plan) {
        token.plan = session.plan;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
