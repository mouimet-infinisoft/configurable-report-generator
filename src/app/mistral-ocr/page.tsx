import { MistralOCR } from '@/components/ocr/mistral-ocr';

export default function MistralOCRPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mistral Pixtral OCR Demo</h1>
      <MistralOCR />
    </div>
  );
}
