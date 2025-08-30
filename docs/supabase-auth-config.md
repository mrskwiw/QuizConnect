# Supabase Authentication Configuration Guide

## Password Reset Configuration

The issue with password reset links showing as "invalid or expired" immediately is most likely due to missing redirect URL configuration in your Supabase project.

### Current Configuration

- **Site URL**: `https://clinquant-blini-606135.netlify.app/`
- **Redirect URLs**: `https://clinquant-blini-606135.netlify.app/reset-password` (CONFIGURED)
- **Password Reset Link Expiration**: 1800 seconds (30 minutes)
- **Status**: Redirect URL has been added but password reset still not working

### Required Configuration

When the application sends a password reset email, it includes a redirect URL (`https://clinquant-blini-606135.netlify.app/reset-password`). Supabase requires this exact URL to be explicitly whitelisted in your project settings.

### Additional Configuration Issues to Check

Since the redirect URL is already configured, other possible causes include:

1. **PKCE Flow - Automatic in Supabase**:
   - PKCE is **automatically enabled** in Supabase and cannot be disabled
   - The `flowType: 'pkce'` setting in client code is correct
   - No manual PKCE configuration needed in Supabase dashboard

2. **Email Template Configuration**:
   - Check if custom email templates are configured correctly
   - Verify the magic link template includes the correct redirect URL
   - Ensure the template uses `{{ .ConfirmationURL }}` not hardcoded URLs
   - **Critical**: Template must respect the `redirectTo` parameter

3. **Netlify SPA Redirect Conflict**:
   - The `/* /index.html 200` redirect in `_redirects` may strip URL parameters
   - This could prevent auth codes from reaching the React app
   - Consider adding specific auth route exceptions

4. **Session Detection vs URL Fragments**:
   - `detectSessionInUrl: true` expects URL fragments (#) or query params (?)
   - Supabase may send fragments that get lost in SPA redirects
   - Check if auth codes are in URL fragments vs query parameters

5. **Domain/CORS Configuration**:
   - Verify the exact domain matches in Supabase settings
   - Check for trailing slashes or protocol mismatches
   - Ensure CORS settings allow the domain

6. **Email Provider Settings**:
   - Check if email delivery is working properly
   - Verify SMTP settings if using custom email provider
   - Test if emails contain the correct redirect URLs

### Most Likely Cause: Netlify SPA Redirect Issue

The primary suspect is the Netlify SPA redirect configuration in `_redirects`:
```
/*    /index.html   200
```

This redirect may be stripping URL parameters/fragments before they reach the React Router, preventing the auth code from being processed.

### Debugging Steps

1. **Test URL Parameter Preservation**:
   - Check if auth codes survive the Netlify redirect
   - Add logging to see what URL parameters reach the React app

2. **Check Email Template**:
   - Verify the password reset email contains the correct URL format
   - Ensure it uses query parameters (?code=...) not fragments (#access_token=...)

3. **Browser Console Debugging**:
   - Add detailed logging to ResetPassword.tsx useEffect
   - Check for errors when clicking reset link

4. **Network Tab**: Monitor requests to Supabase during reset flow

5. **Supabase Logs**: Check authentication logs in Supabase dashboard

### Potential Solutions

1. **Update Netlify Redirects**: Add exception for auth routes
2. **Change Flow Type**: Consider switching from PKCE if issues persist
3. **Manual Session Handling**: Implement custom auth code processing

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