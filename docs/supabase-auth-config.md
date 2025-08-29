# Supabase Authentication Configuration Guide

## Password Reset Configuration

The issue with password reset links showing as "invalid or expired" immediately is most likely due to missing redirect URL configuration in your Supabase project.

### Current Configuration

- **Site URL**: `https://clinquant-blini-606135.netlify.app/`
- **Redirect URLs**: None configured
- **Password Reset Link Expiration**: 1800 seconds (30 minutes)

### Required Configuration

When the application sends a password reset email, it includes a redirect URL (`https://clinquant-blini-606135.netlify.app/reset-password`). Supabase requires this exact URL to be explicitly whitelisted in your project settings.

### Steps to Fix

1. **Log in to your Supabase Dashboard**: [https://app.supabase.com](https://app.supabase.com)

2. **Navigate to Authentication Settings**:
   - Go to your project
   - Click on "Authentication" in the left sidebar
   - Select "URL Configuration"

3. **Add the Redirect URL**:
   - In the "Redirect URLs" section, click "Add URL"
   - Enter: `https://clinquant-blini-606135.netlify.app/reset-password`
   - Save changes

4. **Test the Password Reset Flow**:
   - Once configured, try the password reset flow again
   - The link should now work correctly

### Code Changes Made

- Added detailed error logging in `ResetPassword.tsx`
- Enhanced redirect URL logging in `supabase.ts` and `ForgotPassword.tsx`
- These changes will help diagnose similar issues in the future

## Understanding Supabase Auth URLs

### URL Types

1. **Site URL**: The base URL of your application. Used as default for redirects.
2. **Redirect URLs**: Allowed URLs for authentication redirects (login, signup, password reset).

### Security Considerations

Supabase requires explicit redirect URL configuration to prevent open redirect vulnerabilities. Without proper configuration:

- Password reset links won't work
- OAuth login flows may fail
- Email verification may encounter issues

### Best Practices

- Add all necessary redirect URLs for each environment (development, staging, production)
- For local development, include URLs like `http://localhost:5173/reset-password`
- Review URL configurations when deploying to new environments