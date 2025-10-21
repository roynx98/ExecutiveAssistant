import { format } from "date-fns";
import { Clock, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CalendarEventProps {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees?: number;
  location?: string;
  type?: "meeting" | "deep-work" | "buffer";
  status?: "confirmed" | "tentative" | "declined";
}

export function CalendarEvent({
  id,
  title,
  startTime,
  endTime,
  attendees,
  location,
  type = "meeting",
  status = "confirmed",
}: CalendarEventProps) {
  const typeColors = {
    meeting: "border-l-primary",
    "deep-work": "border-l-chart-2",
    buffer: "border-l-chart-3",
  };

  return (
    <Card
      className={`border-l-4 ${typeColors[type]} hover-elevate`}
      data-testid={`event-${id}`}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-snug">{title}</h4>
            {status === "tentative" && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Tentative
              </Badge>
            )}
            {status === "declined" && (
              <Badge variant="destructive" className="text-xs flex-shrink-0">
                Declined
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </span>
          </div>
          {attendees && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{attendees} attendees</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
