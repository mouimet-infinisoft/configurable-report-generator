import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-2">Configurable Report Generator</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Convert images of handwritten or typed notes into professionally formatted PDF reports using customizable templates.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-500 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/auth/login"
          >
            Sign In
          </Link>
          <Link
            className="rounded-full border border-solid border-blue-600 transition-colors flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-950 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/auth/signup"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-8 w-full">
          <h2 className="text-xl font-semibold mb-4">Test Pages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              href="/supabase-test"
            >
              <h3 className="font-medium">Supabase Connection Test</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Test the connection to Supabase</p>
            </Link>
            <Link
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              href="/storage-test"
            >
              <h3 className="font-medium">Storage Test</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Test file uploads to Supabase Storage</p>
            </Link>
            <Link
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              href="/db-test"
            >
              <h3 className="font-medium">Database Test</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Test the database schema and operations</p>
            </Link>
            <Link
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              href="/upload"
            >
              <h3 className="font-medium">Image Upload</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Test drag-and-drop image uploads</p>
            </Link>
            <Link
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              href="/ocr-test"
            >
              <h3 className="font-medium">OCR Processing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Test OCR text extraction from images</p>
            </Link>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
