import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { 
  LoginSchema, 
  RegisterSchema, 
  UserSchema, 
  ApiResponseSchema,
  type User 
} from "@repo/schemas";
import { serve } from "@hono/node-server";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});


// API documentation
app.get("/", (c) => {
  return c.json({
    name: "API",
    version: "1.0.0",
    endpoints: {
      "GET /health": "Health check",
      "POST /auth/login": "User login",
      "POST /auth/register": "User registration",
      "GET /users/:id": "Get user by ID",
    },
  });
});

export default app;

const port = 3000;
if (require.main === module) {
  serve({ fetch: app.fetch, port });
  console.log(`Server running on http://localhost:${port}`);
} 