import { BriefCard } from "@/components/BriefCard";
import { CalendarEvent } from "@/components/CalendarEvent";
import { EmailThread } from "@/components/EmailThread";
import { TaskItem } from "@/components/TaskItem";
import { DealCard } from "@/components/DealCard";
import { Calendar, Mail, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";

export default function Home() {
  const now = new Date();
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Review Q4 budget proposal",
      completed: false,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      source: "Email",
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Prepare for client meeting with Acme Corp",
      completed: false,
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      source: "Calendar",
      priority: "high" as const,
    },
    {
      id: "3",
      title: "Follow up on TechStart proposal",
      completed: false,
      source: "CRM",
      priority: "normal" as const,
    },
  ]);

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
    {
      id: "3",
      title: "Client Meeting - Acme Corp",
      startTime: new Date(now.setHours(14, 0, 0, 0)),
      endTime: new Date(now.setHours(15, 0, 0, 0)),
      attendees: 5,
      location: "Conference Room A",
      type: "meeting" as const,
      status: "confirmed" as const,
    },
  ];

  const priorityEmails = [
    {
      id: "1",
      sender: "Sarah Johnson",
      senderEmail: "sarah@company.com",
      subject: "Q4 Strategy Review Meeting",
      preview: "Hi Matt, I wanted to follow up on our discussion about the Q4 strategy...",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      labels: ["Work", "Important"],
      priority: "high" as const,
      unread: true,
    },
    {
      id: "2",
      sender: "Mike Chen",
      senderEmail: "mike@client.com",
      subject: "Project Update - Phase 2 Deliverables",
      preview: "The latest deliverables are ready for review. Let me know when you...",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      labels: ["Client"],
      priority: "high" as const,
      unread: true,
    },
  ];

  const deals = [
    {
      id: "1",
      company: "Acme Corp",
      value: 125000,
      stage: "Proposal Sent",
      lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      nextAction: "Follow up on proposal",
      stale: false,
    },
    {
      id: "2",
      company: "TechStart Inc",
      value: 85000,
      stage: "Negotiation",
      lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextAction: "Schedule contract review",
      stale: true,
    },
  ];

  const handleToggleTask = (id: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed } : task))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            Good morning, Matt
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Last updated: {format(new Date(), "h:mm a")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BriefCard
          title="Meetings Today"
          value={5}
          subtitle="3 confirmed, 2 tentative"
          icon={Calendar}
          variant="default"
        />
        <BriefCard
          title="Priority Emails"
          value={12}
          subtitle="8 unread, 4 flagged"
          icon={Mail}
          variant="warning"
        />
        <BriefCard
          title="Tasks Due"
          value={7}
          subtitle="2 overdue"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">
              Today's Schedule
            </CardTitle>
            <Button variant="outline" size="sm" data-testid="button-view-calendar">
              View Calendar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => (
              <CalendarEvent key={event.id} {...event} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">
              Top Priority Tasks
            </CardTitle>
            <Button variant="outline" size="sm" data-testid="button-add-task">
              Add Task
            </Button>
          </CardHeader>
          <CardContent>
            {tasks.map((task) => (
              <TaskItem key={task.id} {...task} onToggle={handleToggleTask} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">
              Priority Emails
            </CardTitle>
            <Button variant="outline" size="sm" data-testid="button-view-all-emails">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {priorityEmails.map((email) => (
              <EmailThread
                key={email.id}
                {...email}
                onClick={() => console.log("Email clicked:", email.id)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Active Deals
            </CardTitle>
            <Button variant="outline" size="sm" data-testid="button-view-pipeline">
              View Pipeline
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {deals.map((deal) => (
              <DealCard key={deal.id} {...deal} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
