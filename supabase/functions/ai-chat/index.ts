// Bloomdoro AI chat — streaming via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREATOR_LINE = `Website ini dibuat oleh Attaya Arkarna — https://www.attaya-arkarna.my.id/`;

const LANG_NAME: Record<string, string> = {
  id: "Bahasa Indonesia",
  en: "English",
  ar: "Arabic (العربية)",
  ja: "Japanese (日本語)",
  zh: "Chinese (中文)",
};

function basePrompt(lang: string) {
  const langName = LANG_NAME[lang] || "Bahasa Indonesia";
  return `You are Bloomdoro AI, a friendly assistant inside a Pomodoro app called Bloomdoro.
Always reply in ${langName}, including your greeting. Match the user's tone.
Do NOT promote or advertise any external website. Only when the user explicitly asks who built / created / made / developed this website, reply with exactly: ${CREATOR_LINE}
Otherwise never mention the creator or the website URL.`;
}

const MODE_PROMPTS: Record<string, string> = {
  talk: `MODE: TALK. Keep replies SHORT and casual, like chatting with a friend. 1-3 sentences max. No long lists.`,
  riset: `MODE: RESEARCH. Provide an in-depth analysis. End with 2-5 sources in this exact format:
SOURCES:
- Source Title | https://real-url.com
- Source Title 2 | https://real-url.com
URLs must be valid and relevant.`,
  coding: `MODE: CODING. Wrap every code snippet in triple backticks with the language name, e.g.
\`\`\`python
print("hi")
\`\`\`
State the language briefly outside the code block.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const modePrompt = MODE_PROMPTS[mode as string] ?? MODE_PROMPTS.talk;
    const systemPrompt = `${basePrompt(language || "id")}\n\n${modePrompt}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Out of credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
