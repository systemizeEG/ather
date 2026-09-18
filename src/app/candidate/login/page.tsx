"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Lock, Mail } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/components/TranslationProvider";
import { USER_ROLES } from "@/lib/constants";

export default function CandidateLoginPage() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === USER_ROLES.CANDIDATE) {
      window.location.assign("/candidate");
    }
  }, [session, status]);

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
      const nextSession = await sessionRes.json();
      if (nextSession?.user?.role !== USER_ROLES.CANDIDATE) {
        await signOut({ redirect: false });
        setError(t.candidateDash.loginNotCandidate);
        return;
      }

      window.location.assign("/candidate");
    } catch {
      setError(t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-background/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background z-0" />

      <div className="absolute top-4 end-4 z-20">
        <LanguageSwitcher variant="segmented" className="w-36" />
      </div>

      <div className="container px-4 relative z-10 w-full max-w-md mx-auto">
        <FadeIn>
          <div className="treasure-frame rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

            <div className="text-center mb-8">
              <img src="/logo.png" alt="" className="h-14 w-auto mx-auto mb-5 object-contain" />
              <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-6 text-gold border border-gold/40">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t.candidateDash.loginTitle}</h1>
              <p className="text-muted-foreground text-sm">{t.candidateDash.loginDesc}</p>
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
                    autoComplete="email"
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
                    autoComplete="current-password"
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

              <p className="text-center text-xs text-muted-foreground pt-2">{t.candidateDash.loginHint}</p>
            </form>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
