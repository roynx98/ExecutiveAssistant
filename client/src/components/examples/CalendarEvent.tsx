import { CalendarEvent } from "../CalendarEvent";

export default function CalendarEventExample() {
  const now = new Date();
  const events = [
    {
      id: "1",
      title: "Team Standup",
      startTime: new Date(now.setHours(9, 0, 0, 0)),
      endTime: new Date(now.setHours(9, 30, 0, 0)),
      attendees: 8,
      location: "Zoom",
      type: "meeting" as const,
      status: "confirmed" as const,
    },
    {
      id: "2",
      title: "Deep Work Block",
      startTime: new Date(now.setHours(10, 0, 0, 0)),
      endTime: new Date(now.setHours(12, 0, 0, 0)),
      type: "deep-work" as const,
      status: "confirmed" as const,
    },
  ];

  return (
    <div className="space-y-4 p-6 max-w-md">
      {events.map((event) => (
        <CalendarEvent key={event.id} {...event} />
      ))}
    </div>
  );
}
