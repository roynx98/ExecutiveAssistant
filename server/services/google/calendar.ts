import { google } from "googleapis";

let connectionSettings: any;

async function getAccessToken() {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;

  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }

  connectionSettings = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=google-calendar",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    },
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) {
    throw new Error("Google Calendar not connected");
  }
  return accessToken;
}

export async function getUncachableGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees?: number;
  location?: string;
  type?: "meeting" | "deep-work" | "buffer";
  status?: "confirmed" | "tentative" | "declined";
}

export async function fetchTodayEvents(): Promise<CalendarEvent[]> {
  const calendar = await getUncachableGoogleCalendarClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const events: CalendarEvent[] = [];

  if (response.data.items) {
    for (const event of response.data.items) {
      const startTime = event.start?.dateTime
        ? new Date(event.start.dateTime)
        : new Date(event.start?.date || "");
      const endTime = event.end?.dateTime
        ? new Date(event.end.dateTime)
        : new Date(event.end?.date || "");

      const attendeeCount = event.attendees?.length || 0;

      let eventType: "meeting" | "deep-work" | "buffer" = "meeting";
      const summary = (event.summary || "").toLowerCase();
      if (summary.includes("deep work") || summary.includes("focus")) {
        eventType = "deep-work";
      } else if (summary.includes("buffer")) {
        eventType = "buffer";
      }

      let status: "confirmed" | "tentative" | "declined" = "confirmed";
      if (event.status === "tentative") status = "tentative";
      if (event.status === "cancelled") status = "declined";

      events.push({
        id: event.id!,
        title: event.summary || "Untitled Event",
        startTime,
        endTime,
        attendees: attendeeCount > 0 ? attendeeCount : undefined,
        location: event.location || undefined,
        type: eventType,
        status,
      });
    }
  }

  return events;
}

export function isWithinWorkHours(
  time: Date,
  workdayStart: string = "08:00",
  workdayEnd: string = "16:00",
): boolean {
  const [startHour, startMin] = workdayStart.split(":").map(Number);
  const [endHour, endMin] = workdayEnd.split(":").map(Number);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const startInMinutes = startHour * 60 + startMin;
  const endInMinutes = endHour * 60 + endMin;

  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
}
