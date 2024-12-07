


// File: pages/api/google-calendar/sync.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
// import { cookies } from 'next/headers';

interface TodoItem {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Retrieve tokens from cookies
      const accessToken = req.cookies.google_access_token;
      const refreshToken = req.cookies.google_refresh_token;

      if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Set up OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials({ 
        access_token: accessToken,
        refresh_token: refreshToken 
      });

      // Create Google Calendar client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Parse todo item from request
      const { 
        title, 
        description, 
        dueDate, 
        priority 
      }: TodoItem = req.body;

      // Create calendar event
      const event = await calendar.events.insert({
        calendarId: 'primary', // User's primary calendar
        requestBody: {
          summary: title,
          description: `${description || ''}\nPriority: ${priority}`,
          start: {
            dateTime: dueDate ? new Date(dueDate).toISOString() : undefined,
            timeZone: 'UTC'
          },
          end: {
            dateTime: dueDate ? new Date(new Date(dueDate).getTime() + 3600000).toISOString() : undefined, // 1 hour duration
            timeZone: 'UTC'
          },
          colorId: getPriorityColor(priority)
        }
      });

      res.status(200).json({ 
        id: event.data.id,
        htmlLink: event.data.htmlLink
      });
    } catch (error) {
      console.error('Google Calendar Sync Error:', error);
      res.status(500).json({ error: 'Failed to sync with Google Calendar' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Handle event deletion
      const { eventId } = req.query;
      const accessToken = req.cookies.google_access_token;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials({ 
        access_token: accessToken 
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId as string
      });

      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Google Calendar Delete Error:', error);
      res.status(500).json({ error: 'Failed to delete calendar event' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Utility function to map priority to Google Calendar color
function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  const colorMap = {
    'low': '10', // Green
    'medium': '5', // Yellow
    'high': '11' // Red
  };
  return colorMap[priority];
}

// File: .env.local (Example environment configuration)
// # Google OAuth Credentials
// GOOGLE_CLIENT_ID=your_google_client_id
// GOOGLE_CLIENT_SECRET=your_google_client_secret
// GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback