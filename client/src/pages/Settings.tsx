import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Circle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  url: string;
}

interface Settings {
  workdayStart: string;
  workdayEnd: string;
  trelloBoardId: string | null;
}

export default function Settings() {
  const { toast } = useToast();
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  
  const { data: boards } = useQuery<TrelloBoard[]>({
    queryKey: ['/api/trello/boards'],
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (settings?.trelloBoardId) {
      setSelectedBoardId(settings.trelloBoardId);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { trelloBoardId: string }) => {
      return apiRequest('/api/settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your Trello board selection has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveTrelloBoard = () => {
    if (selectedBoardId) {
      updateSettingsMutation.mutate({ trelloBoardId: selectedBoardId });
    }
  };

  const integrations = [
    {
      id: "gmail",
      name: "Gmail",
      status: "connected" as const,
      lastSync: "2 minutes ago",
    },
    {
      id: "calendar",
      name: "Google Calendar",
      status: "connected" as const,
      lastSync: "5 minutes ago",
    },
    {
      id: "drive",
      name: "Google Drive",
      status: "connected" as const,
      lastSync: "1 hour ago",
    },
    {
      id: "zoho",
      name: "Zoho CRM",
      status: "not-connected" as const,
      lastSync: null,
    },
    {
      id: "highlevel",
      name: "HighLevel",
      status: "not-connected" as const,
      lastSync: null,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your integrations and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between gap-4 p-4 border rounded-md hover-elevate"
              data-testid={`integration-${integration.id}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {integration.status === "connected" ? (
                  <CheckCircle2 className="h-5 w-5 text-chart-2 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="space-y-0.5 min-w-0">
                  <p className="font-medium text-sm">{integration.name}</p>
                  {integration.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {integration.lastSync}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {integration.status === "connected" ? (
                  <>
                    <Badge variant="secondary">Connected</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-disconnect-${integration.id}`}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button size="sm" data-testid={`button-connect-${integration.id}`}>
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Work Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workday-start">Workday Start (ET)</Label>
            <Input
              id="workday-start"
              type="time"
              defaultValue="08:00"
              className="max-w-xs"
              data-testid="input-workday-start"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workday-end">Workday End (ET)</Label>
            <Input
              id="workday-end"
              type="time"
              defaultValue="16:00"
              className="max-w-xs"
              data-testid="input-workday-end"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value="America/New_York (Eastern Time)"
              disabled
              className="max-w-xs"
              data-testid="input-timezone"
            />
          </div>

          <div className="pt-4">
            <Button data-testid="button-save-preferences">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Trello Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trello-board">Active Board</Label>
            <p className="text-sm text-muted-foreground">
              Choose which Trello board to sync tasks from
            </p>
            <Select value={selectedBoardId} onValueChange={setSelectedBoardId}>
              <SelectTrigger className="max-w-md" data-testid="select-trello-board">
                <SelectValue placeholder="Select a board..." />
              </SelectTrigger>
              <SelectContent>
                {boards?.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-2">
            <Button 
              onClick={handleSaveTrelloBoard}
              disabled={!selectedBoardId || updateSettingsMutation.isPending}
              data-testid="button-save-trello-board"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Board Selection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Communication Tone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Email Tone</Label>
            <p className="text-sm text-muted-foreground">
              Casual with internal contacts, business casual with external contacts
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">Casual (Internal)</Badge>
            <Badge variant="outline">Business Casual (External)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
