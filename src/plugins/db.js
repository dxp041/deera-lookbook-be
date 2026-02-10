import fp from "fastify-plugin";
import pg from "pg";

const { Pool } = pg;

async function dbPlugin(fastify) {
  const pool = new Pool({
    connectionString: fastify.env.DB_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

  fastify.decorate("pg", pool);

  fastify.addHook("onClose", async () => {
    await pool.end();
  });
}

export default fp(dbPlugin);
