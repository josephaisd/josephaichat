import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import crypto from "crypto";
import session from "express-session";

const SALT_ROUNDS = 10;

export function getDeviceId(req: Request): string {
  const deviceId = req.headers['x-device-id'] as string;
  
  if (deviceId) {
    return crypto.createHash('sha256').update(deviceId).digest('hex');
  }
  
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
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
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  const csrfMiddleware = (req: any, res: any, next: any) => {
    // Skip CSRF validation for mobile apps (they use X-Device-Id and aren't vulnerable to CSRF)
    const hasDeviceId = !!req.headers['x-device-id'];
    const userAgent = req.headers['user-agent'] || '';
    const isMobileApp = hasDeviceId || userAgent.toLowerCase().includes('capacitor');
    
    // Add debug header for troubleshooting
    res.setHeader('X-Debug-Mobile', isMobileApp ? 'yes' : 'no');
    res.setHeader('X-Debug-DeviceId', hasDeviceId ? 'yes' : 'no');
    
    if (isMobileApp) {
      return next();
    }
    
    // For web browsers, validate CSRF token
    const sessionToken = (req.session as any).csrfToken;
    const headerToken = req.headers['x-csrf-token'];
    
    if (!sessionToken || !headerToken || sessionToken !== headerToken) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }
    
    next();
  };

  app.use((req, res, next) => {
    if (!(req.session as any).csrfToken) {
      (req.session as any).csrfToken = crypto.randomBytes(32).toString('hex');
      req.session.save((err) => {
        if (err) {
          console.error('Failed to save session:', err);
        }
      });
    }
    
    res.cookie('csrf-token', (req.session as any).csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    
    next();
  });

  app.post("/api/register", csrfMiddleware, async (req, res) => {
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

  app.post("/api/login", csrfMiddleware, async (req, res) => {
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

  app.post("/api/logout", csrfMiddleware, (req, res) => {
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

  app.post("/api/admin/login", csrfMiddleware, async (req, res) => {
    try {
      const { username, password } = req.body;

      console.log(`[Admin Login] Attempting login for username: ${username}`);

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const admin = await storage.getAdminUserByUsername(username);
      if (!admin) {
        console.log(`[Admin Login] No admin found with username: ${username}`);
        return res.status(401).json({ error: "Invalid username or password" });
      }

      console.log(`[Admin Login] Admin found: ${admin.username}, checking password...`);
      const isValid = await bcrypt.compare(password, admin.password);
      console.log(`[Admin Login] Password valid: ${isValid}`);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      (req.session as any).adminId = admin.id;
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        res.json({
          id: admin.id,
          username: admin.username,
          isAdmin: true,
        });
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.get("/api/admin/status", async (req, res) => {
    try {
      const adminId = (req.session as any).adminId;
      
      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized", isAdmin: false });
      }

      const admin = await storage.getAdminUser(adminId);
      if (!admin) {
        return res.status(401).json({ message: "Unauthorized", isAdmin: false });
      }

      res.json({
        id: admin.id,
        username: admin.username,
        isAdmin: true,
      });
    } catch (error) {
      console.error("Admin status error:", error);
      res.status(500).json({ message: "Failed to get admin status", isAdmin: false });
    }
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF validation for mobile apps (they use X-Device-Id and aren't vulnerable to CSRF)
  const hasDeviceId = !!req.headers['x-device-id'];
  const userAgent = req.headers['user-agent'] || '';
  const isMobileApp = hasDeviceId || userAgent.toLowerCase().includes('capacitor');
  
  if (!isMobileApp) {
    // For web browsers, validate CSRF token
    const sessionToken = (req.session as any).csrfToken;
    const headerToken = req.headers['x-csrf-token'];
    
    if (!sessionToken || !headerToken || sessionToken !== headerToken) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }
  }
  
  if ((req.session as any).userId) {
    return next();
  }
  
  next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF validation for mobile apps
  const hasDeviceId = !!req.headers['x-device-id'];
  const userAgent = req.headers['user-agent'] || '';
  const isMobileApp = hasDeviceId || userAgent.toLowerCase().includes('capacitor');
  
  if (!isMobileApp) {
    // For web browsers, validate CSRF token
    const sessionToken = (req.session as any).csrfToken;
    const headerToken = req.headers['x-csrf-token'];
    
    if (!sessionToken || !headerToken || sessionToken !== headerToken) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }
  }
  
  const adminId = (req.session as any).adminId;
  if (!adminId) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

export async function bootstrapAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  console.log(`[Bootstrap] ADMIN_USERNAME from env: ${adminUsername}`);
  console.log(`[Bootstrap] ADMIN_PASSWORD set: ${!!adminPassword}`);
  
  if (!adminUsername || !adminPassword) {
    console.log("No ADMIN_USERNAME or ADMIN_PASSWORD set. Skipping admin bootstrap.");
    return;
  }
  
  try {
    const existingAdmin = await storage.getAdminUserByUsername(adminUsername);
    if (existingAdmin) {
      console.log(`[Bootstrap] Admin user '${adminUsername}' already exists. Skipping bootstrap.`);
      return;
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    await storage.createAdminUser({
      username: adminUsername,
      password: hashedPassword,
    });
    
    console.log(`[Bootstrap] Admin user '${adminUsername}' created successfully.`);
  } catch (error) {
    console.error("Failed to bootstrap admin user:", error);
  }
}
