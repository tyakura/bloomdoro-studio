import { useState, useRef } from "react";
import { Settings, X, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsModalProps {
  onMusicLoad: (url: string, name: string) => void;
}

export function SettingsModal({ onMusicLoad }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onMusicLoad(url, file.name);
    }
  };

  const handleYoutubeSubmit = () => {
    if (youtubeUrl.trim()) {
      onMusicLoad(youtubeUrl, "YouTube Audio");
      setYoutubeUrl("");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm font-medium"
      >
        <Settings className="w-4 h-4" />
        Settings
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-foreground">Settings</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Upload Music from Device</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose audio file
            </Button>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">YouTube Link</h3>
            <div className="flex gap-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube URL..."
                className="flex-1"
              />
              <Button onClick={handleYoutubeSubmit} size="icon" variant="outline">
                <Link className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: YouTube playback requires the URL to be a direct audio link or embed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
