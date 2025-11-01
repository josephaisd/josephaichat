import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { generateAIResponse } from "./ai";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/chats", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.json([]);
      }
      const chats = await storage.getAllChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Must be logged in to create chats" });
      }
      const chatData = {
        ...req.body,
        userId,
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
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Must be logged in" });
      }
      
      const chat = await storage.getChat(req.params.id);
      if (!chat || chat.userId !== userId) {
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
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Must be logged in" });
      }
      
      const chat = await storage.getChat(req.params.id);
      if (!chat || chat.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Must be logged in" });
      }
      
      const chat = await storage.getChat(req.body.chatId);
      if (!chat || chat.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.post("/api/chat", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Must be logged in to chat" });
      }
      
      const { message, chatId, imageUrl } = req.body;
      const chat = await storage.getChat(chatId);
      if (!chat || chat.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      await storage.createMessage({
        chatId,
        content: message || "",
        imageUrl: imageUrl || null,
        isAi: false,
      });

      const messages = await storage.getMessages(chatId);
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
