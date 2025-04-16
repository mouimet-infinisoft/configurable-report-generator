# Supabase Setup Guide for Configurable Report Generator

This guide provides detailed instructions for setting up Supabase for the Configurable Report Generator application.

## 1. Creating a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com)
2. Click "New Project" and provide the following details:
   - Name: configurable-report-generator
   - Database Password: (create a secure password)
   - Region: (select the closest region to your users)
3. Click "Create new project" and wait for the project to be created (this may take a few minutes)

## 2. Getting Your API Keys

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on the gear icon (Settings)
3. Click on "API" in the submenu
4. You'll find your API keys in the "Project API keys" section:
   - `anon` / `public`: This key is safe to use in a browser context
   - `service_role`: This key should only be used in secure server environments

## 3. Setting Up Environment Variables

1. In your project root, create a `.env.local` file (or copy from `.env.local.example`)
2. Add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Replace the placeholder values with your actual Supabase URL and keys

## 4. Configuring Authentication

### Email/Password Authentication

1. In the Supabase dashboard, go to Authentication > Providers
2. Make sure the Email provider is enabled
3. Configure the following settings:
   - Confirm emails: Enabled (recommended for production)
   - Secure email change: Enabled (recommended for production)
   - Custom email templates: Customize if needed

### Google OAuth

1. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/):
   - Create a new project (if needed)
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`
2. In the Supabase dashboard, go to Authentication > Providers
3. Find Google in the list and enable it
4. Enter the Client ID and Secret from Google Cloud Console

### GitHub OAuth

1. Create a new OAuth app in [GitHub Developer Settings](https://github.com/settings/developers):
   - Go to Settings > Developer settings > OAuth Apps > New OAuth App
   - Application name: Configurable Report Generator
   - Homepage URL: Your application URL
   - Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
2. In the Supabase dashboard, go to Authentication > Providers
3. Find GitHub in the list and enable it
4. Enter the Client ID and Secret from GitHub

## 5. Storage Buckets

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

You can verify that the buckets were created correctly by going to the Storage section in the Supabase dashboard.

## 6. Testing Your Setup

1. Run your Next.js application:
   ```bash
   npm run dev
   ```
2. Visit the following pages to test your Supabase setup:
   - `/supabase-test` - Tests the connection to Supabase
   - `/storage-test` - Tests file uploads to the storage buckets

## 7. Local Development with Supabase (Optional)

For local development, you can run Supabase locally:

1. Install the Supabase CLI (already added as a dev dependency)
2. Start Supabase locally:
   ```bash
   npm run supabase:start
   ```
3. Generate TypeScript types:
   ```bash
   npm run supabase:types
   ```
4. Stop Supabase when done:
   ```bash
   npm run supabase:stop
   ```

## Troubleshooting

### Connection Issues
- Verify that your environment variables are correctly set
- Check that your Supabase project is active
- Ensure your API keys are correct

### Authentication Issues
- Check that the authentication providers are properly configured
- Verify redirect URLs in OAuth providers
- Check browser console for errors

### Storage Issues
- Verify that the storage buckets are created
- Check that the bucket policies are correctly set
- Ensure users are authenticated before attempting uploads
