-- Create OCR results table
CREATE TABLE IF NOT EXISTS ocr_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  language TEXT NOT NULL,
  words JSONB,
  paragraphs TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(image_id)
);

-- Add RLS policies
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;

-- Policy for selecting OCR results
CREATE POLICY select_ocr_results ON ocr_results
  FOR SELECT
  USING (
    image_id IN (
      SELECT id FROM images WHERE owner_id = auth.uid()
    )
  );

-- Policy for inserting OCR results
CREATE POLICY insert_ocr_results ON ocr_results
  FOR INSERT
  WITH CHECK (
    image_id IN (
      SELECT id FROM images WHERE owner_id = auth.uid()
    )
  );

-- Policy for updating OCR results
CREATE POLICY update_ocr_results ON ocr_results
  FOR UPDATE
  USING (
    image_id IN (
      SELECT id FROM images WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    image_id IN (
      SELECT id FROM images WHERE owner_id = auth.uid()
    )
  );

-- Policy for deleting OCR results
CREATE POLICY delete_ocr_results ON ocr_results
  FOR DELETE
  USING (
    image_id IN (
      SELECT id FROM images WHERE owner_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_ocr_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ocr_results_updated_at
BEFORE UPDATE ON ocr_results
FOR EACH ROW
EXECUTE FUNCTION update_ocr_results_updated_at();
