// File: pages/api/google-calendar/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
// import { serialize } from 'cookie';

// Google OAuth2 Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // Your redirect URI
);

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Generate Google OAuth consent screen URL
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Allows getting refresh token
      scope: scopes,
      prompt: 'consent' // Forces consent screen on every login
    });

    res.redirect(authUrl);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}