import { Flower2 } from "lucide-react";

export function BloomdoroLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
        <Flower2 className="w-6 h-6 text-primary" />
      </div>
      <span className="text-xl font-display font-bold tracking-tight text-foreground">
        BLOOMDORO
      </span>
    </div>
  );
}
