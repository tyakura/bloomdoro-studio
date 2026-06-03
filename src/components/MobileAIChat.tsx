import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Plus, Loader2, X, FileText } from "lucide-react";
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

const PDF_FORMATS: { value: string; key: "fmt_word" | "fmt_text" | "fmt_md" | "fmt_html" | "fmt_image" }[] = [
  { value: "docx", key: "fmt_word" },
  { value: "txt", key: "fmt_text" },
  { value: "md", key: "fmt_md" },
  { value: "html", key: "fmt_html" },
];

export function MobileAIChat({ onBack, timerProgress, timerMinutes, timerSeconds, theme, flowerVariant, isFocusing }: Props) {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: t("ai_greet") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [pendingPdf, setPendingPdf] = useState<{ file: File; dataUrl: string } | null>(null);
  const [pdfFormat, setPdfFormat] = useState<string>("docx");
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, loading]);

  const readDataUrl = (f: File) => new Promise<string>((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f);
  });

  const isPdf = (f: File) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);

  const handleFile = async (f: File) => {
    if (isPdf(f)) {
      try {
        const dataUrl = await readDataUrl(f);
        setPendingPdf({ file: f, dataUrl });
      } catch (e: any) {
        toast.error(e.message || "Failed");
      }
      return;
    }
    // Non-PDF: original extract flow
    setLoading(true);
    try {
      const dataUrl = await readDataUrl(f);
      setMessages(m => [...m, { role: "user", content: `📎 ${f.name}` }]);
      const { data, error } = await supabase.functions.invoke("process-file", {
        body: { action: "extract", fileName: f.name, fileType: f.type, dataUrl },
      });
      if (error) throw error;
      const txt = data.text || "";
      setExtractedText(txt);
      setMessages(m => [...m, { role: "assistant", content: `${t("file_what_to_do")}\n\n- ${t("summarize")} / ${t("translate")} / ${t("explain")}\n- ${t("convert_to")}` }]);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally { setLoading(false); }
  };

  const sendPdfConversion = async () => {
    if (!pendingPdf || loading) return;
    const { file, dataUrl } = pendingPdf;
    setLoading(true);
    setMessages(m => [...m, { role: "user", content: `📎 ${file.name} → .${pdfFormat}` }]);
    try {
      const ext = await supabase.functions.invoke("process-file", {
        body: { action: "extract", fileName: file.name, fileType: file.type, dataUrl },
      });
      if (ext.error) throw ext.error;
      const text = ext.data?.text || "";
      const conv = await supabase.functions.invoke("process-file", {
        body: { action: "convert", text, format: pdfFormat, title: file.name.replace(/\.[^.]+$/, "") },
      });
      if (conv.error) throw conv.error;
      const a = document.createElement("a");
      a.href = conv.data.dataUrl; a.download = conv.data.fileName; a.click();
      setMessages(m => [...m, { role: "assistant", content: `✅ ${t("download_ready")}: **${conv.data.fileName}**` }]);
      setPendingPdf(null);
    } catch (e: any) {
      setMessages(m => [...m, { role: "assistant", content: `❌ ${e.message}` }]);
    } finally { setLoading(false); }
  };

  const send = async () => {
    if (pendingPdf) { await sendPdfConversion(); return; }
    const text = input.trim();
    if (!text || loading) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs); setInput(""); setLoading(true);

    try {
      const apiMsgs = newMsgs.map(mm => ({ role: mm.role, content: mm.content }));
      if (extractedText) {
        apiMsgs.unshift({ role: "user", content: `[FILE CONTEXT]\n${extractedText.slice(0, 20000)}` });
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
              <div className="scale-[0.35] origin-center max-w-[40%] overflow-hidden">
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
        {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t("thinking")}</div>}
      </div>

      {/* PDF picker chip */}
      {pendingPdf && (
        <div className="border-t border-border bg-muted/40 p-2 flex items-center gap-2 shrink-0">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground truncate">{t("pdf_detected")}</p>
            <p className="text-xs font-medium truncate">{pendingPdf.file.name}</p>
          </div>
          <select
            value={pdfFormat}
            onChange={(e) => setPdfFormat(e.target.value)}
            className="text-xs rounded-md border border-border bg-background px-2 py-1"
          >
            {PDF_FORMATS.map(f => (
              <option key={f.value} value={f.value}>{t(f.key)}</option>
            ))}
          </select>
          <button onClick={() => setPendingPdf(null)} className="p-1 rounded-full hover:bg-background">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
          placeholder={t("type_message")}
          className="flex-1 px-3 py-2 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={!!pendingPdf}
        />
        <button onClick={send} disabled={loading || (!input.trim() && !pendingPdf)} className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50" title={pendingPdf ? t("convert_and_send") : undefined}>
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
