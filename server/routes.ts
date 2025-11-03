import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchRecentEmails, sendEmail } from "./services/google/gmail";
import {
  fetchTodayEvents,
  isWithinWorkHours,
} from "./services/google/calendar";
import { generateEmailDraft } from "./services/llm";
import { getAuthUrl, getTokensFromCode } from "./services/oauth";
import {
  fetchTrelloBoards,
  fetchTrelloCards,
  createTrelloCard,
  updateTrelloCard,
  deleteTrelloCard,
  trelloCardToTask,
  getDefaultListId,
  fetchBoardLists,
} from "./services/trello";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/brief/today", async (req, res) => {
    try {
      const userId = "default-user";

      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      const syncWithTrello = req.query.sync === "true";
      if (syncWithTrello) {
        try {
          const settings = await storage.getUserSettings(user.id);
          const boardId = settings?.trelloBoardId || undefined;
          const listId = settings?.trelloListId || undefined;

          if (listId) {
            const trelloCards = await fetchTrelloCards(boardId, listId);

            for (const card of trelloCards) {
              const trelloTask = trelloCardToTask(card);
              const trelloId = (trelloTask.metadataJson as any)?.trelloId;

              const existingTasks = await storage.getUserTasks(user.id);
              const existing = existingTasks.find(
                (t) => (t.metadataJson as any)?.trelloId === trelloId,
              );

              if (!existing) {
                await storage.createTask({
                  userId: user.id,
                  title: trelloTask.title,
                  status: trelloTask.status,
                  dueAt: trelloTask.dueAt,
                  source: trelloTask.source,
                  metadataJson: trelloTask.metadataJson as any,
                });
              }
            }
          }
        } catch (trelloError) {
          console.warn("Failed to sync with Trello:", trelloError);
        }
      }

      const [emails, events, tasks, deals] = await Promise.all([
        fetchRecentEmails(10).catch((error) => {
          console.error("Failed to fetch recent emails:", error);
          return [];
        }),
        fetchTodayEvents().catch((error) => {
          console.error("Failed to fetch today's events:", error);
          return [];
        }),
        storage.getUserTasks(user.id),
        storage.getActiveDeals(user.id),
      ]);

      const priorityEmails = emails
        .filter((e) => e.priority === "high" || e.unread)
        .slice(0, 10);
      const pendingTasks = tasks.filter((t) => t.status === "pending");
      const staleDeals = deals.filter((d) => {
        const daysSinceUpdate =
          (Date.now() - new Date(d.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 7;
      });

      res.json({
        date: new Date().toISOString(),
        metrics: {
          meetingsToday: events.length,
          priorityEmails: priorityEmails.length,
          tasksDue: pendingTasks.length,
          staleDeals: staleDeals.length,
        },
        emails: priorityEmails,
        events,
        tasks: pendingTasks.slice(0, 5),
        deals: deals.slice(0, 4),
      });
    } catch (error) {
      console.error("Error generating daily brief:", error);
      res.status(500).json({
        error: "Failed to generate daily brief",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/email/draft", async (req, res) => {
    try {
      const schema = z.object({
        threadId: z.string(),
        tone: z.enum(["casual", "business-casual", "formal"]).optional(),
        context: z.string(),
      });

      const {
        threadId,
        tone = "business-casual",
        context,
      } = schema.parse(req.body);

      const draft = await generateEmailDraft(context, tone);

      res.json({ draft, threadId });
    } catch (error) {
      console.error("Error generating draft:", error);
      res.status(500).json({
        error: "Failed to generate draft",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/email/send", async (req, res) => {
    try {
      const schema = z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      });

      const { to, subject, body } = schema.parse(req.body);

      await sendEmail(to, subject, body);

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/calendar/today", async (req, res) => {
    try {
      const events = await fetchTodayEvents();
      res.json({ events });
    } catch (error) {
      console.error("Error fetching calendar:", error);
      res.status(500).json({
        error: "Failed to fetch calendar",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      let settings = await storage.getUserSettings(user.id);
      if (!settings) {
        settings = await storage.upsertUserSettings({
          userId: user.id,
          workdayStart: "08:00",
          workdayEnd: "16:00",
        });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({
        error: "Failed to fetch settings",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      const schema = z.object({
        workdayStart: z.string().optional(),
        workdayEnd: z.string().optional(),
        meetingWindowsJson: z.any().optional(),
        deepWorkBlocksJson: z.any().optional(),
        trelloBoardId: z.string().optional(),
        trelloListId: z.string().optional(),
      });

      const updates = schema.parse(req.body);
      const settings = await storage.upsertUserSettings({
        userId: user.id,
        ...updates,
      });

      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({
        error: "Failed to update settings",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      const schema = z.object({
        title: z.string(),
        dueAt: z.string().optional(),
        source: z.string().optional(),
        priority: z.string().optional(),
      });

      const { title, dueAt, source, priority } = schema.parse(req.body);

      const task = await storage.createTask({
        userId: user.id,
        title,
        dueAt: dueAt ? new Date(dueAt) : undefined,
        source,
        metadataJson: priority ? { priority } : {},
      });

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({
        error: "Failed to create task",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const schema = z.object({
        status: z.string(),
      });

      const { status } = schema.parse(req.body);
      const { id } = req.params;

      await storage.updateTaskStatus(id, status);

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({
        error: "Failed to update task",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/emails", async (req, res) => {
    try {
      const maxResults = parseInt(req.query.limit as string) || 20;
      const emails = await fetchRecentEmails(maxResults);
      res.json({ emails });
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({
        error: "Failed to fetch emails",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      const syncWithTrello = req.query.sync === "true";

      if (syncWithTrello) {
        try {
          const settings = await storage.getUserSettings(user.id);
          const boardId = settings?.trelloBoardId || undefined;
          const listId = settings?.trelloListId || undefined;

          if (listId) {
            const trelloCards = await fetchTrelloCards(boardId, listId);

            for (const card of trelloCards) {
              const trelloTask = trelloCardToTask(card);
              const trelloId = (trelloTask.metadataJson as any)?.trelloId;

              const existingTasks = await storage.getUserTasks(user.id);
              const existing = existingTasks.find(
                (t) => (t.metadataJson as any)?.trelloId === trelloId,
              );

              if (!existing) {
                await storage.createTask({
                  userId: user.id,
                  title: trelloTask.title,
                  status: trelloTask.status,
                  dueAt: trelloTask.dueAt,
                  source: trelloTask.source,
                  metadataJson: trelloTask.metadataJson as any,
                });
              }
            }
          }
        } catch (trelloError) {
          console.warn("Failed to sync with Trello:", trelloError);
        }
      }

      const tasks = await storage.getUserTasks(user.id);
      res.json({ tasks });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({
        error: "Failed to fetch tasks",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/trello/boards", async (req, res) => {
    try {
      const boards = await fetchTrelloBoards();
      res.json({ boards });
    } catch (error) {
      console.error("Error fetching Trello boards:", error);
      res.status(500).json({
        error: "Failed to fetch Trello boards",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/trello/boards/:boardId/lists", async (req, res) => {
    try {
      const { boardId } = req.params;
      const lists = await fetchBoardLists(boardId);
      res.json({ lists });
    } catch (error) {
      console.error("Error fetching Trello lists:", error);
      res.status(500).json({
        error: "Failed to fetch Trello lists",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/trello/cards", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string(),
        desc: z.string().optional(),
        due: z.string().optional(),
      });

      const { name, desc, due } = schema.parse(req.body);

      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      const settings = await storage.getUserSettings(user.id);
      const targetListId = settings?.trelloListId;

      console.log("[DEBUG] Settings:", settings);
      console.log("[DEBUG] Target List ID:", targetListId);

      if (!targetListId) {
        throw new Error(
          "No Trello list configured. Please select a board and list in Settings.",
        );
      }

      console.log(
        "[DEBUG] Creating Trello card with listId:",
        targetListId,
        "name:",
        name,
      );

      const card = await createTrelloCard({
        listId: targetListId,
        name,
        desc,
        due,
      });

      const trelloTask = trelloCardToTask(card);
      const task = await storage.createTask({
        userId: user.id,
        title: trelloTask.title,
        status: trelloTask.status,
        dueAt: trelloTask.dueAt,
        source: trelloTask.source,
        metadataJson: trelloTask.metadataJson as any,
      });

      res.json({ card, task });
    } catch (error) {
      console.error("Error creating Trello card:", error);

      // Provide more helpful error messages
      let userMessage = "Failed to create Trello card";
      if (error instanceof Error) {
        if (error.message.includes("Closed boards cannot be edited")) {
          userMessage =
            "Cannot create task: The selected Trello board is closed/archived. Please select a different board in Settings.";
        } else if (error.message.includes("No Trello list configured")) {
          userMessage =
            "Please configure a Trello board and list in Settings before creating tasks.";
        }
      }

      res.status(500).json({
        error: userMessage,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.patch("/api/trello/cards/:cardId", async (req, res) => {
    try {
      const { cardId } = req.params;
      const schema = z.object({
        name: z.string().optional(),
        desc: z.string().optional(),
        due: z.string().optional(),
        dueComplete: z.boolean().optional(),
        idList: z.string().optional(),
      });

      const updates = schema.parse(req.body);
      const card = await updateTrelloCard(cardId, updates);

      const task = await storage.getTaskById(cardId);
      if (task) {
        await storage.updateTask(cardId, {
          title: card.name,
          dueAt: card.due ? new Date(card.due) : null,
          status: card.dueComplete ? "completed" : "pending",
          metadataJson: {
            ...(typeof task.metadataJson === "object" ? task.metadataJson : {}),
            description: card.desc || "",
            listId: card.idList,
          },
        });
      }

      res.json({ card });
    } catch (error) {
      console.error("Error updating Trello card:", error);
      res.status(500).json({
        error: "Failed to update Trello card",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/tasks/from-email", async (req, res) => {
    try {
      const schema = z.object({
        emailId: z.string(),
        subject: z.string(),
        content: z.string().optional(),
      });

      const { emailId, subject, content } = schema.parse(req.body);

      const taskTitle = `Follow up: ${subject}`;
      const taskDescription = content
        ? `Email ID: ${emailId}\n\n${content.slice(0, 500)}`
        : `Email ID: ${emailId}`;

      const card = await createTrelloCard({
        listId: await getDefaultListId(),
        name: taskTitle,
        desc: taskDescription,
      });

      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      const trelloTask = trelloCardToTask(card);
      const task = await storage.createTask({
        userId: user.id,
        title: trelloTask.title,
        status: trelloTask.status,
        dueAt: trelloTask.dueAt,
        source: trelloTask.source,
        metadataJson: trelloTask.metadataJson as any,
      });

      res.json({ task, card });
    } catch (error) {
      console.error("Error creating task from email:", error);
      res.status(500).json({
        error: "Failed to create task from email",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/tasks/from-event", async (req, res) => {
    try {
      const schema = z.object({
        eventId: z.string(),
        eventTitle: z.string(),
        startTime: z.string(),
        attendees: z.array(z.string()).optional(),
      });

      const { eventId, eventTitle, startTime, attendees } = schema.parse(
        req.body,
      );

      const taskTitle = `Prepare for: ${eventTitle}`;
      const taskDescription =
        attendees && attendees.length > 0
          ? `Meeting with: ${attendees.join(", ")}\nEvent ID: ${eventId}`
          : `Event ID: ${eventId}`;

      const dueDate = new Date(
        new Date(startTime).getTime() - 24 * 60 * 60 * 1000,
      );

      const card = await createTrelloCard({
        listId: await getDefaultListId(),
        name: taskTitle,
        desc: taskDescription,
        due: dueDate.toISOString(),
      });

      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      const trelloTask = trelloCardToTask(card);
      const task = await storage.createTask({
        userId: user.id,
        title: trelloTask.title,
        status: trelloTask.status,
        dueAt: trelloTask.dueAt,
        source: trelloTask.source,
        metadataJson: trelloTask.metadataJson as any,
      });

      res.json({ task, card });
    } catch (error) {
      console.error("Error creating task from event:", error);
      res.status(500).json({
        error: "Failed to create task from event",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/oauth/authorize", (req, res) => {
    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/callback`;
      const authUrl = getAuthUrl(redirectUri);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({
        error: "Failed to generate authorization URL",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/oauth/callback", async (req, res) => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Authorization code missing" });
      }

      const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/callback`;
      const tokens = await getTokensFromCode(code, redirectUri);

      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      await storage.saveOAuthToken({
        userId: user.id,
        provider: "google",
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600000)),
        scopes: tokens.scope || "",
      });

      res.send(`
        <html>
          <head>
            <title>Authorization Successful</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white; }
              .container { text-align: center; max-width: 500px; padding: 2rem; }
              h1 { color: #60a5fa; margin-bottom: 1rem; }
              p { color: #94a3b8; line-height: 1.6; }
              ul { text-align: left; margin: 1rem auto; max-width: 300px; }
              button { margin-top: 2rem; padding: 0.75rem 2rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; }
              button:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✓ Google Services Connected!</h1>
              <p>Your Google account has been authorized with access to:</p>
              <ul>
                <li>Gmail (read, send, modify, labels)</li>
                <li>Google Calendar (events, read/write)</li>
              </ul>
              <p>You can now close this window and return to the app.</p>
              <button onclick="window.close()">Close Window</button>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      res.status(500).send(`
        <html>
          <head>
            <title>Authorization Failed</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white; }
              .container { text-align: center; max-width: 500px; padding: 2rem; }
              h1 { color: #ef4444; margin-bottom: 1rem; }
              p { color: #94a3b8; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✗ Authorization Failed</h1>
              <p>${error instanceof Error ? error.message : "Unknown error occurred"}</p>
            </div>
          </body>
        </html>
      `);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
