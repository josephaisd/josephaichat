import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { generateAIResponse } from "./ai";
import crypto from "crypto";

function generateChatTitle(message: string): string {
  const cleanMessage = message.trim();
  if (cleanMessage.length <= 40) {
    return cleanMessage;
  }
  return cleanMessage.substring(0, 37) + "...";
}

function getDeviceId(req: Request): string {
  const deviceId = req.headers['x-device-id'] as string;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (deviceId) {
    return crypto.createHash('sha256').update(`${ip}-${deviceId}`).digest('hex');
  }
  
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function registerRoutes(app: Express): Promise<Server> {

  app.get("/api/chats", async (req: any, res) => {
    try {
      const deviceId = getDeviceId(req);
      const chats = await storage.getAllChats(deviceId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", async (req: any, res) => {
    try {
      const deviceId = getDeviceId(req);
      const chatData = {
        ...req.body,
        userId: deviceId,
      };
      const validatedData = insertChatSchema.parse(chatData);
      const chat = await storage.createChat(validatedData);
      res.json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(400).json({ error: "Invalid chat data" });
    }
  });

  app.delete("/api/chats/:id", async (req: any, res) => {
    try {
      const deviceId = getDeviceId(req);
      const chat = await storage.getChat(req.params.id);
      if (!chat || chat.userId !== deviceId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      await storage.deleteChat(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete chat" });
    }
  });

  app.get("/api/chats/:id/messages", async (req: any, res) => {
    try {
      const deviceId = getDeviceId(req);
      const chat = await storage.getChat(req.params.id);
      if (!chat || chat.userId !== deviceId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", async (req: any, res) => {
    try {
      const deviceId = getDeviceId(req);
      const { message, chatId, imageUrl } = req.body;
      const chat = await storage.getChat(chatId);
      if (!chat || chat.userId !== deviceId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      await storage.createMessage({
        chatId,
        content: message || "",
        imageUrl: imageUrl || null,
        isAi: false,
      });

      const messages = await storage.getMessages(chatId);
      
      if (messages.length === 1 && chat.title === "New Chat") {
        const title = generateChatTitle(message);
        await storage.updateChatTitle(chatId, title);
      }

      const conversationHistory = messages.map((msg) => ({
        role: msg.isAi ? "assistant" as const : "user" as const,
        content: msg.content,
        imageUrl: msg.imageUrl,
      }));

      const aiResponse = await generateAIResponse(conversationHistory);
      
      const aiMessage = await storage.createMessage({
        chatId,
        content: aiResponse,
        isAi: true,
      });

      res.json(aiMessage);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
