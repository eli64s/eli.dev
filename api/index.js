const serverless = require("serverless-http");
const createApp = require("../dist/index.js").default || require("../dist/index.js");

module.exports = async (req, res) => {
  const app = await createApp();
  return serverless(app)(req, res);
};