-- Create storage buckets for images and PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Create a public test bucket that doesn't require authentication
INSERT INTO storage.buckets (id, name, public) VALUES ('public-test', 'public-test', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for images bucket - allow authenticated users to upload to their own folder
CREATE POLICY "Allow users to upload images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for images bucket - allow authenticated users to select their own images
CREATE POLICY "Allow users to view their own images" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for pdfs bucket - allow authenticated users to upload to their own folder
CREATE POLICY "Allow users to upload PDFs" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for pdfs bucket - allow authenticated users to select their own PDFs
CREATE POLICY "Allow users to view their own PDFs" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for public-test bucket - allow anonymous uploads (for testing purposes only)
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'public-test');

-- Policy for public-test bucket - allow public downloads
CREATE POLICY "Allow public downloads" 
ON storage.objects FOR SELECT 
TO anon 
USING (bucket_id = 'public-test');
