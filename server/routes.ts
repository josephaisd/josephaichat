import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { generateAIResponse } from "./ai";
import crypto from "crypto";
import { setupAuth } from "./auth";

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

function getUserId(req: any): string {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
    return req.user.claims.sub;
  }
  return getDeviceId(req);
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/chats", async (req: any, res) => {
    try {
      const isAuth = (req.session as any).userId;
      const userId = isAuth || undefined;
      const guestId = !isAuth ? getDeviceId(req) : undefined;
      
      const chats = await storage.getAllChats(userId, guestId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", async (req: any, res) => {
    try {
      const isAuth = (req.session as any).userId;
      const chatData = {
        ...req.body,
        userId: isAuth || null,
        guestId: !isAuth ? getDeviceId(req) : null,
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
      const isAuth = (req.session as any).userId;
      const userId = isAuth || undefined;
      const guestId = !isAuth ? getDeviceId(req) : undefined;
      
      const chat = await storage.getChat(req.params.id);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      const hasAccess = (userId && chat.userId === userId) || (guestId && chat.guestId === guestId && !chat.userId);
      if (!hasAccess) {
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
      const isAuth = (req.session as any).userId;
      const userId = isAuth || undefined;
      const guestId = !isAuth ? getDeviceId(req) : undefined;
      
      const chat = await storage.getChat(req.params.id);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      const hasAccess = (userId && chat.userId === userId) || (guestId && chat.guestId === guestId && !chat.userId);
      if (!hasAccess) {
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
      const isAuth = (req.session as any).userId;
      const userId = isAuth || undefined;
      const guestId = !isAuth ? getDeviceId(req) : undefined;
      
      const { message, chatId, imageUrl, mode: rawMode } = req.body;
      
      // Validate and default mode
      let mode: import('../shared/ai-modes.js').AiMode = 'standard';
      if (rawMode) {
        const { aiModeSchema } = await import('../shared/ai-modes.js');
        const modeResult = aiModeSchema.safeParse(rawMode);
        if (!modeResult.success) {
          return res.status(400).json({ error: "Invalid AI mode" });
        }
        mode = modeResult.data as import('../shared/ai-modes.js').AiMode;
      }
      
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      const hasAccess = (userId && chat.userId === userId) || (guestId && chat.guestId === guestId && !chat.userId);
      if (!hasAccess) {
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

      const aiResponse = await generateAIResponse(conversationHistory, mode);
      
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
