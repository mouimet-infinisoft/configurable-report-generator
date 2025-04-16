'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        // Just ping the Supabase API
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setIsConnected(true);
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsConnected(false);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      {isConnected === null ? (
        <p>Checking connection...</p>
      ) : isConnected ? (
        <p className="text-green-600">Connected to Supabase!</p>
      ) : (
        <div>
          <p className="text-red-600">Failed to connect to Supabase.</p>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
