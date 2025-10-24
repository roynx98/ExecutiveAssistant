import { db } from "./db";
import { 
  users, tasks, settings, eventsCache, pipelines, oauthTokens,
  type User, type InsertUser,
  type Task, type InsertTask,
  type Settings, type InsertSettings,
  type EventCache, type InsertEvent,
  type Pipeline, type InsertPipeline,
  type OauthToken, type InsertOauthToken,
} from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getUserSettings(userId: string): Promise<Settings | undefined>;
  upsertUserSettings(settings: InsertSettings): Promise<Settings>;
  
  getUserTasks(userId: string): Promise<Task[]>;
  getTaskById(taskId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task>;
  updateTaskStatus(taskId: string, status: string): Promise<void>;
  deleteTask(taskId: string): Promise<void>;
  
  getTodayEvents(userId: string): Promise<EventCache[]>;
  cacheEvents(events: InsertEvent[]): Promise<void>;
  
  getActiveDeals(userId: string): Promise<Pipeline[]>;
  createDeal(deal: InsertPipeline): Promise<Pipeline>;
  
  saveOAuthToken(token: InsertOauthToken): Promise<OauthToken>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserSettings(userId: string): Promise<Settings | undefined> {
    const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
    return userSettings;
  }

  async upsertUserSettings(userSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getUserSettings(userSettings.userId);
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ ...userSettings, updatedAt: new Date() })
        .where(eq(settings.userId, userSettings.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(userSettings).returning();
      return created;
    }
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(taskId: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, taskId))
      .returning();
    return updated;
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
  }

  async deleteTask(taskId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }

  async getTodayEvents(userId: string): Promise<EventCache[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    return db
      .select()
      .from(eventsCache)
      .where(
        and(
          eq(eventsCache.userId, userId),
          gte(eventsCache.startAt, startOfDay),
          lte(eventsCache.startAt, endOfDay)
        )
      );
  }

  async cacheEvents(events: InsertEvent[]): Promise<void> {
    if (events.length > 0) {
      await db.insert(eventsCache).values(events).onConflictDoNothing();
    }
  }

  async getActiveDeals(userId: string): Promise<Pipeline[]> {
    return db.select().from(pipelines).where(eq(pipelines.userId, userId)).orderBy(desc(pipelines.updatedAt));
  }

  async createDeal(deal: InsertPipeline): Promise<Pipeline> {
    const [newDeal] = await db.insert(pipelines).values(deal).returning();
    return newDeal;
  }

  async saveOAuthToken(token: InsertOauthToken): Promise<OauthToken> {
    const existing = await db
      .select()
      .from(oauthTokens)
      .where(
        and(
          eq(oauthTokens.userId, token.userId),
          eq(oauthTokens.provider, token.provider)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(oauthTokens)
        .set(token)
        .where(eq(oauthTokens.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(oauthTokens).values(token).returning();
      return created;
    }
  }
}

export const storage = new DbStorage();
