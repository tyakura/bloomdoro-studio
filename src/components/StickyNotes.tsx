import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, X, GripVertical, StickyNote as StickyIcon, Image as ImageIcon, Sparkles, Send, Upload, Loader2, Link as LinkIcon, MessageSquare, Search, Code2, Copy, Check, Paperclip, FileText, Trash2, Instagram, Youtube, Music2, Facebook, Linkedin, Share2 } from "lucide-react";
import { openSocialPopup, SocialPlatform } from "@/lib/socialPopup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { upsertChatEntry, ChatHistoryEntry } from "@/components/ChatHistory";

import { useLang } from "@/lib/i18n";
import { loadJSON, saveJSON, toDataURL } from "@/lib/persist";

type ChatMode = "talk" | "riset" | "coding";

type NoteType = "sticky" | "media" | "ai";

interface BaseNote {
  id: string;
  type: NoteType;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StickyNote extends BaseNote {
  type: "sticky";
  title: string;
  description: string;
  date: string;
  color: string;
}

interface MediaNote extends BaseNote {
  type: "media";
  mediaUrl: string;
  kind: "image" | "video" | "youtube";
  date: string;
}

interface ChatAttachment { name: string; type: string; dataUrl?: string; text?: string }
interface ChatMsg { role: "user" | "assistant"; content: string; attachments?: ChatAttachment[] }

interface AiNote extends BaseNote {
  type: "ai";
  messages: ChatMsg[];
  mode: ChatMode;
  sessionId: string;
}

type AnyNote = StickyNote | MediaNote | AiNote;

const COLOR_SWATCHES = [
  { bg: "#fef9c3", border: "#fde047", class: "bg-yellow-100 border-yellow-300 text-yellow-900" },
  { bg: "#fce7f3", border: "#f9a8d4", class: "bg-pink-100 border-pink-300 text-pink-900" },
  { bg: "#dbeafe", border: "#93c5fd", class: "bg-blue-100 border-blue-300 text-blue-900" },
  { bg: "#dcfce7", border: "#86efac", class: "bg-green-100 border-green-300 text-green-900" },
  { bg: "#f3e8ff", border: "#d8b4fe", class: "bg-purple-100 border-purple-300 text-purple-900" },
];

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

const isLightColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

const NOTES_KEY = "bloomdoro_notes";

export function StickyNotes({ onTalkWithAI }: { onTalkWithAI?: () => void } = {}) {
  const { t } = useLang();
  const [notes, setNotes] = useState<AnyNote[]>(() => loadJSON<AnyNote[]>(NOTES_KEY, []));
  const [menuOpen, setMenuOpen] = useState(false);
  const [creating, setCreating] = useState<NoteType | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  // Persist all notes
  useEffect(() => { saveJSON(NOTES_KEY, notes); }, [notes]);

  // Listen for "continue chat from history" event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ChatHistoryEntry>).detail;
      if (!detail) return;
      setNotes(prev => {
        // If a note with this sessionId already exists, just bring it to focus (re-add nothing)
        if (prev.some(n => n.type === "ai" && n.sessionId === detail.id)) return prev;
        const aiNote: AiNote = {
          id: crypto.randomUUID(), type: "ai",
          mode: "talk", sessionId: detail.id,
          messages: detail.messages as ChatMsg[],
          x: 160 + Math.random() * 80, y: 100,
          width: 380, height: 480,
        };
        return [...prev, aiNote];
      });
    };
    window.addEventListener("bloomdoro:continue-chat", handler as EventListener);
    return () => window.removeEventListener("bloomdoro:continue-chat", handler as EventListener);
  }, []);


  // Drag (clamps so max 1/4 of element can leave each side; top clamped below the app header on desktop)
  const handlePointerDown = useCallback((e: React.PointerEvent, id: string) => {
    e.preventDefault();
    const el = (e.target as HTMLElement).closest("[data-note-id]") as HTMLElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const header = document.querySelector("[data-app-header]") as HTMLElement | null;
    const minY = isDesktop ? (header ? header.getBoundingClientRect().bottom + 4 : 80) : 0;
    const elW = rect.width;
    const elH = rect.height;
    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current; if (!d) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let nextX = ev.clientX - d.offsetX;
      let nextY = Math.max(minY, ev.clientY - d.offsetY);
      // Limit each side to at most 1/4 of element off-screen
      const minX = -elW / 4;
      const maxX = vw - (elW * 3) / 4;
      const maxY = vh - (elH * 3) / 4;
      nextX = Math.min(Math.max(minX, nextX), maxX);
      nextY = Math.min(nextY, maxY);
      setNotes(prev => prev.map(n => n.id === d.id ? { ...n, x: nextX, y: nextY } : n));
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
  }, []);

  // Resize
  const handleResizeDown = useCallback((e: React.PointerEvent, n: AnyNote) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { id: n.id, startX: e.clientX, startY: e.clientY, startW: n.width, startH: n.height };
    const onMove = (ev: PointerEvent) => {
      const r = resizeRef.current; if (!r) return;
      const w = Math.max(160, r.startW + (ev.clientX - r.startX));
      const h = Math.max(120, r.startH + (ev.clientY - r.startY));
      setNotes(prev => prev.map(nn => nn.id === r.id ? { ...nn, width: w, height: h } : nn));
    };
    const onUp = () => { resizeRef.current = null; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
  }, []);


  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const addStickyNote = (note: Omit<StickyNote, "id" | "type" | "x" | "y" | "width" | "height" | "date">) => {
    setNotes(prev => [...prev, {
      ...note, id: crypto.randomUUID(), type: "sticky", date: today,
      x: 100 + Math.random() * 200, y: 100 + Math.random() * 200,
      width: 220, height: 0,
    }]);
  };

  const addMediaNote = (mediaUrl: string, kind: "image" | "video" | "youtube") => {
    setNotes(prev => [...prev, {
      id: crypto.randomUUID(), type: "media", mediaUrl, kind, date: today,
      x: 120 + Math.random() * 200, y: 120 + Math.random() * 200,
      width: 320, height: 240,
    } as MediaNote]);
  };

  const addAiNote = () => {
    setNotes(prev => [...prev, {
      id: crypto.randomUUID(), type: "ai",
      mode: "talk" as ChatMode,
      sessionId: crypto.randomUUID(),
      messages: [{ role: "assistant", content: t("ai_greet") }],
      x: 140 + Math.random() * 100, y: 100,
      width: 380, height: 480,
    } as AiNote]);
  };

  const updateAiMessages = (id: string, msgs: ChatMsg[]) => {
    setNotes(prev => prev.map(n => n.id === id && n.type === "ai" ? { ...n, messages: msgs } : n));
  };

  const updateAiMode = (id: string, mode: ChatMode) => {
    setNotes(prev => prev.map(n => n.id === id && n.type === "ai" ? { ...n, mode } : n));
  };

  return (
    <>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onPointerDown={handlePointerDown}
          onDelete={deleteNote}
          onResizeDown={handleResizeDown}
          onAiUpdate={updateAiMessages}
          onAiModeChange={updateAiMode}
        />
      ))}

      {creating === "sticky" && <StickyCreator today={today} onClose={() => setCreating(null)} onSave={addStickyNote} />}
      {creating === "media" && <MediaCreator onClose={() => setCreating(null)} onSave={(u, k) => { addMediaNote(u, k); setCreating(null); }} />}

      {/* FAB menu */}
      {menuOpen && (
        <div className="fixed bottom-24 right-6 z-[55] flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
          <FabItem icon={StickyIcon} label={t("sticky_note")} onClick={() => { setCreating("sticky"); setMenuOpen(false); }} />
          <FabItem icon={ImageIcon} label={t("media")} onClick={() => { setCreating("media"); setMenuOpen(false); }} />
          <FabItem icon={Sparkles} label={t("talk_with_ai")} badge={t("new_badge")} onClick={() => { if (onTalkWithAI) onTalkWithAI(); else addAiNote(); setMenuOpen(false); }} />
        </div>
      )}

      <button
        onClick={() => setMenuOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[56] w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl flex items-center justify-center transition-all hover:scale-110"
        style={{ transform: menuOpen ? "rotate(45deg)" : undefined }}
      >
        <Plus className="w-7 h-7" />
      </button>
    </>
  );
}

