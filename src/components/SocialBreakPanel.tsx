import { useEffect, useState } from "react";
import { X, ExternalLink, Instagram, Youtube, Facebook, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Platform = "youtube" | "instagram" | "tiktok" | "facebook" | "linkedin";

const PLATFORMS: { id: Platform; label: string; icon: any; color: string; defaultUrl: string }[] = [
  { id: "youtube", label: "YouTube", icon: Youtube, color: "#ff0000", defaultUrl: "https://www.youtube.com/feed/subscriptions" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#e1306c", defaultUrl: "https://www.instagram.com" },
  { id: "tiktok", label: "TikTok", icon: () => <span className="font-bold text-xs">TT</span>, color: "#000000", defaultUrl: "https://www.tiktok.com/foryou" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "#1877f2", defaultUrl: "https://www.facebook.com" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0a66c2", defaultUrl: "https://www.linkedin.com/feed/" },
];

const LOCAL_KEY = "bloomdoro_social_links";

export function SocialBreakPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [active, setActive] = useState<Platform>("youtube");
  const [links, setLinks] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  // Load links
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    setLinks(local);
    if (user) {
      supabase.from("user_settings").select("social_links").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data?.social_links) setLinks({ ...local, ...(data.social_links as Record<string, string>) });
        });
    }
  }, [user]);

  const saveLink = async (platform: Platform, url: string) => {
    const next = { ...links, [platform]: url };
    setLinks(next);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    if (user) {
      await supabase.from("user_settings").upsert(
        { user_id: user.id, social_links: next },
        { onConflict: "user_id" }
      );
    }
  };

  const currentMeta = PLATFORMS.find(p => p.id === active)!;
  const currentUrl = links[active] || currentMeta.defaultUrl;
  const ytId = active === "youtube" ? extractYouTubeId(currentUrl) : null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-1/2 z-[125] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 overflow-x-auto">
          {PLATFORMS.map(p => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => { setActive(p.id); setEditing(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  active === p.id ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-muted"
                }`}
                style={active === p.id ? { backgroundColor: p.color, color: "#fff" } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
            );
          })}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            className="flex-1 w-full border-0"
            title="YouTube"
          />
        ) : active === "youtube" ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Tempelkan link video YouTube di bawah untuk diputar di sini.
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
            <currentMeta.icon className="w-12 h-12" style={{ color: currentMeta.color }} />
            <p className="text-sm text-muted-foreground max-w-xs">
              {currentMeta.label} memblokir embed langsung. Buka di tab baru untuk berinteraksi penuh — sesi timer tetap berjalan.
            </p>
            <Button asChild>
              <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="w-4 h-4" /> Buka {currentMeta.label}
              </a>
            </Button>
          </div>
        )}

        {/* URL editor */}
        <div className="border-t border-border p-3 bg-muted/30">
          {editing ? (
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`URL ${currentMeta.label} favorit...`}
                className="flex-1 h-9 text-sm"
              />
              <Button size="sm" onClick={() => { saveLink(active, draft.trim() || currentMeta.defaultUrl); setEditing(false); }}>Simpan</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Batal</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground truncate flex-1">{currentUrl}</span>
              <Button size="sm" variant="outline" onClick={() => { setDraft(links[active] || ""); setEditing(true); }}>
                Ubah URL
              </Button>
            </div>
          )}
          {!user && (
            <p className="text-[10px] text-muted-foreground/70 mt-1.5">Login untuk menyimpan URL favorit lintas perangkat.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}
