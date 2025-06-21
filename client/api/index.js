// Simple portfolio API handler - bypassing the complex Express setup
export default async function handler(req, res) {
  try {
    // Simple portfolio data matching what the frontend expects
    const portfolioData = {
      profile: {
        id: 1,
        name: "Eli Salamie",
        profileImage: "https://pbs.twimg.com/profile_images/1913791901175615488/t-VBP-kH_400x400.jpg",
        isActive: true
      },
      socialLinks: [
        { platform: "GitHub", url: "https://github.com/eli64s", icon: "github", order: 1 },
        { platform: "LinkedIn", url: "https://linkedin.com/in/salamieeli", icon: "linkedin", order: 2 },
        { platform: "X", url: "https://x.com/eli64s", icon: "x", order: 3 },
        { platform: "Instagram", url: "https://instagram.com/0x.eli", icon: "instagram", order: 4 }
      ],
      navigationSections: []
    };

    res.status(200).json(portfolioData);
  } catch (error) {
    console.error("Portfolio API error:", error);
    res.status(500).json({ error: "Failed to load portfolio data" });
  }
}