import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface EmailThreadProps {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: Date;
  labels: string[];
  priority?: "high" | "normal" | "low";
  unread?: boolean;
  onClick?: () => void;
}

export function EmailThread({
  id,
  sender,
  senderEmail,
  subject,
  preview,
  timestamp,
  labels,
  priority,
  unread = false,
  onClick,
}: EmailThreadProps) {
  const initials = sender
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex items-start gap-4 p-4 border-b hover-elevate cursor-pointer ${
        unread ? "bg-accent/30" : ""
      }`}
      onClick={onClick}
      data-testid={`email-thread-${id}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm ${unread ? "font-semibold" : "font-medium"}`}>
            {sender}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
        <div className={`text-sm ${unread ? "font-medium" : ""}`}>{subject}</div>
        <div className="text-sm text-muted-foreground truncate">{preview}</div>
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {labels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            {priority === "high" && (
              <Badge variant="destructive" className="text-xs">
                High Priority
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
