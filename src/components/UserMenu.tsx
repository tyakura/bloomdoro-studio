import { useState, useEffect } from "react";
import { User, LogIn, Flower2, History, Settings as SettingsIcon, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UserMenuProps {
  onOpenSettings: () => void;
  onOpenGarden: () => void;
  onOpenHistory: () => void;
  avatarUrl?: string | null;
  displayName?: string | null;
}

export function UserMenu({ onOpenSettings, onOpenGarden, onOpenHistory, avatarUrl, displayName }: UserMenuProps) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return null;

  const initial = (displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Profil"
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-semibold hover:scale-105 transition-transform shadow-sm overflow-hidden"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : user ? initial : <User className="w-5 h-5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 z-[140]">
        {user ? (
          <div className="flex items-center gap-2 pb-3 border-b border-border mb-2">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName || user.email?.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="pb-3 border-b border-border mb-2 space-y-2">
            <p className="text-sm font-medium">Login untuk pengalaman lebih</p>
            <Link to="/auth" onClick={() => setOpen(false)} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">
              <LogIn className="w-3.5 h-3.5" /> Masuk / Daftar
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <button
            onClick={() => { setOpen(false); onOpenGarden(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm text-left"
          >
            <Flower2 className="w-4 h-4" /> Taman Bunga
          </button>
          <button
            onClick={() => { setOpen(false); onOpenHistory(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm text-left"
          >
            {user ? <History className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />} Riwayat AI
          </button>
          <button
            onClick={() => { setOpen(false); onOpenSettings(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm text-left"
          >
            <SettingsIcon className="w-4 h-4" /> Pengaturan
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
