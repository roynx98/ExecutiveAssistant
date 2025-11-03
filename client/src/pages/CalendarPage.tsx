import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarEvent } from "@/components/CalendarEvent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface CalendarEventData {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees?: number;
  location?: string;
  type?: "meeting" | "deep-work" | "buffer";
  status?: "confirmed" | "tentative" | "declined";
}

export default function CalendarPage() {
  const [workHoursEnabled, setWorkHoursEnabled] = useState(true);
  const [bufferEnabled, setBufferEnabled] = useState(true);
  const [currentDate] = useState(new Date());

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i));

  const { data, isLoading, error } = useQuery<{ events: CalendarEventData[] }>({
    queryKey: ['/api/calendar/today'],
  });

  const events = data?.events.map(event => ({
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your schedule and guardrails
          </p>
        </div>
        <Button data-testid="button-new-event">
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" data-testid="button-prev-week">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-xl font-semibold">
                    Week of {format(currentDate, "MMM d, yyyy")}
                  </CardTitle>
                  <Button variant="outline" size="icon" data-testid="button-next-week">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="secondary">Eastern Time</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8" data-testid="loading-events">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-8 space-y-4" data-testid="error-events">
                  <p className="text-sm text-destructive">
                    Failed to load calendar events
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/api/oauth/authorize'}
                    data-testid="button-connect-google"
                  >
                    Connect Google Calendar
                  </Button>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-events">
                  <p className="text-sm text-muted-foreground">
                    No events scheduled for today
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <CalendarEvent key={event.id} {...event} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Calendar Guardrails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="work-hours">Work Hours Protection</Label>
                    <p className="text-xs text-muted-foreground">
                      8 AM - 4 PM ET only
                    </p>
                  </div>
                  <Switch
                    id="work-hours"
                    checked={workHoursEnabled}
                    onCheckedChange={(checked) => {
                      console.log("Work hours toggled:", checked);
                      setWorkHoursEnabled(checked);
                    }}
                    data-testid="switch-work-hours"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="buffer">Meeting Buffers</Label>
                    <p className="text-xs text-muted-foreground">
                      15 min between meetings
                    </p>
                  </div>
                  <Switch
                    id="buffer"
                    checked={bufferEnabled}
                    onCheckedChange={(checked) => {
                      console.log("Buffer toggled:", checked);
                      setBufferEnabled(checked);
                    }}
                    data-testid="switch-buffer"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label>Meeting Windows</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      defaultValue="09:00"
                      className="flex-1"
                      data-testid="input-window-start"
                    />
                    <span className="flex items-center text-muted-foreground">
                      to
                    </span>
                    <Input
                      type="time"
                      defaultValue="12:00"
                      className="flex-1"
                      data-testid="input-window-end"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Preferred meeting hours
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label>Deep Work Blocks</Label>
                <div className="space-y-2">
                  <Badge variant="secondary">10:00 AM - 12:00 PM</Badge>
                  <Badge variant="secondary">2:00 PM - 3:30 PM</Badge>
                  <Button variant="outline" size="sm" className="w-full mt-2" data-testid="button-add-deep-work">
                    Add Block
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
