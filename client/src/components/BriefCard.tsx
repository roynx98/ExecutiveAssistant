import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface BriefCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

export function BriefCard({ title, value, subtitle, icon: Icon, variant = "default" }: BriefCardProps) {
  const variantColors = {
    default: "text-primary",
    success: "text-chart-2",
    warning: "text-chart-3",
    danger: "text-destructive",
  };

  return (
    <Card data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${variantColors[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
