-- Avatars storage bucket (public read)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for avatars
CREATE POLICY "Avatar public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- User can manage own avatar (folder = auth.uid())
CREATE POLICY "User upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Social links per user
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;