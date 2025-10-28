import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { generateAIResponse } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/chats", async (req, res) => {
    try {
      const chats = await storage.getAllChats();
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", async (req, res) => {
    try {
      const validatedData = insertChatSchema.parse(req.body);
      const chat = await storage.createChat(validatedData);
      res.json(chat);
    } catch (error) {
      res.status(400).json({ error: "Invalid chat data" });
    }
  });

  app.delete("/api/chats/:id", async (req, res) => {
    try {
      await storage.deleteChat(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete chat" });
    }
  });

  app.get("/api/chats/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, chatId } = req.body;
      
      await storage.createMessage({
        chatId,
        content: message,
        isAi: false,
      });

      const messages = await storage.getMessages(chatId);
      const conversationHistory = messages.map((msg) => ({
        role: msg.isAi ? "assistant" as const : "user" as const,
        content: msg.content,
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
