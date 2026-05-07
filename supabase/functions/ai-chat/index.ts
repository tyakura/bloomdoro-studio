// Bloomdoro AI chat — streaming via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREATOR_LINE = `Website Bloomdoro ini dibuat oleh Attaya Arkarna. Kunjungi: https://www.attaya-arkarna.my.id/`;

const BASE_PROMPT = `Kamu adalah Bloomdoro AI, asisten ramah di dalam aplikasi Pomodoro bernama Bloomdoro.
Saat pengguna pertama membuka chat, perkenalkan dirimu sebagai "Bloomdoro AI".
Jika ada yang bertanya siapa pembuat / pencipta / developer / pemilik website ini, jawab persis: ${CREATOR_LINE}
Selalu jawab dalam bahasa Indonesia kecuali pengguna menulis bahasa lain.`;

const MODE_PROMPTS: Record<string, string> = {
  talk: `MODE: TALK BIASA. Jawab SINGKAT, RINGKAS, santai seperti chat teman. Maksimal 1-3 kalimat. Tidak perlu list panjang.`,
  riset: `MODE: RISET. Berikan analisis mendalam berbasis pengetahuanmu (anggap kamu meriset dari internet). Sertakan 2-5 sumber referensi di akhir dengan format:
SOURCES:
- Judul Sumber | https://url-asli.com
- Judul Sumber 2 | https://url-asli.com
Pastikan URL valid dan relevan.`,
  coding: `MODE: CODING. Bantu dengan kode. Setiap kali memberi kode, WAJIB bungkus dalam triple backtick dengan nama bahasa, contoh:
\`\`\`python
print("hi")
\`\`\`
Penjelasan singkat di luar code block. Sebutkan bahasa yang dipakai sebelum code block.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const modePrompt = MODE_PROMPTS[mode as string] ?? MODE_PROMPTS.talk;
    const systemPrompt = `${BASE_PROMPT}\n\n${modePrompt}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi sebentar." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit AI habis. Tambahkan kredit di Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
