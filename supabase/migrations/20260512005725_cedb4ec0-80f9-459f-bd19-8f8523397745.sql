
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- restrict listing of ai-exports (only allow direct file fetches, not list)
DROP POLICY IF EXISTS "Public read ai-exports" ON storage.objects;
CREATE POLICY "Public read ai-exports files" ON storage.objects
FOR SELECT USING (bucket_id = 'ai-exports' AND (storage.foldername(name))[1] IS NOT NULL);
