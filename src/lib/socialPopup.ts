// Open a social network in a slim popup window (since most embed via iframe is blocked).
export type SocialPlatform = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin";

export const SOCIAL_LINKS: Record<SocialPlatform, string> = {
  instagram: "https://www.instagram.com",
  tiktok: "https://www.tiktok.com",
  youtube: "https://www.youtube.com",
  facebook: "https://www.facebook.com",
  linkedin: "https://www.linkedin.com",
};

export function openSocialPopup(platform: SocialPlatform) {
  const url = SOCIAL_LINKS[platform];
  const features = "popup=yes,width=450,height=750,noopener,noreferrer,scrollbars=yes,resizable=yes";
  window.open(url, "_blank", features);
}
