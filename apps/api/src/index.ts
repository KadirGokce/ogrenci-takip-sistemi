import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { 
  LoginSchema, 
  RegisterSchema, 
  UserSchema, 
  ApiResponseSchema,
  type User,
  TestCreateSchema,
  type TestCreate
} from "@repo/schemas";
import { serve } from "@hono/node-server";
import { z, type ZodIssue } from "zod";
import { PrismaClient } from "./generated/prisma";
import { zValidator } from "@hono/zod-validator";

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

const prisma = new PrismaClient();

function zodErrorToTurkish(issue: ZodIssue) {
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") return "'" + issue.path.join(".") + "' alanı zorunludur";
      return "'" + issue.path.join(".") + "' alanı tipi geçersiz";
    case "too_small":
      return "'" + issue.path.join(".") + "' alanı çok kısa";
    case "too_big":
      return "'" + issue.path.join(".") + "' alanı çok uzun";
    case "invalid_string":
      return "'" + issue.path.join(".") + "' alanı geçersiz";
    default:
      return issue.message;
  }
}

// Test table endpoints
app.get("/test", async (c) => {
  const tests = await prisma.test.findMany();
  return c.json({ success: true, data: tests });
});

app.post(
  "/test",
  zValidator("json", TestCreateSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: result.error.issues.map(e => ({
          path: e.path,
          message: zodErrorToTurkish(e),
          code: e.code
        }))
      }, 400);
    }
  }),
  async (c) => {
    const body = c.req.valid("json");
    const test = await prisma.test.create({ data: { name: body.name } });
    return c.json({ success: true, data: test });
  }
);

export default app;

const port = 3000;
if (require.main === module) {
  serve({ fetch: app.fetch, port });
  console.log(`Server running on http://localhost:${port}`);
} 