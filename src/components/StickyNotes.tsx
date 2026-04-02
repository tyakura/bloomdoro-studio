import { useState, useRef, useCallback } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StickyNote {
  id: string;
  title: string;
  description: string;
  date: string;
  x: number;
  y: number;
  color: string;
}

const NOTE_COLORS = [
  "bg-yellow-100 border-yellow-300 text-yellow-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
];

export function StickyNotes() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDone = () => {
    if (!title.trim()) return;
    const note: StickyNote = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date: today,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length],
    };
    setNotes((prev) => [...prev, note]);
    setTitle("");
    setDescription("");
    setIsCreating(false);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    const el = (e.target as HTMLElement).closest("[data-note-id]") as HTMLElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === dragRef.current!.id
            ? { ...n, x: ev.clientX - dragRef.current!.offsetX, y: ev.clientY - dragRef.current!.offsetY }
            : n
        )
      );
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {/* Draggable sticky notes */}
      {notes.map((note) => (
        <div
          key={note.id}
          data-note-id={note.id}
          className={`fixed z-40 w-52 rounded-lg border-2 shadow-lg p-3 cursor-grab active:cursor-grabbing select-none ${note.color}`}
          style={{ left: note.x, top: note.y }}
          onMouseDown={(e) => handleMouseDown(e, note.id)}
        >
          <div className="flex items-start justify-between mb-1">
            <GripVertical className="w-4 h-4 opacity-40 flex-shrink-0 mt-0.5" />
            <span className="text-[10px] opacity-60">{note.date}</span>
            <button
              onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
              className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="font-bold text-sm leading-tight mb-1">{note.title}</h4>
          {note.description && (
            <p className="text-xs opacity-75 leading-snug">{note.description}</p>
          )}
        </div>
      ))}

      {/* Create note modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">Catatan Baru</h2>
              <span className="text-xs text-muted-foreground">{today}</span>
            </div>
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul..."
                className="font-semibold"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleDone} className="flex-1" disabled={!title.trim()}>
                  Done
                </Button>
                <Button onClick={() => setIsCreating(false)} variant="outline" className="flex-1">
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsCreating(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl flex items-center justify-center transition-transform hover:scale-110"
      >
        <Plus className="w-7 h-7" />
      </button>
    </>
  );
}
