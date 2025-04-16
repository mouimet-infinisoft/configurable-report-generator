-- Create OCR results table
CREATE TABLE IF NOT EXISTS public.ocr_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  language TEXT NOT NULL,
  words JSONB,
  paragraphs TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own OCR results
CREATE POLICY "Users can view their own OCR results" 
  ON public.ocr_results FOR SELECT 
  USING (
    image_id IN (
      SELECT id FROM public.images WHERE owner_id = auth.uid()
    )
  );

-- Create policy for users to insert their own OCR results
CREATE POLICY "Users can insert their own OCR results" 
  ON public.ocr_results FOR INSERT 
  WITH CHECK (
    image_id IN (
      SELECT id FROM public.images WHERE owner_id = auth.uid()
    )
  );

-- Create policy for users to update their own OCR results
CREATE POLICY "Users can update their own OCR results" 
  ON public.ocr_results FOR UPDATE 
  USING (
    image_id IN (
      SELECT id FROM public.images WHERE owner_id = auth.uid()
    )
  );

-- Create policy for users to delete their own OCR results
CREATE POLICY "Users can delete their own OCR results" 
  ON public.ocr_results FOR DELETE 
  USING (
    image_id IN (
      SELECT id FROM public.images WHERE owner_id = auth.uid()
    )
  );

-- Create policy for admins to view all OCR results
CREATE POLICY "Admins can view all OCR results" 
  ON public.ocr_results FOR SELECT 
  USING (public.is_admin());

-- Add status field to images table to track OCR processing status
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS ocr_status TEXT DEFAULT 'pending';
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS ocr_processed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS ocr_results_image_id_idx ON public.ocr_results(image_id);

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at column
CREATE TRIGGER update_ocr_results_updated_at
BEFORE UPDATE ON public.ocr_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
