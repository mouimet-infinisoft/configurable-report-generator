import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/next.svg"
            alt="Logo"
            width={180}
            height={38}
            className="mb-8 dark:invert"
            priority
          />
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight">
            Configurable Report Generator
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
