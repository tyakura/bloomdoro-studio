import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, X, GripVertical, StickyNote as StickyIcon, Image as ImageIcon, Sparkles, Send, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  isVideo: boolean;
  date: string;
}

interface ChatMsg { role: "user" | "assistant"; content: string }

interface AiNote extends BaseNote {
  type: "ai";
  messages: ChatMsg[];
}

type AnyNote = StickyNote | MediaNote | AiNote;

const COLOR_SWATCHES = [
  { bg: "#fef9c3", border: "#fde047", class: "bg-yellow-100 border-yellow-300 text-yellow-900" },
  { bg: "#fce7f3", border: "#f9a8d4", class: "bg-pink-100 border-pink-300 text-pink-900" },
  { bg: "#dbeafe", border: "#93c5fd", class: "bg-blue-100 border-blue-300 text-blue-900" },
  { bg: "#dcfce7", border: "#86efac", class: "bg-green-100 border-green-300 text-green-900" },
  { bg: "#f3e8ff", border: "#d8b4fe", class: "bg-purple-100 border-purple-300 text-purple-900" },
];

const isLightColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

export function StickyNotes() {
  const [notes, setNotes] = useState<AnyNote[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creating, setCreating] = useState<NoteType | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  // Drag
  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    const el = (e.target as HTMLElement).closest("[data-note-id]") as HTMLElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current; if (!d) return;
      setNotes(prev => prev.map(n => n.id === d.id ? { ...n, x: ev.clientX - d.offsetX, y: ev.clientY - d.offsetY } : n));
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  }, []);

  // Resize
  const handleResizeDown = useCallback((e: React.MouseEvent, n: AnyNote) => {
    e.stopPropagation();
    resizeRef.current = { id: n.id, startX: e.clientX, startY: e.clientY, startW: n.width, startH: n.height };
    const onMove = (ev: MouseEvent) => {
      const r = resizeRef.current; if (!r) return;
      const w = Math.max(160, r.startW + (ev.clientX - r.startX));
      const h = Math.max(120, r.startH + (ev.clientY - r.startY));
      setNotes(prev => prev.map(nn => nn.id === r.id ? { ...nn, width: w, height: h } : nn));
    };
    const onUp = () => { resizeRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  }, []);

  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const addStickyNote = (note: Omit<StickyNote, "id" | "type" | "x" | "y" | "width" | "height" | "date">) => {
    setNotes(prev => [...prev, {
      ...note, id: crypto.randomUUID(), type: "sticky", date: today,
      x: 100 + Math.random() * 200, y: 100 + Math.random() * 200,
      width: 220, height: 0,
    }]);
  };

  const addMediaNote = (mediaUrl: string, isVideo: boolean) => {
    setNotes(prev => [...prev, {
      id: crypto.randomUUID(), type: "media", mediaUrl, isVideo, date: today,
      x: 120 + Math.random() * 200, y: 120 + Math.random() * 200,
      width: 280, height: 220,
    }]);
  };

  const addAiNote = () => {
    setNotes(prev => [...prev, {
      id: crypto.randomUUID(), type: "ai",
      messages: [{ role: "assistant", content: "Halo! Aku **Bloomdoro AI** 🌸 — teman ngobrolmu di sela-sela fokus. Aku bisa bantu riset, jawab pertanyaan, atau sekedar ngobrol santai. Lagi ngerjain apa hari ini?" }],
      x: 140 + Math.random() * 100, y: 100,
      width: 360, height: 440,
    }]);
  };

  const updateAiMessages = (id: string, msgs: ChatMsg[]) => {
    setNotes(prev => prev.map(n => n.id === id && n.type === "ai" ? { ...n, messages: msgs } : n));
  };

  return (
    <>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onMouseDown={handleMouseDown}
          onDelete={deleteNote}
          onResizeDown={handleResizeDown}
          onAiUpdate={updateAiMessages}
        />
      ))}

      {creating === "sticky" && <StickyCreator today={today} onClose={() => setCreating(null)} onSave={addStickyNote} />}
      {creating === "media" && <MediaCreator onClose={() => setCreating(null)} onSave={(u, v) => { addMediaNote(u, v); setCreating(null); }} />}

      {/* FAB menu */}
      {menuOpen && (
        <div className="fixed bottom-24 right-6 z-[55] flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
          <FabItem icon={StickyIcon} label="Sticky Note" onClick={() => { setCreating("sticky"); setMenuOpen(false); }} />
          <FabItem icon={ImageIcon} label="Media" onClick={() => { setCreating("media"); setMenuOpen(false); }} />
          <FabItem icon={Sparkles} label="Talk with AI" badge="NEW" onClick={() => { addAiNote(); setMenuOpen(false); }} />
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
function NoteCard({ note, onMouseDown, onDelete, onResizeDown, onAiUpdate }: {
  note: AnyNote;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
  onResizeDown: (e: React.MouseEvent, n: AnyNote) => void;
  onAiUpdate: (id: string, msgs: ChatMsg[]) => void;
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
        className={`fixed z-40 rounded-lg shadow-lg p-3 cursor-grab active:cursor-grabbing select-none ${cls}`}
        style={style}
        onMouseDown={(e) => onMouseDown(e, note.id)}
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
        className="fixed z-40 rounded-lg shadow-lg overflow-hidden cursor-grab active:cursor-grabbing select-none bg-card border-2 border-border"
        style={baseStyle}
        onMouseDown={(e) => onMouseDown(e, note.id)}
      >
        <div className="absolute top-1 right-1 z-10 flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="bg-background/80 hover:bg-background rounded-full p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {note.isVideo ? (
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
    <AiChatNote note={note} onMouseDown={onMouseDown} onDelete={onDelete} onResizeDown={onResizeDown} onUpdate={onAiUpdate} />
  );
}

function NoteHeader({ date, onDelete }: { date: string; onDelete: () => void }) {
  return (
    <div className="flex items-start justify-between mb-1">
      <GripVertical className="w-4 h-4 opacity-40 flex-shrink-0 mt-0.5" />
      <span className="text-[10px] opacity-60">{date}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20"
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
function MediaCreator({ onClose, onSave }: { onClose: () => void; onSave: (url: string, isVideo: boolean) => void }) {
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onSave(URL.createObjectURL(f), f.type.startsWith("video/"));
  };
  const handleUrl = () => {
    if (!url.trim()) return;
    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
    onSave(url.trim(), isVideo);
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
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="atau paste URL..." />
            <Button onClick={handleUrl} disabled={!url.trim()}>OK</Button>
          </div>
          <p className="text-xs text-muted-foreground">Drag note untuk pindah, tarik pojok kanan-bawah untuk memperbesar.</p>
        </div>
      </div>
    </div>
  );
}

// ============ AI chat note ============
function AiChatNote({ note, onMouseDown, onDelete, onResizeDown, onUpdate }: {
  note: AiNote;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
  onResizeDown: (e: React.MouseEvent, n: AnyNote) => void;
  onUpdate: (id: string, msgs: ChatMsg[]) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [note.messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: input.trim() };
    const newMsgs = [...note.messages, userMsg];
    onUpdate(note.id, newMsgs);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMsgs }),
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

  return (
    <div
      data-note-id={note.id}
      className="fixed z-40 rounded-2xl shadow-xl bg-card border-2 border-primary/30 select-none flex flex-col overflow-hidden"
      style={{ left: note.x, top: note.y, width: note.width, height: note.height }}
    >
      {/* Header (drag handle) */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-border cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => onMouseDown(e, note.id)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-sm text-foreground">Bloomdoro AI</span>
        </div>
        <button onClick={() => onDelete(note.id)} className="opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {note.messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-secondary text-secondary-foreground rounded-bl-sm"
            }`}>{m.content || (loading ? "…" : "")}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border flex gap-2 bg-background/50">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Tulis pesan..."
          disabled={loading}
          className="text-sm"
        />
        <Button size="icon" onClick={send} disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      <ResizeHandle onMouseDown={(e) => onResizeDown(e, note)} />
    </div>
  );
}
