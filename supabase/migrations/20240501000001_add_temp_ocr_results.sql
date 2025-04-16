-- Create a temporary OCR results table without foreign key constraints
CREATE TABLE IF NOT EXISTS public.temp_ocr_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id TEXT NOT NULL,
  text TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  language TEXT NOT NULL,
  words JSONB,
  paragraphs TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.temp_ocr_results ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own OCR results
CREATE POLICY "Users can view their own temp OCR results" 
  ON public.temp_ocr_results FOR SELECT 
  TO authenticated;

-- Create policy for users to insert their own OCR results
CREATE POLICY "Users can insert their own temp OCR results" 
  ON public.temp_ocr_results FOR INSERT 
  TO authenticated;

-- Create policy for users to update their own OCR results
CREATE POLICY "Users can update their own temp OCR results" 
  ON public.temp_ocr_results FOR UPDATE 
  TO authenticated;

-- Create policy for users to delete their own OCR results
CREATE POLICY "Users can delete their own temp OCR results" 
  ON public.temp_ocr_results FOR DELETE 
  TO authenticated;

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_temp_ocr_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at column
CREATE TRIGGER update_temp_ocr_results_updated_at
BEFORE UPDATE ON public.temp_ocr_results
FOR EACH ROW
EXECUTE FUNCTION public.update_temp_ocr_results_updated_at();
