DROP POLICY IF EXISTS "Public read ai-exports files" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload ai-exports" ON storage.objects;
DROP POLICY IF EXISTS "Owner read ai-exports" ON storage.objects;
DROP POLICY IF EXISTS "Owner insert ai-exports" ON storage.objects;
DROP POLICY IF EXISTS "Owner update ai-exports" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete ai-exports" ON storage.objects;

CREATE POLICY "Owner read ai-exports" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ai-exports' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner insert ai-exports" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ai-exports' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner update ai-exports" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'ai-exports' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'ai-exports' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner delete ai-exports" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ai-exports' AND (auth.uid())::text = (storage.foldername(name))[1]);