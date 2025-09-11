import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

let auth: JWT | null = null;

export function getGoogleAuth(): JWT {
  if (!auth) {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountEmail || !serviceAccountKey) {
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

  return auth;
}

export function getSheetsClient() {
  const auth = getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}
