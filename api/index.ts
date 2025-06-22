// api/index.ts
import app from '../server/index.js';

// Vercel expects a default export that is a request handler.
// By exporting the Express app, Vercel's build output will
// automatically wrap it to handle serverless requests.
export default app;