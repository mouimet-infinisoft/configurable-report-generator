# Configurable Report Generator

A Next.js application for generating configurable reports with OCR and AI enhancement capabilities.

This project uses Supabase for authentication, database, and storage services.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account (for production)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local` for local development
   - Update with your Supabase credentials

### Local Development

1. Start the local Supabase instance:
   ```bash
   npx supabase start
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4. Test Supabase connection at [http://localhost:3000/supabase-test](http://localhost:3000/supabase-test)

5. Test storage functionality at [http://localhost:3000/storage-test](http://localhost:3000/storage-test)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

- `src/` - Application source code
  - `app/` - Next.js app router pages
  - `lib/` - Utility functions and libraries
  - `types/` - TypeScript type definitions
- `supabase/` - Supabase configuration and migrations
  - `migrations/` - Database migration files
- `doc/` - Project documentation

## Supabase Setup

This project uses Supabase for:
- Authentication (email/password and social login)
- Database (PostgreSQL)
- Storage (for images and PDFs)

For detailed setup instructions, see:
- `doc/Supabase_Setup_Guide.md` - Comprehensive setup guide
- `supabase/README.md` - Quick reference for Supabase setup

## Deployment

### Production Environment

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Apply migrations to your production database:
   ```bash
   npx supabase db push
   ```
3. Set up environment variables in your hosting platform
4. Build and deploy the application:
   ```bash
   npm run build
   ```

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
