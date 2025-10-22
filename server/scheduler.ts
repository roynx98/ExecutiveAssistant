import cron from "node-cron";
import { storage } from "./storage";
import { fetchRecentEmails } from "./services/google/gmail";
import { fetchTodayEvents } from "./services/google/calendar";

export function initScheduler() {
  cron.schedule('30 7 * * *', async () => {
    console.log('Running daily briefing at 7:30 AM ET...');
    
    try {
      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        user = await storage.createUser({
          email: "matt@example.com",
          name: "Matt Vaadi",
          timezone: "America/New_York",
        });
      }

      const [emails, events, tasks, deals] = await Promise.all([
        fetchRecentEmails(10).catch(() => []),
        fetchTodayEvents().catch(() => []),
        storage.getUserTasks(user.id),
        storage.getActiveDeals(user.id),
      ]);

      const priorityEmails = emails.filter(e => e.priority === 'high' || e.unread);
      const pendingTasks = tasks.filter(t => t.status === 'pending');

      console.log('Daily brief generated:', {
        emails: priorityEmails.length,
        events: events.length,
        tasks: pendingTasks.length,
        deals: deals.length,
      });

    } catch (error) {
      console.error('Error generating daily brief:', error);
    }
  }, {
    timezone: "America/New_York"
  });

  cron.schedule('0 9 * * 1', async () => {
    console.log('Running weekly scorecard on Monday at 9 AM ET...');
    try {
      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        return;
      }

      const deals = await storage.getActiveDeals(user.id);
      console.log(`Weekly scorecard: ${deals.length} active deals`);
    } catch (error) {
      console.error('Error generating weekly scorecard:', error);
    }
  }, {
    timezone: "America/New_York"
  });

  cron.schedule('0 15 * * 5', async () => {
    console.log('Running pipeline snapshot on Friday at 3 PM ET...');
    try {
      let user = await storage.getUserByEmail("matt@example.com");
      if (!user) {
        return;
      }

      const deals = await storage.getActiveDeals(user.id);
      const staleDeals = deals.filter(d => {
        const daysSinceUpdate = (Date.now() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 7;
      });

      console.log(`Pipeline snapshot: ${deals.length} active, ${staleDeals.length} stale`);
    } catch (error) {
      console.error('Error generating pipeline snapshot:', error);
    }
  }, {
    timezone: "America/New_York"
  });

  console.log('Scheduler initialized with cron jobs');
}
