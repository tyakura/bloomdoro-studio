// Tiny localStorage helper with ~10MB budget
const BUDGET = 10 * 1024 * 1024; // 10 MB

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): boolean {
  try {
    const str = JSON.stringify(value);
    if (str.length > BUDGET) {
      console.warn(`[persist] ${key} too large (${str.length} bytes), skipped`);
      return false;
    }
    localStorage.setItem(key, str);
    return true;
  } catch (e) {
    console.warn(`[persist] failed to save ${key}`, e);
    return false;
  }
}

// Convert a File or blob URL into a base64 data URL (for persistence across reloads)
export async function toDataURL(src: string | File, maxSize = 1600): Promise<string> {
  const file = typeof src === "string"
    ? await fetch(src).then(r => r.blob())
    : src;

  // Only attempt resize for images
  if (file.type.startsWith("image/")) {
    return await resizeImage(file, maxSize);
  }

  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function resizeImage(blob: Blob, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        width *= scale;
        height *= scale;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no ctx"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}
