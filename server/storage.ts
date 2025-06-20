import { users, profiles, socialLinks, navigationSections, type User, type InsertUser, type Profile, type SocialLink, type NavigationSection, type InsertProfile, type InsertSocialLink, type InsertNavigationSection } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getActiveProfile(): Promise<Profile | undefined>;
  getSocialLinks(profileId: number): Promise<SocialLink[]>;
  getNavigationSections(): Promise<NavigationSection[]>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink>;
  createNavigationSection(section: InsertNavigationSection): Promise<NavigationSection>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private socialLinks: Map<number, SocialLink>;
  private navigationSections: Map<number, NavigationSection>;
  private currentUserId: number;
  private currentProfileId: number;
  private currentSocialLinkId: number;
  private currentNavigationSectionId: number;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.socialLinks = new Map();
    this.navigationSections = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentSocialLinkId = 1;
    this.currentNavigationSectionId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private async initializeData() {
    // Create default profile
    const profile = await this.createProfile({
      name: "Eli Salamie",
      profileImage: "https://pbs.twimg.com/profile_images/1913791901175615488/t-VBP-kH_400x400.jpg",
      isActive: true
    });

    // Create social links
    const socialLinksData = [
      { platform: "GitHub", url: "https://github.com/eli64s", icon: "github", order: 1 },
      { platform: "LinkedIn", url: "https://linkedin.com/in/salamieeli", icon: "linkedin", order: 2 },
      { platform: "Twitter", url: "https://twitter.com/eli64s", icon: "twitter", order: 3 },
      // { platform: "Mastodon", url: "https://mastodon.social/@eli64s", icon: "mastodon", order: 4 },
      { platform: "Instagram", url: "https://instagram.com/0x.eli", icon: "instagram", order: 5 },
      // { platform: "Discord", url: "https://discord.gg/eli64s", icon: "discord", order: 6 },
      // { platform: "Website", url: "https://eli64s.live", icon: "globe", order: 7 }
    ];

    for (const linkData of socialLinksData) {
      await this.createSocialLink({
        profileId: profile.id,
        platform: linkData.platform,
        url: linkData.url,
        icon: linkData.icon,
        order: linkData.order
      });
    }

    // Create navigation sections
    const navigationData = [
      
      // { name: "podcasts", url: "https://eli64s.live/podcasts", order: 1 },
      // { name: "newsletter", url: "https://eli64s.live/newsletter", order: 2 },
      // { name: "youtube", url: "https://youtube.com/@eli64s", order: 3 },
      // { name: "blog", url: "https://eli64s.live/blog", order: 4 },
      // { name: "dinner", url: "https://eli64s.live/dinner", order: 5 }
    ];

    for (const navData of navigationData) {
      await this.createNavigationSection(navData);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getActiveProfile(): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(profile => profile.isActive);
  }

  async getSocialLinks(profileId: number): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values()).filter(link => link.profileId === profileId);
  }

  async getNavigationSections(): Promise<NavigationSection[]> {
    return Array.from(this.navigationSections.values());
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const profile: Profile = { ...insertProfile, id };
    this.profiles.set(id, profile);
    return profile;
  }

  async createSocialLink(insertSocialLink: InsertSocialLink): Promise<SocialLink> {
    const id = this.currentSocialLinkId++;
    const socialLink: SocialLink = { ...insertSocialLink, id };
    this.socialLinks.set(id, socialLink);
    return socialLink;
  }

  async createNavigationSection(insertNavigationSection: InsertNavigationSection): Promise<NavigationSection> {
    const id = this.currentNavigationSectionId++;
    const section: NavigationSection = { ...insertNavigationSection, id };
    this.navigationSections.set(id, section);
    return section;
  }
}

export const storage = new MemStorage();
