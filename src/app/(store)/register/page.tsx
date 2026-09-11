"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus, User, Mail, Lock, Phone } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ أثناء التسجيل");
      }

      // Auto login after registration
      const signInRes = await signIn("customer-login", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/store");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
                <UserPlus className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">إنشاء حساب جديد</h1>
              <p className="text-muted-foreground text-sm">انضم إلينا الآن للتمتع بتجربة تسوق أسهل.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">الاسم بالكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    name="name"
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="bg-background border-border/50 pr-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">رقم الهاتف <span className="text-xs text-muted-foreground/50">(اختياري)</span></label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    name="phone"
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="bg-background border-border/50 pr-10"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="email"
                    name="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="bg-background border-border/50 pr-10"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="password" 
                    name="password"
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    className="bg-background border-border/50 pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center mt-2">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full mt-4" variant="glow" isLoading={loading}>
                إنشاء حساب
              </Button>
              
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/login" className="text-gold-deep hover:underline font-medium">
                    تسجيل الدخول
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
