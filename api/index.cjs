const serverless = require("serverless-http");

// Import the built server module
let appModule;
try {
  appModule = require("../dist/index.js");
} catch (error) {
  console.error("Failed to load server module:", error);
  throw error;
}

// Create and cache the handler
let cachedHandler = null;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    try {
      // Set VERCEL environment variable to get the right export
      process.env.VERCEL = "1";
      
      // Get the createApp function
      const createApp = appModule.default || appModule;
      
      if (typeof createApp !== 'function') {
        throw new Error('Expected createApp to be a function, got: ' + typeof createApp);
      }
      
      // Create the Express app
      const app = await createApp();
      
      // Wrap with serverless-http
      cachedHandler = serverless(app);
    } catch (error) {
      console.error("Failed to create app:", error);
      res.status(500).json({ error: "Failed to initialize server", details: error.message });
      return;
    }
  }
  
  return cachedHandler(req, res);
};