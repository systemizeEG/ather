"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/TranslationProvider";

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("customer-login", {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error || !res.ok) {
        setError(t.auth.loginError);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const nextPath = session?.user?.role === "CANDIDATE" ? "/candidate" : "/store";
      window.location.assign(nextPath);
    } catch {
      setError(t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="pt-28 pb-32 min-h-screen flex items-center justify-center bg-background/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background z-0"></div>

      <div className="container px-4 relative z-10 w-full max-w-md mx-auto">
        <FadeIn>
          <div className="treasure-frame rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-6 text-gold border border-gold/40">
                <User className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t.auth.loginTitle}</h1>
              <p className="text-muted-foreground text-sm">{t.auth.loginDesc}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">{t.auth.email}</label>
                <div className="relative">
                  <Mail className="absolute end-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background border-border/50 pe-10"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">{t.auth.password}</label>
                <div className="relative">
                  <Lock className="absolute end-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background border-border/50 pe-10"
                    dir="ltr"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full mt-2" variant="glow" isLoading={loading}>
                {t.auth.loginCta}
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  {t.auth.noAccount}{" "}
                  <Link href="/register" className="text-gold-deep hover:underline font-medium">
                    {t.auth.createAccount}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
