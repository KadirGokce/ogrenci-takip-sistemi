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

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes
app.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = LoginSchema.parse(body);
    
    // Mock authentication logic
    const mockUser: User = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: validatedData.email,
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response = ApiResponseSchema(UserSchema).parse({
      success: true,
      data: mockUser,
    });

    return c.json(response);
  } catch (error) {
    const response = ApiResponseSchema(UserSchema).parse({
      success: false,
      error: "Invalid login data",
    });
    return c.json(response, 400);
  }
});

app.post("/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = RegisterSchema.parse(body);
    
    // Mock registration logic
    const mockUser: User = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: validatedData.email,
      name: validatedData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response = ApiResponseSchema(UserSchema).parse({
      success: true,
      data: mockUser,
    });

    return c.json(response);
  } catch (error) {
    const response = ApiResponseSchema(UserSchema).parse({
      success: false,
      error: "Invalid registration data",
    });
    return c.json(response, 400);
  }
});

// User routes
app.get("/users/:id", async (c) => {
  const userId = c.req.param("id");
  
  // Mock user data
  const mockUser: User = {
    id: userId,
    email: "user@example.com",
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const response = ApiResponseSchema(UserSchema).parse({
    success: true,
    data: mockUser,
  });

  return c.json(response);
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