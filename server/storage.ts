import { db } from "./db";
import { type Chat, type InsertChat, type Message, type InsertMessage, type User, type UpsertUser, type InsertUser, type AdminUser, type InsertAdminUser, type CustomModelConfig, type InsertCustomModelConfig, chats, messages, users, adminUsers, customModelConfigs } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  
  getCustomModelConfig(modeKey: string): Promise<CustomModelConfig | undefined>;
  upsertCustomModelConfig(config: InsertCustomModelConfig): Promise<CustomModelConfig>;
  
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(id: string): Promise<Chat | undefined>;
  getAllChats(userId?: string, guestId?: string): Promise<Chat[]>;
  getUserChats(userId: string): Promise<Chat[]>;
  deleteChat(id: string): Promise<void>;
  updateChatTitle(id: string, title: string): Promise<void>;
  linkGuestChatsToUser(guestId: string, userId: string): Promise<void>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(chatId: string): Promise<Message[]>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private adminUsers: Map<string, AdminUser> = new Map();
  private customModelConfigs: Map<string, CustomModelConfig> = new Map();
  private chats: Map<string, Chat> = new Map();
  private messages: Map<string, Message> = new Map();
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = {
      id,
      username: userData.username,
      password: userData.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id!,
      username: userData.username!,
      password: userData.password!,
      createdAt: existingUser?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(a => a.username === username);
  }

  async createAdminUser(adminData: InsertAdminUser): Promise<AdminUser> {
    const id = crypto.randomUUID();
    const admin: AdminUser = {
      id,
      username: adminData.username,
      password: adminData.password,
      createdAt: new Date(),
    };
    this.adminUsers.set(id, admin);
    return admin;
  }

  async getCustomModelConfig(modeKey: string): Promise<CustomModelConfig | undefined> {
    return Array.from(this.customModelConfigs.values()).find(c => c.modeKey === modeKey);
  }

  async upsertCustomModelConfig(configData: InsertCustomModelConfig): Promise<CustomModelConfig> {
    const existing = await this.getCustomModelConfig(configData.modeKey);
    const config: CustomModelConfig = {
      id: existing?.id ?? crypto.randomUUID(),
      modeKey: configData.modeKey,
      basePrompt: configData.basePrompt,
      eventTriggers: configData.eventTriggers ?? [],
      randomInjections: configData.randomInjections ?? [],
      updatedAt: new Date(),
    };
    this.customModelConfigs.set(config.id, config);
    return config;
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      userId: chat.userId ?? null,
      guestId: chat.guestId ?? null,
      title: chat.title,
      createdAt: new Date(),
    };
    this.chats.set(id, newChat);
    return newChat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getAllChats(userId?: string, guestId?: string): Promise<Chat[]> {
    if (!userId && !guestId) {
      return [];
    }
    return Array.from(this.chats.values())
      .filter(chat => {
        if (userId && chat.userId === userId) return true;
        if (guestId && chat.guestId === guestId && !chat.userId) return true;
        return false;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return Array.from(this.chats.values())
      .filter(chat => chat.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteChat(id: string): Promise<void> {
    this.chats.delete(id);
    Array.from(this.messages.entries()).forEach(([msgId, msg]) => {
      if (msg.chatId === id) {
        this.messages.delete(msgId);
      }
    });
  }

  async updateChatTitle(id: string, title: string): Promise<void> {
    const chat = this.chats.get(id);
    if (chat) {
      chat.title = title;
      this.chats.set(id, chat);
    }
  }

  async linkGuestChatsToUser(guestId: string, userId: string): Promise<void> {
    Array.from(this.chats.values()).forEach(chat => {
      if (chat.guestId === guestId && !chat.userId) {
        chat.userId = userId;
        chat.guestId = null;
        this.chats.set(chat.id, chat);
      }
    });
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = crypto.randomUUID();
    const newMessage: Message = {
      id,
      chatId: message.chatId,
      content: message.content,
      imageUrl: message.imageUrl ?? null,
      isAi: message.isAi,
      createdAt: new Date(),
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export class DbStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    const PostgresSessionStore = require("connect-pg-simple")(session);
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: "sessions",
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin;
  }

  async createAdminUser(adminData: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db.insert(adminUsers).values(adminData).returning();
    return admin;
  }

  async getCustomModelConfig(modeKey: string): Promise<CustomModelConfig | undefined> {
    const [config] = await db.select().from(customModelConfigs).where(eq(customModelConfigs.modeKey, modeKey));
    return config;
  }

  async upsertCustomModelConfig(configData: InsertCustomModelConfig): Promise<CustomModelConfig> {
    const [config] = await db
      .insert(customModelConfigs)
      .values(configData)
      .onConflictDoUpdate({
        target: customModelConfigs.modeKey,
        set: {
          ...configData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return config;
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const [newChat] = await db.insert(chats).values(chat).returning();
    return newChat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id)).limit(1);
    return chat;
  }

  async getAllChats(userId?: string, guestId?: string): Promise<Chat[]> {
    if (!userId && !guestId) {
      return [];
    }
    
    const { or, and, isNull } = await import("drizzle-orm");
    
    const conditions = [];
    if (userId) {
      conditions.push(eq(chats.userId, userId));
    }
    if (guestId) {
      conditions.push(and(eq(chats.guestId, guestId), isNull(chats.userId)));
    }
    
    return await db.select().from(chats).where(or(...conditions)).orderBy(desc(chats.createdAt));
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return await db.select().from(chats).where(eq(chats.userId, userId)).orderBy(desc(chats.createdAt));
  }

  async deleteChat(id: string): Promise<void> {
    await db.delete(chats).where(eq(chats.id, id));
  }

  async updateChatTitle(id: string, title: string): Promise<void> {
    await db.update(chats).set({ title }).where(eq(chats.id, id));
  }

  async linkGuestChatsToUser(guestId: string, userId: string): Promise<void> {
    const { and, isNull } = await import("drizzle-orm");
    await db.update(chats)
      .set({ userId, guestId: null })
      .where(and(eq(chats.guestId, guestId), isNull(chats.userId)));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt);
  }
}

export const storage = new MemStorage();