function FabItem({ icon: Icon, label, onClick, badge }: { icon: any; label: string; onClick: () => void; badge?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-card border border-border shadow-lg hover:bg-accent transition-colors text-sm font-medium text-foreground"
    >
      <Icon className="w-4 h-4 text-primary" />
      <span>{label}</span>
      {badge && (
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

// ============ Note Card renderer ============
function NoteCard({ note, onPointerDown, onDelete, onResizeDown, onAiUpdate, onAiModeChange }: {
  note: AnyNote;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onDelete: (id: string) => void;
  onResizeDown: (e: React.PointerEvent, n: AnyNote) => void;
  onAiUpdate: (id: string, msgs: ChatMsg[]) => void;
  onAiModeChange: (id: string, mode: ChatMode) => void;
}) {
  const baseStyle: React.CSSProperties = { left: note.x, top: note.y, width: note.width, height: note.height || undefined };

  if (note.type === "sticky") {
    let cls = "border-2";
    let style: React.CSSProperties = { ...baseStyle };
    if (note.color.startsWith("custom:")) {
      const hex = note.color.replace("custom:", "");
      style = { ...style, backgroundColor: hex, borderColor: hex, color: isLightColor(hex) ? "#1a1a1a" : "#ffffff" };
    } else {
      cls = note.color;
    }
    return (
      <div
        data-note-id={note.id}
        className={`fixed z-40 rounded-lg shadow-lg p-3 cursor-grab active:cursor-grabbing select-none touch-none ${cls}`}
        style={style}
        onPointerDown={(e) => onPointerDown(e, note.id)}
      >
        <NoteHeader date={note.date} onDelete={() => onDelete(note.id)} />
        <h4 className="font-bold text-sm leading-tight mb-1">{note.title}</h4>
        {note.description && (
          <p className="text-xs opacity-75 leading-snug whitespace-pre-wrap break-words">{note.description}</p>
        )}
        <ResizeHandle onMouseDown={(e) => onResizeDown(e, note)} />
      </div>
    );
  }

  if (note.type === "media") {
    return (
      <div
        data-note-id={note.id}
        className="fixed z-40 rounded-lg shadow-lg overflow-hidden bg-card border-2 border-border select-none"
        style={baseStyle}
      >
        <div
          className="absolute top-0 left-0 right-0 h-7 z-10 cursor-grab active:cursor-grabbing touch-none bg-gradient-to-b from-black/40 to-transparent flex items-center justify-end px-2"
          onPointerDown={(e) => onPointerDown(e, note.id)}
        >
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="bg-background/80 hover:bg-background rounded-full p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {note.kind === "youtube" ? (
          <iframe
            src={`https://www.youtube.com/embed/${note.mediaUrl}?autoplay=1&loop=1&playlist=${note.mediaUrl}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&playsinline=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            className="w-full h-full pointer-events-none"
            title="YouTube video"
          />
        ) : note.kind === "video" ? (
          <video src={note.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <img src={note.mediaUrl} alt="media note" className="w-full h-full object-cover pointer-events-none" />
        )}
        <ResizeHandle onMouseDown={(e) => onResizeDown(e, note)} />
      </div>
    );
  }

  // AI
  return (
    <AiChatNote note={note} onPointerDown={onPointerDown} onDelete={onDelete} onResizeDown={onResizeDown} onUpdate={onAiUpdate} onModeChange={onAiModeChange} />
  );
}

function NoteHeader({ date, onDelete }: { date: string; onDelete: () => void }) {
  return (
    <div className="flex items-start justify-between mb-1">
      <GripVertical className="w-4 h-4 opacity-40 flex-shrink-0 mt-0.5" />
      <span className="text-[10px] opacity-60">{date}</span>
      <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.PointerEvent) => void }) {
  return (
    <div
      onPointerDown={onMouseDown}
      className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-20 touch-none"
      style={{ background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3) 50%)" }}
    />
  );
}

// ============ Sticky creator ============
function StickyCreator({ today, onClose, onSave }: { today: string; onClose: () => void; onSave: (n: any) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [customColor, setCustomColor] = useState("#fef9c3");
  const [showCP, setShowCP] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    const colorClass = selectedColor < COLOR_SWATCHES.length ? COLOR_SWATCHES[selectedColor].class : `custom:${customColor}`;
    onSave({ title: title.trim(), description, color: colorClass });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">Sticky Note Baru</h2>
          <span className="text-xs text-muted-foreground">{today}</span>
        </div>
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul..." className="font-semibold" />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi... (Enter untuk baris baru / list)"
            rows={5}
          />
          <div>
            <span className="text-xs text-muted-foreground mb-2 block">Warna</span>
            <div className="flex items-center gap-2">
              {COLOR_SWATCHES.map((s, i) => (
                <button key={i} onClick={() => { setSelectedColor(i); setShowCP(false); }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === i ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"}`}
                  style={{ backgroundColor: s.bg, borderColor: s.border }} />
              ))}
              <button onClick={() => { setSelectedColor(COLOR_SWATCHES.length); setShowCP(!showCP); }}
                className={`w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center transition-transform ${selectedColor >= COLOR_SWATCHES.length ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"}`}
                style={selectedColor >= COLOR_SWATCHES.length ? { backgroundColor: customColor } : undefined}>
                {selectedColor < COLOR_SWATCHES.length && <Plus className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
            {showCP && <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="mt-2 w-full h-10 rounded-lg cursor-pointer border border-border" />}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={!title.trim()}>Done</Button>
            <Button onClick={onClose} variant="outline" className="flex-1">Batal</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Media creator ============
function MediaCreator({ onClose, onSave }: { onClose: () => void; onSave: (url: string, kind: "image" | "video" | "youtube") => void }) {
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type.startsWith("video/")) {
      // Videos kept as blob URL (won't survive refresh — too big to base64)
      onSave(URL.createObjectURL(f), "video");
    } else {
      try {
        const data = await toDataURL(f);
        onSave(data, "image");
      } catch {
        onSave(URL.createObjectURL(f), "image");
      }
    }
  };
  const handleUrl = () => {
    const u = url.trim();
    if (!u) return;
    const ytId = getYouTubeId(u);
    if (ytId) {
      onSave(ytId, "youtube");
      return;
    }
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u)) {
      onSave(u, "video");
      return;
    }
    if (/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i.test(u)) {
      onSave(u, "image");
      return;
    }
    // Heuristic fallback: try image
    onSave(u, "image");
    toast.message("URL tidak dikenali, dicoba sebagai gambar.");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">Media Baru</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full justify-start gap-2">
            <Upload className="w-4 h-4" /> Upload gambar / video
          </Button>
          <div className="flex gap-2">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste URL YouTube / gambar / video..." />
            <Button onClick={handleUrl} disabled={!url.trim()}>OK</Button>
          </div>
          <p className="text-xs text-muted-foreground">Mendukung YouTube, .mp4/.webm, dan gambar. Drag header untuk pindah, tarik pojok kanan-bawah untuk memperbesar.</p>
        </div>
      </div>
    </div>
  );
}

// ============ Code block renderer ============
function MessageContent({ content }: { content: string }) {
  // Split by triple-backtick fences
  const parts: { kind: "text" | "code"; lang?: string; text: string }[] = [];
  const re = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > lastIdx) parts.push({ kind: "text", text: content.slice(lastIdx, m.index) });
    parts.push({ kind: "code", lang: m[1] || "code", text: m[2].replace(/\n$/, "") });
    lastIdx = re.lastIndex;
  }
  if (lastIdx < content.length) parts.push({ kind: "text", text: content.slice(lastIdx) });

  return (
    <>
      {parts.map((p, i) => p.kind === "code" ? (
        <CodeBlock key={i} lang={p.lang || "code"} text={p.text} />
      ) : (
        <span key={i} className="whitespace-pre-wrap break-words">{p.text}</span>
      ))}
    </>
  );
}

