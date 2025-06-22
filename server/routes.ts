import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get portfolio data (profile, social links, and navigation sections)
  app.get("/api/portfolio", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getActiveProfile();
      
      if (!profile) {
        return res.status(404).json({ message: "No active profile found" });
      }

      const socialLinks = await storage.getSocialLinks(profile.id);
      const navigationSections = await storage.getNavigationSections();

      res.json({
        profile,
        socialLinks,
        navigationSections
      });
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
