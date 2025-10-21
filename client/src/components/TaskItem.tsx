import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  source?: string;
  priority?: "high" | "normal" | "low";
  onToggle?: (id: string, completed: boolean) => void;
}

export function TaskItem({
  id,
  title,
  completed,
  dueDate,
  source,
  priority,
  onToggle,
}: TaskItemProps) {
  return (
    <div
      className="flex items-start gap-3 p-3 border-b hover-elevate"
      data-testid={`task-${id}`}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) => {
          console.log(`Task ${id} toggled:`, checked);
          onToggle?.(id, checked as boolean);
        }}
        data-testid={`checkbox-task-${id}`}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p
          className={`text-sm ${
            completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(dueDate, "MMM d")}</span>
            </div>
          )}
          {source && (
            <Badge variant="secondary" className="text-xs">
              {source}
            </Badge>
          )}
          {priority === "high" && (
            <Badge variant="destructive" className="text-xs">
              High
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
