import { PrismaClient } from "@prisma/client";

function serverlessDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || url.startsWith("prisma://") || url.startsWith("prisma+postgres://")) {
    return url;
  }

  const onVercel = Boolean(process.env.VERCEL);
  let next = url;

  // Supabase port 5432 on *.pooler.supabase.com is session mode (max ~15 clients).
  // Vercel lambdas exhaust that immediately; transaction mode is port 6543.
  if (onVercel && next.includes("pooler.supabase.com") && !next.includes(":6543")) {
    next = next.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
    next = next.replace("pooler.supabase.com/", "pooler.supabase.com:6543/");
  }

  const extras: string[] = [];
  if (onVercel && !/[?&]connection_limit=/.test(next)) extras.push("connection_limit=1");
  if (onVercel && !/[?&]connect_timeout=/.test(next)) extras.push("connect_timeout=10");
  if (onVercel && !/[?&]pool_timeout=/.test(next)) extras.push("pool_timeout=10");
  if (
    onVercel &&
    (next.includes("-pooler") || next.includes("pooler.supabase.com")) &&
    !/[?&]pgbouncer=/.test(next)
  ) {
    extras.push("pgbouncer=true");
  }
  if (!extras.length) return next;

  return `${next}${next.includes("?") ? "&" : "?"}${extras.join("&")}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const url = serverlessDatabaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

function getPrismaClient() {
  const existing = globalForPrisma.prisma;
  if (existing && typeof existing.product?.findUnique === "function" && typeof existing.category?.findMany === "function") {
    return existing;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
