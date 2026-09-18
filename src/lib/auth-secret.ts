export function getAuthSecret() {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "fallback_secret_for_local_development_only"
  );
}

export function useSecureAuthCookies() {
  if (process.env.VERCEL) return true;
  return Boolean(process.env.NEXTAUTH_URL?.startsWith("https://"));
}
