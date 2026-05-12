// Process file uploads: extract text from PDF/DOCX/images (OCR via Gemini Vision)
// and produce converted output (txt, md, html, pdf via simple HTML printing)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function geminiVisionOCR(dataUrl: string, apiKey: string): Promise<string> {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Extract ALL text from this image. Return only the extracted text, no commentary." },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      }],
    }),
  });
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  // Lightweight: stream extraction via pdfjs-dist legacy build (deno-compatible)
  try {
    const pdfjs: any = await import("https://esm.sh/pdfjs-dist@4.0.379/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({ data: bytes, useWorker: false, isEvalSupported: false });
    const pdf = await loadingTask.promise;
    let text = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str).join(" ") + "\n\n";
    }
    return text.trim();
  } catch (e) {
    return `[PDF extraction failed: ${e instanceof Error ? e.message : String(e)}]`;
  }
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  try {
    const mammoth: any = await import("https://esm.sh/mammoth@1.8.0?target=deno");
    const result = await mammoth.extractRawText({ buffer: bytes });
    return result.value || "";
  } catch (e) {
    return `[DOCX extraction failed: ${e instanceof Error ? e.message : String(e)}]`;
  }
}

function buildPdfHtml(text: string, title: string): string {
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;max-width:780px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222}h1{font-size:20px;border-bottom:1px solid #ddd;padding-bottom:8px}pre{white-space:pre-wrap;word-wrap:break-word;font-family:inherit}</style>
</head><body><h1>${esc(title)}</h1><pre>${esc(text)}</pre></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, fileName, fileType, dataUrl, text, format, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    if (action === "extract") {
      if (!dataUrl) throw new Error("dataUrl required");
      const base64 = dataUrl.split(",")[1] || "";
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      let extracted = "";
      const lower = (fileName || "").toLowerCase();
      if (fileType?.startsWith("image/")) {
        extracted = await geminiVisionOCR(dataUrl, LOVABLE_API_KEY);
      } else if (fileType === "application/pdf" || lower.endsWith(".pdf")) {
        extracted = await extractPdfText(bytes);
      } else if (lower.endsWith(".docx") || fileType?.includes("officedocument.wordprocessingml")) {
        extracted = await extractDocxText(bytes);
      } else if (fileType?.startsWith("text/") || /\.(txt|md|json|csv|js|ts|tsx|jsx|html|css|py)$/.test(lower)) {
        extracted = new TextDecoder().decode(bytes);
      } else {
        extracted = `[Unsupported file type: ${fileType || lower}]`;
      }
      return new Response(JSON.stringify({ text: extracted.slice(0, 100000) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "convert") {
      if (!text) throw new Error("text required");
      const t = title || "document";
      let blob: Uint8Array;
      let mime: string;
      let ext: string;
      if (format === "txt") { blob = new TextEncoder().encode(text); mime = "text/plain"; ext = "txt"; }
      else if (format === "md") { blob = new TextEncoder().encode(text); mime = "text/markdown"; ext = "md"; }
      else if (format === "html" || format === "pdf") {
        const html = buildPdfHtml(text, t);
        blob = new TextEncoder().encode(html);
        mime = format === "pdf" ? "text/html" : "text/html"; // browser-printable HTML
        ext = "html";
      } else {
        throw new Error("Unsupported format. Use txt, md, html.");
      }
      // Return base64 + filename for client to download
      const b64 = btoa(String.fromCharCode(...blob));
      return new Response(JSON.stringify({
        fileName: `${t}.${ext}`,
        mime,
        dataUrl: `data:${mime};base64,${b64}`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Unknown action");
  } catch (e) {
    console.error("process-file error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
