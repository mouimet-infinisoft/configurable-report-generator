'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

interface AuthFormProps {
  title: string;
  description: string;
  schema: z.ZodObject<any>;
  onSubmit: (data: any) => Promise<void>;
  submitText: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthForm({
  title,
  description,
  schema,
  onSubmit,
  submitText,
  children,
  footer,
}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="flex">
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {children}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : submitText}
            </button>
          </div>
        </form>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
