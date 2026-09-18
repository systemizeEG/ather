import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { USER_ROLES, ADMIN_ROLES } from "@/lib/constants";
import { getAuthSecret, useSecureAuthCookies } from "@/lib/auth-secret";

type PasswordCredentials = {
  email?: string;
  password?: string;
};

async function authorizeStoreUser(credentials: PasswordCredentials | undefined) {
  if (!credentials?.email || !credentials?.password) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });
    if (!user) return null;
    const valid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!valid) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || USER_ROLES.CUSTOMER,
    };
  } catch (error) {
    console.error("customer-login authorize failed", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "customer-login",
      name: "Store Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeStoreUser,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  useSecureCookies: useSecureAuthCookies(),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      if (token.role === ADMIN_ROLES.ADMIN || token.role === ADMIN_ROLES.SUPERADMIN) {
        delete token.role;
        delete token.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: getAuthSecret(),
};
