const serverless = require("serverless-http");
const createApp = require("../dist/index.js").default || require("../dist/index.js");

// Create the app once and cache the handler
let cachedHandler = null;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app);
  }
  return cachedHandler(req, res);
};