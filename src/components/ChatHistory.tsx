import { useEffect, useState } from "react";
import { History, X, MessageCircle, Trash2, MessageSquarePlus } from "lucide-react";
import { useLang } from "@/lib/i18n";

export interface ChatHistoryEntry {
  id: string;
  startedAt: number;
  preview: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

const STORAGE_KEY = "bloomdoro_ai_history";

export function loadChatHistory(): ChatHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveChatHistory(entries: ChatHistoryEntry[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-50))); } catch {}
}

export function upsertChatEntry(entry: ChatHistoryEntry) {
  const all = loadChatHistory();
  const idx = all.findIndex(e => e.id === entry.id);
  if (idx >= 0) all[idx] = entry; else all.push(entry);
  saveChatHistory(all);
  window.dispatchEvent(new CustomEvent("bloomdoro:history-updated"));
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistory({ isOpen, onClose }: Props) {
  const { t } = useLang();
  const [entries, setEntries] = useState<ChatHistoryEntry[]>([]);
  const [selected, setSelected] = useState<ChatHistoryEntry | null>(null);

  useEffect(() => {
    const refresh = () => setEntries(loadChatHistory().slice().reverse());
    refresh();
    window.addEventListener("bloomdoro:history-updated", refresh);
    return () => window.removeEventListener("bloomdoro:history-updated", refresh);
  }, []);

  if (!isOpen) return null;

  const removeEntry = (id: string) => {
    const all = loadChatHistory().filter(e => e.id !== id);
    saveChatHistory(all);
    setEntries(all.slice().reverse());
    if (selected?.id === id) setSelected(null);
  };

  const continueChat = (entry: ChatHistoryEntry) => {
    window.dispatchEvent(new CustomEvent("bloomdoro:continue-chat", { detail: entry }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground inline-flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            {t("ai_history_title")}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 border-r border-border overflow-y-auto">
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">{t("no_history")}</p>
            )}
            {entries.map(e => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={`w-full text-left p-3 border-b border-border hover:bg-accent transition-colors ${selected?.id === e.id ? "bg-accent" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <MessageCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{new Date(e.startedAt).toLocaleString()}</p>
                    <p className="text-sm text-foreground truncate">{e.preview || "—"}</p>
                  </div>
                  <span onClick={(ev) => { ev.stopPropagation(); removeEntry(e.id); }} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="w-1/2 flex flex-col bg-background/50">
            <div className="overflow-y-auto p-3 space-y-2 flex-1">
              {!selected && <p className="text-sm text-muted-foreground text-center mt-8">{t("pick_chat")}</p>}
              {selected?.messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>{m.content}</div>
                </div>
              ))}
            </div>
            {selected && (
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => continueChat(selected)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  {t("continue_chat")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
