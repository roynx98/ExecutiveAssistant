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
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: string;
  labels: string[];
  priority?: 'high' | 'normal' | 'low';
  unread: boolean;
}

export default function Comms() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [tone, setTone] = useState<'casual' | 'business-casual' | 'formal'>('business-casual');
  const { toast } = useToast();

  const { data: emailsData, isLoading, refetch } = useQuery<{ emails: Email[] }>({
    queryKey: ['/api/emails'],
  });

  const generateDraftMutation = useMutation({
    mutationFn: async ({ threadId, context }: { threadId: string; context: string }) => {
      const response = await fetch('/api/email/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, tone, context }),
      });
      if (!response.ok) throw new Error('Failed to generate draft');
      return response.json();
    },
    onSuccess: (data: any) => {
      setDraftContent(data.draft);
      toast({
        title: "Draft generated",
        description: "AI has created a draft reply for you",
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ to, subject, body }: { to: string; subject: string; body: string }) => {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });
      if (!response.ok) throw new Error('Failed to send email');
      return response.json();
    },
    onSuccess: () => {
      setDraftContent("");
      setSelectedThread(null);
      toast({
        title: "Email sent",
        description: "Your email has been sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
  });

  const selectedEmail = emailsData?.emails.find(e => e.id === selectedThread);

  const handleGenerateDraft = () => {
    if (selectedEmail) {
      const context = `From: ${selectedEmail.sender}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.preview}`;
      generateDraftMutation.mutate({ threadId: selectedThread!, context });
    }
  };

  const handleSendEmail = () => {
    if (selectedEmail && draftContent) {
      sendEmailMutation.mutate({
        to: selectedEmail.senderEmail,
        subject: `Re: ${selectedEmail.subject}`,
        body: draftContent,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Communications</h1>
        <p className="text-muted-foreground">Loading emails...</p>
      </div>
    );
  }

  const threads = emailsData?.emails || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-semibold">Communications</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          data-testid="button-refresh-emails"
        >
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
                  All ({threads.length})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  Unread ({threads.filter(t => t.unread).length})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  High Priority ({threads.filter(t => t.priority === 'high').length})
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {threads.map((thread) => (
              <EmailThread
                key={thread.id}
                {...thread}
                timestamp={new Date(thread.timestamp)}
                onClick={() => {
                  console.log("Selected thread:", thread.id);
                  setSelectedThread(thread.id);
                }}
              />
            ))}
            {threads.length === 0 && (
              <p className="text-muted-foreground text-center py-8 px-4">
                No emails found
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              {selectedThread ? "Draft Reply" : "Select an email"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {selectedThread && selectedEmail ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">Tone:</span>
                    <Select value={tone} onValueChange={(v: any) => setTone(v)}>
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
                      disabled={generateDraftMutation.isPending}
                      data-testid="button-generate-draft"
                    >
                      {generateDraftMutation.isPending ? 'Generating...' : 'Generate Draft'}
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
                    onClick={handleSendEmail}
                    disabled={sendEmailMutation.isPending || !draftContent}
                    data-testid="button-send-email"
                  >
                    {sendEmailMutation.isPending ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </>
                    )}
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
