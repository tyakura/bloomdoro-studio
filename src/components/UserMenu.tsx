import { useState, useEffect, ReactNode } from "react";
import { User, LogIn, LogOut, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function UserMenu({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setName(null); return; }
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.display_name || null));
  }, [user]);

  if (loading) return null;

  const initial = (name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Profil"
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-semibold hover:scale-105 transition-transform shadow-sm"
        >
          {user ? initial : <User className="w-5 h-5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 z-[140]">
        {user ? (
          <div className="flex items-center gap-2 pb-3 border-b border-border mb-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">{initial}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{name || user.email?.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="pb-3 border-b border-border mb-2 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">Login untuk pengalaman lebih</span>
            </div>
            <Link to="/auth" onClick={() => setOpen(false)} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">
              <LogIn className="w-3.5 h-3.5" /> Masuk / Daftar
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-1" onClick={() => setOpen(false)}>
          {children}
        </div>

        {user && (
          <button
            onClick={async () => { setOpen(false); await supabase.auth.signOut(); }}
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
