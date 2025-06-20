import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  profileImage: text("profile_image").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profiles.id).notNull(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull().default(0),
});

export const navigationSections = pgTable("navigation_sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
});

export const insertNavigationSectionSchema = createInsertSchema(navigationSections).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type SocialLink = typeof socialLinks.$inferSelect;
export type NavigationSection = typeof navigationSections.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type InsertNavigationSection = z.infer<typeof insertNavigationSectionSchema>;
