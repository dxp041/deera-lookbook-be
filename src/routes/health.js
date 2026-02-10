export default async function healthRoute(fastify) {
  fastify.get("/health", async () => {
    return {
      status: "ok",
      version: process.env.GIT_SHA ?? "dev",
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  });

  fastify.get("/health/db", async (req, reply) => {
    try {
      const res = await fastify.pg.query("select now()");
      return {
        status: "ok",
        db: "connected",
        time: res.rows[0].now,
      };
    } catch (err) {
      req.log.error(err);
      reply.code(500);
      return {
        status: "error",
        db: "disconnected",
        error: err.message,
      };
    }
  });
}
