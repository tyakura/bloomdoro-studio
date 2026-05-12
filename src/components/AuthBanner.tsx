import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DISMISS_KEY = "bloomdoro_login_banner_dismissed";

export function AuthBanner() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === "1");
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setProfileName(null); return; }
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setProfileName(data?.display_name || null));
  }, [user]);

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="hidden sm:inline">Hi, {profileName || user.email?.split("@")[0]}</span>
        <button onClick={async () => { await supabase.auth.signOut(); }} className="text-xs text-muted-foreground hover:text-foreground ml-1">Keluar</button>
      </div>
    );
  }

  if (dismissed) {
    return (
      <Link to="/auth" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        <LogIn className="w-3.5 h-3.5" /> Masuk
      </Link>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[140] max-w-md w-[calc(100%-2rem)] bg-card border border-primary/30 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <Sparkles className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-foreground">Login untuk pengalaman lebih</p>
        <p className="text-xs text-muted-foreground">Simpan musik, background, ambient & riwayat AI lintas device.</p>
      </div>
      <button onClick={() => navigate("/auth")} className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">Masuk</button>
      <button onClick={() => { sessionStorage.setItem(DISMISS_KEY, "1"); setDismissed(true); }} className="text-xs text-muted-foreground hover:text-foreground">Nanti</button>
      <button onClick={() => { sessionStorage.setItem(DISMISS_KEY, "1"); setDismissed(true); }} className="text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function LoginRequiredOverlay({ children, feature }: { children: React.ReactNode; feature: string }) {
  const { user } = useAuth();
  if (user) return <>{children}</>;
  return (
    <div className="rounded-lg bg-muted/50 border border-dashed border-border p-4 text-center space-y-2">
      <p className="text-sm text-muted-foreground">{feature} tersedia setelah login.</p>
      <Link to="/auth" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">
        <LogIn className="w-3 h-3" /> Masuk untuk pakai
      </Link>
    </div>
  );
}
