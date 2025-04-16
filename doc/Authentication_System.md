# Authentication System Documentation

This document provides detailed information about the authentication system for the Configurable Report Generator application.

## Overview

The authentication system is built using Supabase Auth and provides the following features:

1. **Email/Password Authentication**
   - Sign up with email and password
   - Sign in with email and password
   - Password reset functionality
   - Email verification

2. **Authentication State Management**
   - Authentication context provider
   - Protected routes with middleware
   - User session management

## Components

### Authentication Context Provider

The `AuthProvider` component provides authentication state and methods to all components in the application. It is located in `src/lib/auth/auth-context.tsx` and provides the following:

- `user`: The current authenticated user
- `session`: The current session
- `isLoading`: Whether the authentication state is loading
- `signUp`: Method to sign up a new user
- `signIn`: Method to sign in a user
- `signOut`: Method to sign out a user
- `resetPassword`: Method to request a password reset
- `updatePassword`: Method to update a user's password

### Authentication Pages

The application includes the following authentication pages:

1. **Sign Up Page** (`/auth/signup`)
   - Allows users to create a new account
   - Validates email and password
   - Sends verification email

2. **Login Page** (`/auth/login`)
   - Allows users to sign in with email and password
   - Provides "Remember me" option
   - Includes "Forgot password" link

3. **Forgot Password Page** (`/auth/forgot-password`)
   - Allows users to request a password reset
   - Sends password reset email

4. **Update Password Page** (`/auth/update-password`)
   - Allows users to set a new password
   - Validates password strength

5. **Email Verification Page** (`/auth/verify`)
   - Verifies user's email address
   - Shows verification status

### Middleware

The application uses Next.js middleware to protect routes that require authentication. The middleware is located in `src/middleware.ts` and does the following:

- Checks if the user is authenticated
- Redirects unauthenticated users to the login page
- Redirects authenticated users away from auth pages
- Allows public routes to be accessed without authentication

## Authentication Flow

### Sign Up Flow

1. User enters email, password, and full name
2. Form validates input
3. `signUp` method is called
4. Supabase creates a new user
5. Verification email is sent
6. User is redirected to verification page

### Login Flow

1. User enters email and password
2. Form validates input
3. `signIn` method is called
4. Supabase authenticates the user
5. User is redirected to dashboard

### Password Reset Flow

1. User requests password reset
2. User receives email with reset link
3. User clicks link and is redirected to update password page
4. User enters new password
5. `updatePassword` method is called
6. User is redirected to login page

### Email Verification Flow

1. User receives verification email
2. User clicks verification link
3. User is redirected to verification page
4. Email is verified
5. User can now sign in

## Security Considerations

- Passwords are securely hashed by Supabase
- Email verification is required for new accounts
- Password strength requirements are enforced
- Authentication state is managed securely
- Protected routes are enforced with middleware
- Session tokens are handled securely

## Usage Examples

### Accessing the Current User

```tsx
import { useAuth } from '@/lib/auth/auth-context';

function MyComponent() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello, {user.email}</div>;
}
```

### Signing Out

```tsx
import { useAuth } from '@/lib/auth/auth-context';

function SignOutButton() {
  const { signOut } = useAuth();
  
  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  );
}
```

### Protected Component

```tsx
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedComponent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  return <div>Protected content</div>;
}
```