function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <div className="my-2 rounded-lg overflow-hidden border border-zinc-700 not-prose">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase tracking-wide">
        <span className="inline-flex items-center gap-1.5"><Code2 className="w-3 h-3" />{lang}</span>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-700 transition-colors"
          aria-label={t("copy")}
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span className="normal-case tracking-normal">{copied ? t("copied") : t("copy")}</span>
        </button>
      </div>
      <pre className="bg-black text-zinc-100 text-xs p-3 overflow-x-auto"><code>{text}</code></pre>
    </div>
  );
}

function AttachmentPreview({ attachments }: { attachments?: ChatAttachment[] }) {
  if (!attachments?.length) return null;
  return (
    <div className="mt-2 space-y-1.5">
      {attachments.map((a, i) => (
        <div key={`${a.name}-${i}`} className="rounded-lg border border-border bg-background/40 p-2 text-xs">
          {a.type.startsWith("image/") && a.dataUrl ? (
            <img src={a.dataUrl} alt={a.name} className="max-h-32 w-full rounded-md object-cover" />
          ) : a.type.startsWith("audio/") && a.dataUrl ? (
            <audio src={a.dataUrl} controls className="w-full" />
          ) : (
            <div className="flex items-center gap-2 break-all"><FileText className="h-3.5 w-3.5 flex-shrink-0" />{a.name}</div>
          )}
        </div>
      ))}
    </div>
  );
}

