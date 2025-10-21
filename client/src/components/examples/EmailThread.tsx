import { EmailThread } from "../EmailThread";

export default function EmailThreadExample() {
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
      subject: "Project Update",
      preview: "The latest deliverables are ready for review. Let me know when you...",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      labels: ["Client"],
      priority: "normal" as const,
      unread: false,
    },
  ];

  return (
    <div className="max-w-3xl">
      {threads.map((thread) => (
        <EmailThread
          key={thread.id}
          {...thread}
          onClick={() => console.log("Email clicked:", thread.id)}
        />
      ))}
    </div>
  );
}
