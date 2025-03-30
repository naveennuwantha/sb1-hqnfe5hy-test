# Google Authentication Setup Guide for Nexia

This guide will help you correctly set up Google OAuth authentication with Supabase for your Nexia application.

## 1. Configure Google OAuth in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials** and select **OAuth client ID**
5. Select **Web application** as the application type
6. Add a name for your OAuth client
7. Under **Authorized JavaScript origins**, add:
   - `https://your-app-url.vercel.app` (your production URL)
   - `http://localhost:3000` (for local development)
8. Under **Authorized redirect URIs**, add:
   - `https://your-app-url.vercel.app/auth/callback` (your production URL)
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://<your-supabase-project>.supabase.co/auth/v1/callback` (your Supabase project URL)
9. Click **Create**
10. Note your **Client ID** and **Client Secret**

## 2. Configure Supabase Authentication

1. Go to your [Supabase dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find **Google** and click **Edit**
5. Toggle the **Enabled** switch to **On**
6. Enter your **Client ID** and **Client Secret** from Google Cloud Console
7. For **Authorized Redirect URLs**, add:
   - `https://your-app-url.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
8. Save your changes

## 3. Update Environment Variables

Make sure your project has the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## 4. Troubleshooting Google Authentication

If Google authentication is not working, check the following:

### Check Browser Console

Open your browser's developer tools (F12) and look for any errors in the console.

### Verify Redirect URLs

Ensure your redirect URLs are correctly set in both Google Cloud Console and Supabase.

### Check Network Requests

1. Open Network tab in browser developer tools
2. Click the Google login button
3. Look for any failed network requests

### Common Errors and Solutions

1. **"Invalid redirect_uri"**: The redirect URI in your code doesn't match what's configured in Google Cloud Console
   - Solution: Add the exact URL to your authorized redirect URIs

2. **"Error: redirect_uri_mismatch"**: The callback URL is not authorized
   - Solution: Make sure the callback URL is added to both Google Cloud Console and Supabase

3. **"Error: invalid_client"**: Client ID or secret is incorrect
   - Solution: Double-check your Client ID and Client Secret in Supabase

4. **CORS errors**: Occurs when API requests are made from unauthorized domains
   - Solution: Add your domain to the authorized JavaScript origins in Google Cloud Console

## 5. Testing Authentication Flow

1. Clear your browser cookies and cache
2. Open your application
3. Click "Continue with Google"
4. Select a Google account
5. You should be redirected back to your application and signed in

If you encounter issues, check the browser console and network tab for specific error messages. 