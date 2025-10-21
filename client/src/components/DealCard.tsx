import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DealCardProps {
  id: string;
  company: string;
  value: number;
  stage: string;
  lastContact: Date;
  nextAction?: string;
  stale?: boolean;
}

export function DealCard({
  id,
  company,
  value,
  stage,
  lastContact,
  nextAction,
  stale = false,
}: DealCardProps) {
  return (
    <Card
      className={`hover-elevate ${stale ? "border-l-4 border-l-chart-3" : ""}`}
      data-testid={`deal-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-semibold text-sm truncate">{company}</span>
          </div>
          {stale && (
            <Badge variant="destructive" className="text-xs flex-shrink-0">
              Stale
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-chart-2" />
          <span className="text-2xl font-bold">
            ${value.toLocaleString()}
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {stage}
        </Badge>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>
              Last contact: {formatDistanceToNow(lastContact, { addSuffix: true })}
            </span>
          </div>
          {nextAction && (
            <div className="text-sm font-medium text-foreground mt-2">
              Next: {nextAction}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
