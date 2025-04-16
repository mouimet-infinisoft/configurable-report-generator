'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check if we have a token in the URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (token && type === 'email_confirmation') {
          // The token is automatically handled by Supabase Auth
          // We just need to check if the user is now confirmed
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (session?.user?.email_confirmed_at) {
            setVerificationStatus('success');
          } else {
            setVerificationStatus('error');
            setError('Email verification failed. Please try again or contact support.');
          }
        } else {
          // If there's no token, the user might have been redirected here after signup
          setVerificationStatus('loading');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setVerificationStatus('error');
        setError(err instanceof Error ? err.message : 'An error occurred during verification');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Verification</h2>
          
          {verificationStatus === 'loading' && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please check your email for a verification link. Click the link to verify your email address.
              </p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="mt-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="mt-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error || 'Verification failed. Please try again or contact support.'}
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Return to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
