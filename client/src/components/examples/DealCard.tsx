import { DealCard } from "../DealCard";

export default function DealCardExample() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 max-w-4xl">
      {deals.map((deal) => (
        <DealCard key={deal.id} {...deal} />
      ))}
    </div>
  );
}
