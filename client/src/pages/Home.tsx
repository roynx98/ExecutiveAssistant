import { BriefCard } from "@/components/BriefCard";
import { CalendarEvent } from "@/components/CalendarEvent";
import { EmailThread } from "@/components/EmailThread";
import { TaskItem } from "@/components/TaskItem";
import { DealCard } from "@/components/DealCard";
import { Calendar, Mail, CheckCircle, TrendingUp, Plus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface BriefData {
  date: string;
  metrics: {
    meetingsToday: number;
    priorityEmails: number;
    tasksDue: number;
    staleDeals: number;
  };
  emails: Array<{
    id: string;
    sender: string;
    senderEmail: string;
    subject: string;
    preview: string;
    timestamp: string;
    labels: string[];
    priority?: 'high' | 'normal' | 'low';
    unread: boolean;
  }>;
  events: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    attendees?: number;
    location?: string;
    type?: 'meeting' | 'deep-work' | 'buffer';
    status?: 'confirmed' | 'tentative' | 'declined';
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    dueAt?: string;
    source?: string;
    metadataJson?: any;
  }>;
  deals: Array<{
    id: string;
    dealId: string;
    stage: string;
    value: number;
    updatedAt: string;
    notes?: string;
  }>;
}

export default function Home() {
  const { toast } = useToast();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  const { data: brief, isLoading, refetch } = useQuery<BriefData>({
    queryKey: ['/api/brief/today?sync=true'],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brief/today'] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { name: string; desc?: string; due?: string }) => {
      const response = await fetch('/api/trello/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brief/today?sync=true'] });
      setIsAddTaskOpen(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDue("");
      toast({
        title: "Task created",
        description: "New task has been added to Trello and synced.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
      });
    },
  });

  const handleToggleTask = (id: string, completed: boolean) => {
    updateTaskMutation.mutate({ id, status: completed ? 'completed' : 'pending' });
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task title is required",
      });
      return;
    }

    createTaskMutation.mutate({
      name: newTaskTitle,
      desc: newTaskDescription || undefined,
      due: newTaskDue || undefined,
    });
  };

  const handleSyncTrello = async () => {
    toast({
      title: "Syncing with Trello",
      description: "Fetching latest tasks from Trello...",
    });
    await refetch();
    toast({
      title: "Sync complete",
      description: "Tasks have been synchronized with Trello.",
    });
  };

  if (isLoading || !brief) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Loading your daily brief...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
          Last updated: {format(new Date(brief.date), "h:mm a")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BriefCard
          title="Meetings Today"
          value={brief.metrics.meetingsToday}
          subtitle={`${brief.events.filter(e => e.status === 'confirmed').length} confirmed`}
          icon={Calendar}
          variant="default"
        />
        <BriefCard
          title="Priority Emails"
          value={brief.metrics.priorityEmails}
          subtitle={`${brief.emails.filter(e => e.unread).length} unread`}
          icon={Mail}
          variant="warning"
        />
        <BriefCard
          title="Tasks Due"
          value={brief.metrics.tasksDue}
          subtitle={brief.metrics.tasksDue > 0 ? 'Needs attention' : 'All clear'}
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
            {brief.events.length > 0 ? (
              brief.events.map((event) => (
                <CalendarEvent
                  key={event.id}
                  {...event}
                  startTime={new Date(event.startTime)}
                  endTime={new Date(event.endTime)}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No events scheduled for today
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">
                Top Priority Tasks
              </CardTitle>
              {brief.tasks.some(t => t.source === 'trello') && (
                <Badge variant="secondary" className="text-xs">
                  Synced with Trello
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSyncTrello}
                data-testid="button-sync-trello"
                title="Sync with Trello"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-add-task">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-add-task">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Create a new task in Trello. It will be synced automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Title</Label>
                      <Input
                        id="task-title"
                        placeholder="Enter task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        data-testid="input-task-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-description">Description (optional)</Label>
                      <Textarea
                        id="task-description"
                        placeholder="Enter task description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        data-testid="input-task-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-due">Due Date (optional)</Label>
                      <Input
                        id="task-due"
                        type="datetime-local"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                        data-testid="input-task-due"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddTaskOpen(false)}
                      data-testid="button-cancel-task"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTask}
                      disabled={createTaskMutation.isPending}
                      data-testid="button-create-task"
                    >
                      {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {brief.tasks.length > 0 ? (
              brief.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  completed={task.status === 'completed'}
                  dueDate={task.dueAt ? new Date(task.dueAt) : undefined}
                  source={task.source}
                  priority={task.metadataJson?.priority}
                  onToggle={handleToggleTask}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No tasks pending
              </p>
            )}
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
            {brief.emails.length > 0 ? (
              brief.emails.slice(0, 3).map((email) => (
                <EmailThread
                  key={email.id}
                  {...email}
                  timestamp={new Date(email.timestamp)}
                  onClick={() => console.log("Email clicked:", email.id)}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8 px-4">
                No priority emails
              </p>
            )}
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
            {brief.deals.length > 0 ? (
              brief.deals.map((deal) => {
                const daysSinceUpdate = (Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                const stale = daysSinceUpdate > 7;
                
                return (
                  <DealCard
                    key={deal.id}
                    id={deal.id}
                    company={deal.dealId}
                    value={deal.value}
                    stage={deal.stage}
                    lastContact={new Date(deal.updatedAt)}
                    nextAction={deal.notes || undefined}
                    stale={stale}
                  />
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No active deals
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
