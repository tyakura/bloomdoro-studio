import { useState } from "react";
import { HelpCircle, Timer, Flower2, Rocket, Music, Settings, StickyNote, Repeat, Sparkles, Image as ImageIcon, Plus, Languages, Lock, LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLang, T } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const FAQ: { icon: any; qKey: keyof typeof T; aKey: keyof typeof T; requiresLogin?: boolean }[] = [
  { icon: Timer, qKey: "faq_q1", aKey: "faq_a1" },
  { icon: Repeat, qKey: "faq_q2", aKey: "faq_a2" },
  { icon: Flower2, qKey: "faq_q3", aKey: "faq_a3" },
  { icon: Languages, qKey: "faq_q4", aKey: "faq_a4" },
  { icon: Music, qKey: "faq_q5", aKey: "faq_a5", requiresLogin: true },
  { icon: Plus, qKey: "faq_q6", aKey: "faq_a6" },
  { icon: StickyNote, qKey: "faq_q7", aKey: "faq_a7" },
  { icon: ImageIcon, qKey: "faq_q8", aKey: "faq_a8" },
  { icon: Sparkles, qKey: "faq_q9", aKey: "faq_a9", requiresLogin: true },
  { icon: Settings, qKey: "faq_q10", aKey: "faq_a10", requiresLogin: true },
  { icon: Rocket, qKey: "faq_q11", aKey: "faq_a11" },
  { icon: Sparkles, qKey: "faq_q12", aKey: "faq_a12", requiresLogin: true },
];

export function HelpGuide() {
  const { t } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Help"
        className="fixed bottom-6 left-6 z-50 w-7 h-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              {t("guide_title")}
            </DialogTitle>
            <DialogDescription>{t("guide_subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mt-1">
            <h3 className="font-display font-bold text-sm text-foreground mb-1.5">
              {t("guide_intro_title")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("guide_intro_body")}
            </p>
          </div>

          <div className="space-y-3 mt-2">
            {FAQ.map(({ icon: Icon, qKey, aKey, requiresLogin }, i) => {
              const locked = requiresLogin && !user;
              return (
                <div key={i} className={`relative rounded-lg border border-border bg-card/50 p-3 transition-colors ${locked ? "opacity-70" : "hover:bg-card"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-1.5">
                        {t(qKey)}
                        {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t(aKey)}</p>
                      {locked && (
                        <Link
                          to="/auth"
                          onClick={() => setOpen(false)}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90"
                        >
                          <LogIn className="w-3 h-3" /> {t("login_first")}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 mt-2 space-y-1.5 text-center">
              <p className="text-[11px] text-muted-foreground">{t("contact_suggest")}</p>
              <p className="text-[11px] italic text-muted-foreground" style={{ opacity: 0.3 }}>
                {t("easter_hint")}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
