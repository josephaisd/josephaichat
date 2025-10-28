import { db } from "./db";
import { type Chat, type InsertChat, type Message, type InsertMessage, chats, messages } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(id: string): Promise<Chat | undefined>;
  getAllChats(): Promise<Chat[]>;
  deleteChat(id: string): Promise<void>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(chatId: string): Promise<Message[]>;
}

export class DbStorage implements IStorage {
  async createChat(chat: InsertChat): Promise<Chat> {
    const [newChat] = await db.insert(chats).values(chat).returning();
    return newChat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    const chat = await db.select().from(chats).where(eq(chats.id, id)).limit(1);
    return chat[0];
  }

  async getAllChats(): Promise<Chat[]> {
    return await db.select().from(chats).orderBy(desc(chats.createdAt));
  }

  async deleteChat(id: string): Promise<void> {
    await db.delete(chats).where(eq(chats.id, id));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt);
  }
}

export const storage = new DbStorage();
