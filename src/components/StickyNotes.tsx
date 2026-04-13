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

const COLOR_SWATCHES = [
  { bg: "#fef9c3", border: "#fde047", text: "#713f12", class: "bg-yellow-100 border-yellow-300 text-yellow-900" },
  { bg: "#fce7f3", border: "#f9a8d4", text: "#831843", class: "bg-pink-100 border-pink-300 text-pink-900" },
  { bg: "#dbeafe", border: "#93c5fd", text: "#1e3a5f", class: "bg-blue-100 border-blue-300 text-blue-900" },
  { bg: "#dcfce7", border: "#86efac", text: "#14532d", class: "bg-green-100 border-green-300 text-green-900" },
  { bg: "#f3e8ff", border: "#d8b4fe", text: "#581c87", class: "bg-purple-100 border-purple-300 text-purple-900" },
];

export function StickyNotes() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [customColor, setCustomColor] = useState("#fef9c3");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getColorClass = () => {
    if (selectedColor < COLOR_SWATCHES.length) {
      return COLOR_SWATCHES[selectedColor].class;
    }
    return "custom";
  };

  const getCustomStyle = () => {
    if (selectedColor >= COLOR_SWATCHES.length) {
      return {
        backgroundColor: customColor,
        borderColor: customColor,
        color: isLightColor(customColor) ? "#1a1a1a" : "#ffffff",
      };
    }
    return undefined;
  };

  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  };

  const handleDone = () => {
    if (!title.trim()) return;
    const colorClass = getColorClass();
    const note: StickyNote = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date: today,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      color: colorClass === "custom" ? `custom:${customColor}` : colorClass,
    };
    setNotes((prev) => [...prev, note]);
    setTitle("");
    setDescription("");
    setSelectedColor(0);
    setShowColorPicker(false);
    setIsCreating(false);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    const el = (e.target as HTMLElement).closest("[data-note-id]") as HTMLElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };

    const onMove = (ev: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === drag.id
            ? { ...n, x: ev.clientX - drag.offsetX, y: ev.clientY - drag.offsetY }
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

  const getNoteStyle = (note: StickyNote) => {
    if (note.color.startsWith("custom:")) {
      const hex = note.color.replace("custom:", "");
      return {
        backgroundColor: hex,
        borderColor: hex,
        color: isLightColor(hex) ? "#1a1a1a" : "#ffffff",
      };
    }
    return undefined;
  };

  const getNoteClass = (note: StickyNote) => {
    if (note.color.startsWith("custom:")) {
      return "border-2";
    }
    return note.color;
  };

  return (
    <>
      {/* Draggable sticky notes */}
      {notes.map((note) => (
        <div
          key={note.id}
          data-note-id={note.id}
          className={`fixed z-40 w-52 rounded-lg border-2 shadow-lg p-3 cursor-grab active:cursor-grabbing select-none ${getNoteClass(note)}`}
          style={{ left: note.x, top: note.y, ...getNoteStyle(note) }}
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

              {/* Color Picker */}
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">Warna Catatan</span>
                <div className="flex items-center gap-2">
                  {COLOR_SWATCHES.map((swatch, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedColor(i); setShowColorPicker(false); }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        selectedColor === i ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: swatch.bg, borderColor: swatch.border }}
                    />
                  ))}
                  {/* Custom color button */}
                  <button
                    onClick={() => { setSelectedColor(COLOR_SWATCHES.length); setShowColorPicker(!showColorPicker); }}
                    className={`w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center transition-transform ${
                      selectedColor >= COLOR_SWATCHES.length ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                    }`}
                    style={selectedColor >= COLOR_SWATCHES.length ? { backgroundColor: customColor } : undefined}
                  >
                    {selectedColor < COLOR_SWATCHES.length && <Plus className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
                {showColorPicker && (
                  <div className="mt-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer border border-border"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDone} className="flex-1" disabled={!title.trim()}>
                  Done
                </Button>
                <Button onClick={() => { setIsCreating(false); setShowColorPicker(false); }} variant="outline" className="flex-1">
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