async function fileToAttachment(file: File): Promise<ChatAttachment> {
  const base: ChatAttachment = { name: file.name, type: file.type || "application/octet-stream" };
  if (file.type.startsWith("image/") || file.type.startsWith("audio/")) return { ...base, dataUrl: await toDataURL(file, 1200) };
  if (file.type.startsWith("text/") || /\.(md|csv|json|txt|html|css|js|ts|tsx)$/i.test(file.name)) return { ...base, text: (await file.text()).slice(0, 12000) };
  return base;
}

function exportChatToPdf(messages: ChatMsg[]) {
  const escapeHtml = (value: string) => value.replace(/[&<>]/g, (c) => c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;");
  const html = messages.map(m => `<section style="margin:0 0 16px"><b>${m.role === "user" ? "User" : "Bloomdoro AI"}</b><p style="white-space:pre-wrap">${escapeHtml(m.content)}</p></section>`).join("");
  const win = window.open("", "_blank");
  if (!win) return toast.error("Popup diblokir, izinkan popup untuk ekspor PDF.");
  win.document.write(`<html><head><title>Bloomdoro AI Chat</title></head><body style="font-family:sans-serif;padding:32px;line-height:1.5"><h1>Bloomdoro AI Chat</h1>${html}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

// Parse "SOURCES:" footer into reference links
function parseSources(content: string): { body: string; sources: { title: string; url: string }[] } {
  const idx = content.search(/\n?SOURCES:\s*\n/i);
  if (idx === -1) return { body: content, sources: [] };
  const body = content.slice(0, idx).trimEnd();
  const tail = content.slice(idx).replace(/\n?SOURCES:\s*\n/i, "");
  const sources: { title: string; url: string }[] = [];
  for (const raw of tail.split("\n")) {
    const line = raw.replace(/^[-*\s]+/, "").trim();
    if (!line) continue;
    const parts = line.split("|").map(s => s.trim());
    if (parts.length >= 2 && /^https?:\/\//.test(parts[1])) sources.push({ title: parts[0], url: parts[1] });
    else {
      const m = line.match(/(https?:\/\/\S+)/);
      if (m) sources.push({ title: line.replace(m[1], "").trim() || m[1], url: m[1] });
    }
  }
  return { body, sources };
}

// ============ AI chat note ============
function AiChatNote({ note, onPointerDown, onDelete, onResizeDown, onUpdate, onModeChange }: {
  note: AiNote;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onDelete: (id: string) => void;
  onResizeDown: (e: React.PointerEvent, n: AnyNote) => void;
  onUpdate: (id: string, msgs: ChatMsg[]) => void;
  onModeChange: (id: string, mode: ChatMode) => void;
}) {
  const { lang, t } = useLang();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [attachOpen, setAttachOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSourcesFor, setShowSourcesFor] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [note.messages]);

  // Persist conversation to history whenever messages change (and >1 message)
  useEffect(() => {
    if (note.messages.length <= 1) return;
    const firstUser = note.messages.find(m => m.role === "user");
    upsertChatEntry({
      id: note.sessionId,
      startedAt: startedAt.current,
      preview: firstUser?.content.slice(0, 80) || "",
      messages: note.messages,
    });
  }, [note.messages, note.sessionId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const converted = await Promise.all(Array.from(files).slice(0, 4).map(fileToAttachment));
    setAttachments(prev => [...prev, ...converted].slice(0, 6));
    setAttachOpen(false);
  };

  const send = async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;
    const text = input.trim();



    const attachmentText = attachments.map(a => a.text ? `\n\n[File ${a.name}]\n${a.text}` : `\n\n[Lampiran: ${a.name} (${a.type})]`).join("");
    const userMsg: ChatMsg = { role: "user", content: text || "Lampiran", attachments };
    const newMsgs = [...note.messages, userMsg];
    onUpdate(note.id, newMsgs);
    setInput("");
    setAttachments([]);
    setLoading(true);

    const apiMessages = newMsgs.map(m => {
      const images = m.attachments?.filter(a => a.type.startsWith("image/") && a.dataUrl) || [];
      const textContent = `${m.content}${m === userMsg ? attachmentText : ""}`;
      if (images.length === 0) return { role: m.role, content: textContent };
      return {
        role: m.role,
        content: [
          { type: "text", text: textContent },
          ...images.map(a => ({ type: "image_url", image_url: { url: a.dataUrl } })),
        ],
      };
    });

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, mode: note.mode, language: lang }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Terlalu banyak permintaan. Coba lagi sebentar.");
        else if (resp.status === 402) toast.error("Kredit AI habis. Tambahkan di Settings.");
        else toast.error("Gagal terhubung ke AI");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      let msgs = [...newMsgs, { role: "assistant" as const, content: "" }];
      onUpdate(note.id, msgs);
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              assistant += c;
              msgs = [...msgs.slice(0, -1), { role: "assistant", content: assistant }];
              onUpdate(note.id, msgs);
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal mengirim pesan");
    } finally {
      setLoading(false);
    }
  };

  const MODES: { id: ChatMode; label: string; icon: any }[] = [
    { id: "talk", label: "Talk", icon: MessageSquare },
    { id: "riset", label: "Riset", icon: Search },
    { id: "coding", label: "Coding", icon: Code2 },
  ];

  return (
    <div
      data-note-id={note.id}
      className="fixed z-40 rounded-2xl shadow-xl bg-card border-2 border-primary/30 select-none flex flex-col overflow-hidden"
      style={{ left: note.x, top: note.y, width: note.width, height: note.height }}
    >
      {/* Header (drag handle) */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-border cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(e) => onPointerDown(e, note.id)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-sm text-foreground">Bloomdoro AI</span>
        </div>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onDelete(note.id)} className="opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {note.messages.map((m, i) => {
          const isUser = m.role === "user";
          const { body, sources } = !isUser ? parseSources(m.content) : { body: m.content, sources: [] };
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] px-3 py-2 rounded-2xl text-sm break-words ${
                isUser
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-secondary-foreground rounded-bl-sm"
              }`}>
                {body ? <MessageContent content={body} /> : (loading ? <span className="opacity-60">…</span> : null)}
                <AttachmentPreview attachments={m.attachments} />
                {!isUser && sources.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowSourcesFor(showSourcesFor === i ? null : i)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/15 hover:bg-primary/25 text-primary transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" /> {sources.length} {t("references")}
                    </button>
                    {showSourcesFor === i && (
                      <ul className="mt-2 space-y-1">
                        {sources.map((s, si) => (
                          <li key={si}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary underline break-all">
                              {s.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mode picker */}
      <div className="px-2 pt-2 flex gap-1 border-t border-border bg-background/50">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onModeChange(note.id, id)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              note.mode === id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 bg-background/50">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((a, i) => (
              <button
                key={`${a.name}-${i}`}
                onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[11px] text-secondary-foreground hover:bg-muted"
              >
                <Paperclip className="h-3 w-3" /> {a.name.slice(0, 18)} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
        <div className="relative">
          <input ref={fileRef} type="file" multiple accept="image/*,audio/*,.pdf,.txt,.md,.csv,.json,.js,.ts,.tsx,.html,.css" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          {attachOpen && (
            <div className="absolute bottom-12 left-0 z-10 w-44 rounded-lg border border-border bg-card p-1 shadow-lg">
              <button onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-accent">
                <Paperclip className="h-3.5 w-3.5" /> File / gambar / audio
              </button>
              <button onClick={() => exportChatToPdf(note.messages)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-accent">
                <FileText className="h-3.5 w-3.5" /> Export PDF
              </button>
            </div>
          )}
          <Button size="icon" variant="outline" onClick={() => setAttachOpen(o => !o)} disabled={loading}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={note.mode === "coding" ? t("type_code") : note.mode === "riset" ? t("type_research") : t("type_message")}
          disabled={loading}
          rows={1}
          className="text-sm min-h-[40px] max-h-[120px] resize-none"
        />
        <Button size="icon" onClick={send} disabled={loading || (!input.trim() && attachments.length === 0)}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
        </div>
      </div>

      <ResizeHandle onMouseDown={(e) => onResizeDown(e, note)} />
    </div>
  );
}
