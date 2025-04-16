'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function StorageTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{success: boolean; message: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // Upload to a public test bucket that doesn't require authentication
      const { data, error } = await supabase.storage
        .from('public-test')
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) throw error;

      setUploadResult({
        success: true,
        message: `File uploaded successfully: ${data.path}`
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadResult({
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Storage Test</h1>

      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {uploading ? 'Uploading...' : 'Upload to Supabase'}
        </button>
      </div>

      {uploadResult && (
        <div className={`p-4 rounded ${uploadResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className={uploadResult.success ? 'text-green-700' : 'text-red-700'}>
            {uploadResult.message}
          </p>
        </div>
      )}
    </div>
  );
}
