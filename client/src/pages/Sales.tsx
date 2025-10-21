import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealCard } from "@/components/DealCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, DollarSign, Target } from "lucide-react";
import { BriefCard } from "@/components/BriefCard";

export default function Sales() {
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
    {
      id: "3",
      company: "Global Solutions Ltd",
      value: 200000,
      stage: "Discovery",
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextAction: "Send needs assessment",
      stale: false,
    },
    {
      id: "4",
      company: "InnovateCo",
      value: 45000,
      stage: "Closed Won",
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextAction: "Onboarding kickoff",
      stale: false,
    },
  ];

  const activeDeals = deals.filter((d) => d.stage !== "Closed Won");
  const staleDeals = deals.filter((d) => d.stale);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Sales & CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pipeline overview and deal management
          </p>
        </div>
        <Button data-testid="button-add-deal">
          <TrendingUp className="h-4 w-4 mr-2" />
          New Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BriefCard
          title="Active Deals"
          value={activeDeals.length}
          subtitle={`$${activeDeals.reduce((sum, d) => sum + d.value, 0).toLocaleString()} in pipeline`}
          icon={Target}
          variant="default"
        />
        <BriefCard
          title="Stale Deals"
          value={staleDeals.length}
          subtitle="Need attention"
          icon={AlertTriangle}
          variant="warning"
        />
        <BriefCard
          title="This Month"
          value="$45K"
          subtitle="1 deal closed"
          icon={DollarSign}
          variant="success"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Pipeline</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">All Stages</Badge>
            <Badge variant="outline">Zoho CRM</Badge>
            <Badge variant="outline">HighLevel</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <DealCard key={deal.id} {...deal} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Upcoming Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between gap-4 p-3 border rounded-md hover-elevate"
              data-testid={`action-${deal.id}`}
            >
              <div className="space-y-1 min-w-0">
                <p className="font-medium text-sm">{deal.company}</p>
                <p className="text-sm text-muted-foreground">{deal.nextAction}</p>
              </div>
              <Button variant="outline" size="sm" data-testid={`button-complete-action-${deal.id}`}>
                Complete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
