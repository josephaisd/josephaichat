import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import crypto from "crypto";
import session from "express-session";

const SALT_ROUNDS = 10;

function getDeviceId(req: Request): string {
  const deviceId = req.headers['x-device-id'] as string;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (deviceId) {
    return crypto.createHash('sha256').update(`${ip}-${deviceId}`).digest('hex');
  }
  
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      (req.session as any).userId = user.id;
      
      const guestId = getDeviceId(req);
      try {
        await storage.linkGuestChatsToUser(guestId, user.id);
      } catch (error) {
        console.error("Error linking guest chats:", error);
      }
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        res.json({
          id: user.id,
          username: user.username,
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      (req.session as any).userId = user.id;
      
      const guestId = getDeviceId(req);
      try {
        await storage.linkGuestChatsToUser(guestId, user.id);
      } catch (error) {
        console.error("Error linking guest chats:", error);
      }
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        res.json({
          id: user.id,
          username: user.username,
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/user", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any).userId) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}
