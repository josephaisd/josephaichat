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

export class MemStorage implements IStorage {
  private chats: Map<string, Chat> = new Map();
  private messages: Map<string, Message> = new Map();

  async createChat(chat: InsertChat): Promise<Chat> {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: chat.title,
      createdAt: new Date(),
    };
    this.chats.set(id, newChat);
    return newChat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getAllChats(): Promise<Chat[]> {
    return Array.from(this.chats.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deleteChat(id: string): Promise<void> {
    this.chats.delete(id);
    Array.from(this.messages.entries()).forEach(([msgId, msg]) => {
      if (msg.chatId === id) {
        this.messages.delete(msgId);
      }
    });
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = crypto.randomUUID();
    const newMessage: Message = {
      id,
      chatId: message.chatId,
      content: message.content,
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

export const storage = new MemStorage();
