export default async function healthRoute(fastify) {
  fastify.get("/health", async () => {
    return {
      status: "ok",
      version: process.env.GIT_SHA ?? "dev",
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  });

  fastify.get("/health/db", async (request, reply) => {
    try {
      await fastify.pg.query("SELECT 1");
      return { status: "ok", db: "connected" };
    } catch (err) {
      reply.code(500);
      return { status: "error", db: "disconnected" };
    }
  });
}
