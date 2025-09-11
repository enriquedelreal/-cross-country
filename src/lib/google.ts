import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

let auth: JWT | null = null;

export function getGoogleAuth(): JWT {
  if (!auth) {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error('Missing Google Service Account credentials');
    }

    // Try to parse as JSON first (for Vercel), fallback to individual fields
    try {
      const credentials = JSON.parse(serviceAccountKey);
      auth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } catch {
      // Fallback to individual environment variables (for local development)
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      if (!serviceAccountEmail) {
        throw new Error('Missing Google Service Account credentials');
      }

      // Parse the private key - handle both escaped and unescaped formats
      let privateKey = serviceAccountKey;
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      auth = new JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    }
  }

  return auth;
}

export function getSheetsClient() {
  const auth = getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}
