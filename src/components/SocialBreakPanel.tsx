import { useEffect, useState } from "react";
import { X, ExternalLink, Instagram, Youtube, Facebook, Linkedin, Heart, MessageCircle, Share2, Play, ThumbsUp, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

type Platform = "instagram" | "youtube" | "tiktok" | "facebook" | "linkedin";

const PLATFORMS: { id: Platform; label: string; icon: any; color: string; originalUrl: string }[] = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#e1306c", originalUrl: "https://www.instagram.com" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "#ff0000", originalUrl: "https://www.youtube.com" },
  { id: "tiktok", label: "TikTok", icon: Music2, color: "#000000", originalUrl: "https://www.tiktok.com" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "#1877f2", originalUrl: "https://www.facebook.com" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0a66c2", originalUrl: "https://www.linkedin.com" },
];

export function SocialBreakPanel({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [active, setActive] = useState<Platform>("instagram");

  useEffect(() => {
    document.body.dataset.socialOpen = "true";
    return () => { delete document.body.dataset.socialOpen; };
  }, []);

  const meta = PLATFORMS.find(p => p.id === active)!;

  return (
    <div
      className="fixed right-0 z-[115] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right md:w-1/3 w-full"
      style={{ top: "var(--nav-h, 72px)", bottom: 0 }}
    >
      {/* Tab bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/60 backdrop-blur">
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
          {PLATFORMS.map(p => {
            const Icon = p.icon;
            const isActive = active === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all flex-shrink-0 ${
                  isActive ? "scale-110 shadow-md" : "hover:scale-105 opacity-70"
                }`}
                style={{ backgroundColor: isActive ? p.color : "hsl(var(--secondary))", color: isActive ? "#fff" : undefined }}
                title={p.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Emulator viewport */}
      <div className="flex-1 overflow-y-auto bg-background">
        {active === "instagram" && <InstagramApp />}
        {active === "youtube" && <YouTubeApp />}
        {active === "tiktok" && <TikTokApp />}
        {active === "facebook" && <FacebookApp />}
        {active === "linkedin" && <LinkedInApp />}
      </div>

      {/* Footer: open original */}
      <div className="border-t border-border p-2 bg-muted/30">
        <Button asChild variant="outline" size="sm" className="w-full gap-2">
          <a href={meta.originalUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
            {t("social_open_original")} — {meta.label}
          </a>
        </Button>
      </div>
    </div>
  );
}

// ============= Mock apps =============
const AVATARS = ["🌸", "🌻", "🌿", "🚀", "☕", "🎨", "🌙", "⭐", "🐱", "🦊"];
const NAMES = ["bloom.dev", "focus.club", "study_with_me", "morning.ritual", "tiny.garden", "code_break", "calm.mind", "rocketkid"];
const CAPTIONS = [
  "Selesai 4 sesi fokus hari ini ✨",
  "Coffee break vibes ☕",
  "Garden update: 12 flowers 🌷",
  "Productive Monday energy",
  "Just shipped a side project 🚀",
  "Reading list for this week 📚",
];

function InstagramApp() {
  return (
    <div className="text-foreground text-sm">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="font-display font-bold italic">Instagram</span>
        <Heart className="w-4 h-4" />
      </div>
      {/* Stories */}
      <div className="flex gap-2 px-3 py-3 overflow-x-auto border-b border-border">
        {AVATARS.slice(0, 6).map((a, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-0.5">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-xl">{a}</div>
            </div>
            <span className="text-[10px] truncate w-14 text-center">{NAMES[i]}</span>
          </div>
        ))}
      </div>
      {/* Posts */}
      {[0,1,2,3].map(i => (
        <article key={i} className="border-b border-border pb-3">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center">{AVATARS[i]}</div>
            <span className="font-semibold text-xs">{NAMES[i % NAMES.length]}</span>
          </div>
          <div className="aspect-square bg-gradient-to-br from-pink-200 via-rose-200 to-orange-200 flex items-center justify-center text-6xl">{AVATARS[(i+2)%AVATARS.length]}</div>
          <div className="flex items-center gap-3 px-3 py-2">
            <Heart className="w-5 h-5" />
            <MessageCircle className="w-5 h-5" />
            <Share2 className="w-5 h-5" />
          </div>
          <div className="px-3 text-xs"><span className="font-semibold">{Math.floor(Math.random()*900)+100}</span> likes</div>
          <div className="px-3 text-xs mt-0.5"><span className="font-semibold">{NAMES[i % NAMES.length]}</span> {CAPTIONS[i % CAPTIONS.length]}</div>
        </article>
      ))}
    </div>
  );
}

function YouTubeApp() {
  const videos = [
    { title: "Lofi Beats — 1 Hour to Focus", channel: "Bloom Studio", views: "1.2M", thumb: "🎧" },
    { title: "How I Use Pomodoro Every Day", channel: "Focus Club", views: "340K", thumb: "⏱️" },
    { title: "10 Min Garden Tour", channel: "Tiny Garden", views: "88K", thumb: "🌷" },
    { title: "Rocket Launch Compilation", channel: "Rocketkid", views: "2.1M", thumb: "🚀" },
    { title: "Calm Morning Routine", channel: "Calm Mind", views: "560K", thumb: "🌅" },
  ];
  return (
    <div className="text-foreground text-sm">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <Youtube className="w-5 h-5 text-red-600" />
        <span className="font-bold">YouTube</span>
      </div>
      {videos.map((v, i) => (
        <div key={i} className="border-b border-border">
          <div className="aspect-video bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-5xl relative">
            {v.thumb}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="flex gap-2 p-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-xs line-clamp-2">{v.title}</p>
              <p className="text-[10px] text-muted-foreground">{v.channel} · {v.views} views</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TikTokApp() {
  const reels = [
    { user: "bloom.dev", text: "POV: kamu lagi fokus 25 menit 🌸", bg: "from-pink-500 to-rose-700", emoji: "🌸" },
    { user: "rocketkid", text: "Roket meluncur! 🚀", bg: "from-indigo-600 to-purple-900", emoji: "🚀" },
    { user: "focus.club", text: "Tips fokus dari saya 🤓", bg: "from-emerald-600 to-teal-900", emoji: "💡" },
  ];
  return (
    <div className="text-foreground">
      {reels.map((r, i) => (
        <div key={i} className={`relative h-[70vh] bg-gradient-to-br ${r.bg} flex items-end p-4 text-white snap-start`}>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-90">TikTok</div>
          <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-30">{r.emoji}</div>
          <div className="relative z-10 max-w-[70%]">
            <p className="font-bold text-sm mb-1">@{r.user}</p>
            <p className="text-xs">{r.text}</p>
          </div>
          <div className="absolute right-3 bottom-6 flex flex-col items-center gap-4 z-10">
            <button className="flex flex-col items-center"><Heart className="w-6 h-6" /><span className="text-[10px]">12K</span></button>
            <button className="flex flex-col items-center"><MessageCircle className="w-6 h-6" /><span className="text-[10px]">340</span></button>
            <button className="flex flex-col items-center"><Share2 className="w-6 h-6" /><span className="text-[10px]">Share</span></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FacebookApp() {
  return (
    <div className="text-foreground text-sm">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <Facebook className="w-5 h-5 text-blue-600" />
        <span className="font-bold">Facebook</span>
      </div>
      {[0,1,2,3].map(i => (
        <article key={i} className="border-b border-border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center">{AVATARS[i]}</div>
            <div>
              <p className="font-semibold text-xs">{NAMES[i % NAMES.length]}</p>
              <p className="text-[10px] text-muted-foreground">2 jam · 🌎</p>
            </div>
          </div>
          <p className="text-xs">{CAPTIONS[i % CAPTIONS.length]}</p>
          <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center text-5xl">{AVATARS[(i+3)%AVATARS.length]}</div>
          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-foreground"><ThumbsUp className="w-3.5 h-3.5" /> Like</button>
            <button className="flex items-center gap-1 hover:text-foreground"><MessageCircle className="w-3.5 h-3.5" /> Comment</button>
            <button className="flex items-center gap-1 hover:text-foreground"><Share2 className="w-3.5 h-3.5" /> Share</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function LinkedInApp() {
  const posts = [
    { name: "Atta Arkarna", title: "Building Bloomdoro", text: "Excited to share that we just shipped the social break panel — a calm space to unwind between focus sessions." },
    { name: "Focus Club", title: "Community", text: "Tip: 25 min focus + 5 min break is great, but try 50/10 if you're in deep work mode." },
    { name: "Tiny Garden", title: "Wellness", text: "Reminder to stretch and look 20 ft away every 20 minutes 👀" },
  ];
  return (
    <div className="text-foreground text-sm">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <Linkedin className="w-5 h-5 text-blue-700" />
        <span className="font-bold">LinkedIn</span>
      </div>
      {posts.map((p, i) => (
        <article key={i} className="border-b border-border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">{p.name.charAt(0)}</div>
            <div>
              <p className="font-semibold text-xs">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.title} · 1d</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed">{p.text}</p>
          <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-foreground"><ThumbsUp className="w-3.5 h-3.5" /> Like</button>
            <button className="flex items-center gap-1 hover:text-foreground"><MessageCircle className="w-3.5 h-3.5" /> Comment</button>
            <button className="flex items-center gap-1 hover:text-foreground"><Share2 className="w-3.5 h-3.5" /> Repost</button>
          </div>
        </article>
      ))}
    </div>
  );
}
