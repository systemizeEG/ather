"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";
import { adminSignIn } from "@/app/actions/admin-auth";
import { useTranslation } from "@/components/TranslationProvider";

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AUTH_TIMEOUT")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await withTimeout(adminSignIn(username, password), 15000);

      if (!res.success) {
        setError(t.admin.loginError);
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError(t.admin.loginTimeout);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-background/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background to-background z-0"></div>

      <div className="container px-4 relative z-10 w-full max-w-md mx-auto">
        <FadeIn>
          <div className="treasure-frame rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-6 text-gold border border-gold/40">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t.admin.loginTitle}</h1>
              <p className="text-muted-foreground text-sm">{t.admin.loginDesc}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                  {t.admin.loginIdentifier}
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-background border-border/50"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                  {t.admin.formPassword}
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-border/50"
                  dir="ltr"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full mt-2" variant="glow" isLoading={loading}>
                {t.admin.loginCta}
              </Button>
            </form>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
