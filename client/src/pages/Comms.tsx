import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailThread } from "@/components/EmailThread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Send, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Comms() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState("");

  const threads = [
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
    {
      id: "3",
      sender: "Alex Rodriguez",
      senderEmail: "alex@partner.com",
      subject: "Partnership Opportunity",
      preview: "I hope this email finds you well. I wanted to reach out about a potential...",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      labels: ["Partnership"],
      priority: "normal" as const,
      unread: false,
    },
  ];

  const handleGenerateDraft = () => {
    console.log("Generating AI draft for thread:", selectedThread);
    setDraftContent(
      "Thanks for reaching out. I've reviewed the materials and have a few thoughts...\n\nLet me know when you're available to discuss further.\n\nBest,\nMatt"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-semibold">Communications</h1>
        <Button variant="outline" size="sm" data-testid="button-refresh-emails">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="pb-4">
            <div className="space-y-4">
              <CardTitle className="text-xl font-semibold">Inbox</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  className="pl-10"
                  data-testid="input-search-emails"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="cursor-pointer hover-elevate">
                  All
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  Unread (8)
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  High Priority
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {threads.map((thread) => (
              <EmailThread
                key={thread.id}
                {...thread}
                onClick={() => {
                  console.log("Selected thread:", thread.id);
                  setSelectedThread(thread.id);
                }}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              {selectedThread ? "Draft Reply" : "Select an email"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {selectedThread ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Tone:</span>
                    <Select defaultValue="business-casual">
                      <SelectTrigger className="w-48" data-testid="select-tone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="business-casual">Business Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDraft}
                      data-testid="button-generate-draft"
                    >
                      Generate Draft
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Type your reply or generate an AI draft..."
                    className="flex-1 min-h-[300px] resize-none"
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    data-testid="textarea-draft-content"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log("Draft saved");
                      setDraftContent("");
                    }}
                    data-testid="button-save-draft"
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("Email sent:", draftContent);
                      setDraftContent("");
                    }}
                    data-testid="button-send-email"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select an email to compose a reply
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
