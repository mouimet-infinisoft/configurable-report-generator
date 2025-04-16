# Supabase Setup Instructions

This document provides instructions for setting up Supabase for the Configurable Report Generator application.

## Creating a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com)
2. Create a new project with name "configurable-report-generator"
3. Select the closest region to your users for optimal performance
4. Note the project URL and API keys from the project settings

## Setting Up Environment Variables

1. Copy the `.env.local.example` file to `.env.local`
2. Fill in the Supabase URL and API keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Configuring Authentication Providers

### Email/Password Authentication
1. In the Supabase dashboard, go to Authentication > Providers
2. Enable Email provider
3. Configure settings as needed (confirm emails, etc.)

### Google OAuth
1. Create Google OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. In the Supabase dashboard, go to Authentication > Providers
3. Enable Google provider
4. Add the Client ID and Secret from Google

### GitHub OAuth
1. Create a GitHub OAuth app in [GitHub Developer Settings](https://github.com/settings/developers)
2. In the Supabase dashboard, go to Authentication > Providers
3. Enable GitHub provider
4. Add the Client ID and Secret from GitHub

## Storage Buckets

The storage buckets are automatically created when you start Supabase through the migrations in the `migrations` directory. The following buckets are created:

1. `images` - for storing uploaded images (private)
   - Requires authentication
   - Users can only access their own files

2. `pdfs` - for storing generated reports (private)
   - Requires authentication
   - Users can only access their own files

3. `public-test` - for testing uploads without authentication (public)
   - Does not require authentication
   - Allows anonymous uploads and downloads
   - Used for testing purposes only

## Testing the Setup

1. Run the application locally
2. Visit `/supabase-test` to verify the connection to Supabase
3. Visit `/storage-test` to test file uploads to the storage buckets

## Local Development with Supabase

For local development with Supabase:

1. Install Supabase CLI:
   ```bash
   npm install supabase --save-dev
   ```

2. Start Supabase locally:
   ```bash
   npx supabase start
   ```

3. Generate TypeScript types:
   ```bash
   npx supabase gen types typescript --local > src/types/supabase.ts
   ```
