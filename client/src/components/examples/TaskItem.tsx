import { TaskItem } from "../TaskItem";
import { useState } from "react";

export default function TaskItemExample() {
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Review Q4 budget proposal",
      completed: false,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      source: "Email",
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Send thank you gift to new client",
      completed: false,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      source: "CRM",
      priority: "normal" as const,
    },
    {
      id: "3",
      title: "Update LinkedIn profile",
      completed: true,
      source: "Content",
      priority: "low" as const,
    },
  ]);

  const handleToggle = (id: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed } : task))
    );
  };

  return (
    <div className="max-w-2xl">
      {tasks.map((task) => (
        <TaskItem key={task.id} {...task} onToggle={handleToggle} />
      ))}
    </div>
  );
}
