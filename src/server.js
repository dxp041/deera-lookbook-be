import Fastify from "fastify";
import compress from "@fastify/compress";
import { env } from "./env.js";
import dbPlugin from "./plugins/db.js";
import catalogRoute from "./routes/catalog.js";
import adminRoute from "./routes/admin.js";
import healthRoute from "./routes/health.js";

const app = Fastify({
  logger: true,
});

app.decorate("env", env);

await app.register(dbPlugin);
await app.register(compress);
await app.register(catalogRoute);
await app.register(adminRoute);
await app.register(healthRoute);

await fastify.listen({
  port: process.env.PORT || 3000,
  host: "0.0.0.0",
});
app.log.info(`🚀 Server running on ${env.PORT}`);
