import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Plus, Loader2, Paperclip, FileDown } from "lucide-react";
import { BloomdoroLogo } from "@/components/BloomdoroLogo";
import { GrowingFlower } from "@/components/GrowingFlower";
import { GrowingRocket } from "@/components/GrowingRocket";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Msg { role: "user" | "assistant"; content: string }

interface Props {
  onBack: () => void;
  timerProgress: number;
  timerMinutes: number;
  timerSeconds: number;
  theme: "flower" | "rocket";
  flowerVariant: 0 | 1 | 2 | 3;
  isFocusing: boolean;
}

const pad = (n: number) => n.toString().padStart(2, "0");

export function MobileAIChat({ onBack, timerProgress, timerMinutes, timerSeconds, theme, flowerVariant, isFocusing }: Props) {
  const { lang } = useLang();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Halo! Aku Bloomdoro AI. Lampirkan file (PDF, DOCX, gambar) atau tanya apa saja." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, loading]);

  const handleFile = async (f: File) => {
    setLoading(true);
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f);
      });
      setMessages(m => [...m, { role: "user", content: `📎 ${f.name}` }]);
      const { data, error } = await supabase.functions.invoke("process-file", {
        body: { action: "extract", fileName: f.name, fileType: f.type, dataUrl },
      });
      if (error) throw error;
      const txt = data.text || "";
      setExtractedText(txt);
      setMessages(m => [...m, { role: "assistant", content: `Aku sudah membaca **${f.name}** (${txt.length} karakter).\n\n**Apa yang ingin kamu lakukan dengan file ini?**\n\n- ✍️ Ringkas / Terjemahkan / Jelaskan\n- 🔄 Konversi ke: **PDF, Word (DOC/DOCX), TXT, MD, HTML, RTF, JSON, CSV, XML, EPUB**\n- 💬 Atau tanya bebas\n\nContoh: "konversi ke docx", "ringkas dalam 5 poin", "jelaskan bagian utama".` }]);
    } catch (e: any) {
      toast.error(e.message || "Gagal proses file");
    } finally { setLoading(false); }
  };


  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs); setInput(""); setLoading(true);

    // Detect conversion intent
    const m = text.match(/konversi|convert|ubah .* ke (pdf|doc|docx|txt|md|html|rtf|json|csv|xml|epub)|export.*(pdf|doc|docx|txt|md|html|rtf|json|csv|xml|epub)/i);
    if (m && extractedText) {
      const fmt = (text.match(/\b(pdf|docx|doc|txt|md|html|rtf|json|csv|xml|epub)\b/i)?.[1] || "txt").toLowerCase();
      try {
        const { data, error } = await supabase.functions.invoke("process-file", {
          body: { action: "convert", text: extractedText, format: fmt, title: "bloomdoro-export" },
        });
        if (error) throw error;
        const a = document.createElement("a");
        a.href = data.dataUrl; a.download = data.fileName; a.click();
        setMessages(m => [...m, { role: "assistant", content: `✅ File **${data.fileName}** sudah diunduh.` }]);
      } catch (e: any) {
        setMessages(m => [...m, { role: "assistant", content: `❌ ${e.message}` }]);
      } finally { setLoading(false); }
      return;
    }

    // Regular chat
    try {
      const apiMsgs = newMsgs.map(mm => ({ role: mm.role, content: mm.content }));
      if (extractedText) {
        apiMsgs.unshift({ role: "user", content: `[KONTEKS FILE]\n${extractedText.slice(0, 20000)}` });
      }
      const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/ai-chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ messages: apiMsgs, mode: "talk", language: lang }),
      });
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let acc = "";
      setMessages(m => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        chunk.split("\n").forEach(line => {
          if (!line.startsWith("data: ")) return;
          const data = line.slice(6).trim();
          if (data === "[DONE]") return;
          try { const j = JSON.parse(data); const c = j.choices?.[0]?.delta?.content; if (c) { acc += c; setMessages(m => [...m.slice(0, -1), { role: "assistant", content: acc }]); } } catch {}
        });
      }
    } catch (e: any) {
      setMessages(m => [...m, { role: "assistant", content: `❌ ${e.message}` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col">
      {/* Top bar: 25% height with timer + animation */}
      <div className="h-[25vh] bg-card border-b border-border flex items-center px-3 gap-3 shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <BloomdoroLogo />
          <div className="flex-1 flex items-center justify-center gap-3">
            {isFocusing && (
              <div className="scale-50 origin-center">
                {theme === "flower" ? <GrowingFlower progress={timerProgress} variant={flowerVariant} /> : <GrowingRocket progress={timerProgress} />}
              </div>
            )}
            <div className="font-display text-2xl font-bold tabular-nums text-foreground">
              {pad(timerMinutes)}:{pad(timerSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> sedang berpikir...</div>}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex items-center gap-2 shrink-0">
        <input ref={fileRef} type="file" accept="image/*,.pdf,.docx,.txt,.md,.csv,.json" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        <button onClick={() => fileRef.current?.click()} className="p-2 rounded-full bg-secondary hover:bg-muted">
          <Plus className="w-5 h-5" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Tulis pesan atau lampirkan file..."
          className="flex-1 px-3 py-2 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button onClick={send} disabled={loading || !input.trim()} className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
