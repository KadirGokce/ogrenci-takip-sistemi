import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";

const swaggerApp = new Hono().get("/", swaggerUI({ url: "/api/doc" }) as any);

export default swaggerApp;
