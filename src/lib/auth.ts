import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "@/lib/constants";
import { getAuthSecret, useSecureAuthCookies } from "@/lib/auth-secret";

type PasswordCredentials = {
  username?: string;
  email?: string;
  password?: string;
};

async function authorizeAdmin(credentials: PasswordCredentials | undefined) {
  if (!credentials?.username || !credentials?.password) return null;

  try {
    const user = await prisma.adminUser.findUnique({
      where: { username: credentials.username },
    });
    if (!user) return null;
    const valid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!valid) return null;
    return { id: user.id, name: user.username, email: user.email, role: user.role };
  } catch (error) {
    console.error("admin-login authorize failed", error);
    return null;
  }
}

async function authorizeCustomer(credentials: PasswordCredentials | undefined) {
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
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeAdmin,
    }),
    CredentialsProvider({
      id: "customer-login",
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCustomer,
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
    signIn: "/admin/login",
  },
  secret: getAuthSecret(),
};
