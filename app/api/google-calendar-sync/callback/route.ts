
// File: pages/api/google-calendar/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { serialize } from 'cookie';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { code } = req.query;

    try {
      // Exchange authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code as string);
      
      // Store tokens securely (httpOnly cookie)
      res.setHeader('Set-Cookie', [
        serialize('google_access_token', tokens.access_token || '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: tokens.expiry_date ? 
            Math.floor((tokens.expiry_date - Date.now()) / 1000) : 
            3600,
          path: '/'
        }),
        serialize('google_refresh_token', tokens.refresh_token || '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/'
        })
      ]);

      // Redirect to todo app
      res.redirect('/todos');
    } catch (error) {
      console.error('Google OAuth Error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}