import { BriefCard } from "../BriefCard";
import { Calendar, Mail, CheckCircle } from "lucide-react";

export default function BriefCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <BriefCard
        title="Meetings Today"
        value={5}
        subtitle="3 confirmed, 2 tentative"
        icon={Calendar}
        variant="default"
      />
      <BriefCard
        title="Priority Emails"
        value={12}
        subtitle="8 unread, 4 flagged"
        icon={Mail}
        variant="warning"
      />
      <BriefCard
        title="Tasks Due"
        value={7}
        subtitle="2 overdue"
        icon={CheckCircle}
        variant="success"
      />
    </div>
  );
}
