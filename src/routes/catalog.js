import crypto from "node:crypto";

export default async function catalogRoute(fastify) {
  fastify.get("/catalog", async (request, reply) => {
    const { cursor } = request.query;

    try {
      let query;
      let params = [];

      if (cursor) {
        query = `
          SELECT id, kode, nama, image_url, published_at
          FROM lookbook_items
          WHERE is_active = true
            AND published_at < $1
          ORDER BY published_at DESC
          LIMIT 20
        `;
        params = [cursor];
      } else {
        query = `
          SELECT id, kode, nama, image_url, published_at
          FROM lookbook_items
          WHERE is_active = true
          ORDER BY published_at DESC
          LIMIT 20
        `;
      }

      const { rows } = await fastify.pg.query(query, params);

      // ===== ETag generation =====
      const etagSource = rows.map((r) => r.published_at).join("|");

      const etag = crypto.createHash("sha1").update(etagSource).digest("hex");

      if (request.headers["if-none-match"] === etag) {
        reply.code(304);
        return;
      }

      reply.header("ETag", etag).header("Cache-Control", "public, max-age=60");

      if (rows.length === 0) {
        return { hero: null, items: [], nextCursor: null };
      }

      const lastItem = rows[rows.length - 1];

      if (cursor) {
        return {
          hero: null,
          items: rows,
          nextCursor: lastItem?.published_at ?? null,
        };
      }

      const [hero, ...items] = rows;

      return {
        hero,
        items,
        nextCursor: lastItem?.published_at ?? null,
      };
    } catch (err) {
      request.log.error(err);
      reply.code(500);
      return { message: "Failed to load catalog" };
    }
  });
}
