-- Create a bucket for church logos
INSERT INTO storage.buckets (id, name, public) VALUES ('church-logos', 'church-logos', true);

-- Create storage policies for church logos
CREATE POLICY "Admins can upload church logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'church-logos' AND auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Church logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'church-logos');

CREATE POLICY "Admins can update church logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'church-logos' AND auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete church logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'church-logos' AND auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));