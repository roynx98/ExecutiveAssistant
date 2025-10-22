import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

export async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export interface EmailThread {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: Date;
  labels: string[];
  priority?: 'high' | 'normal' | 'low';
  unread: boolean;
}

export async function fetchRecentEmails(maxResults: number = 10): Promise<EmailThread[]> {
  const gmail = await getUncachableGmailClient();
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'in:inbox',
  });

  const threads: EmailThread[] = [];
  
  if (response.data.messages) {
    for (const message of response.data.messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
      const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
      const dateHeader = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';
      
      const senderMatch = fromHeader.match(/^(.*?)\s*<(.+?)>$/);
      const sender = senderMatch ? senderMatch[1].trim() : fromHeader;
      const senderEmail = senderMatch ? senderMatch[2].trim() : fromHeader;

      let snippet = detail.data.snippet || '';
      
      const labelIds = detail.data.labelIds || [];
      const unread = labelIds.includes('UNREAD');
      const important = labelIds.includes('IMPORTANT');

      threads.push({
        id: message.id!,
        sender,
        senderEmail,
        subject: subjectHeader,
        preview: snippet,
        timestamp: new Date(dateHeader || Date.now()),
        labels: labelIds.filter(l => !['UNREAD', 'INBOX', 'CATEGORY_PERSONAL'].includes(l)),
        priority: important ? 'high' : 'normal',
        unread,
      });
    }
  }

  return threads;
}

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const gmail = await getUncachableGmailClient();

  const messageParts = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body
  ];

  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
}
