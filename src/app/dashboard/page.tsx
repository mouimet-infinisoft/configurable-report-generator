'use client';

import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
          <button
            onClick={() => signOut()}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">User Information</h3>
            <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.id}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {user?.email_confirmed_at ? 'Yes' : 'No'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Create a Report</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>Start creating a new report from scratch or use a template.</p>
              </div>
              <div className="mt-5">
                <Link
                  href="#"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  New Report
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Manage Templates</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>Create, edit, or delete your report templates.</p>
              </div>
              <div className="mt-5">
                <Link
                  href="#"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  View Templates
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recent Reports</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>You haven't created any reports yet.</p>
              </div>
              <div className="mt-5">
                <Link
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View all reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
