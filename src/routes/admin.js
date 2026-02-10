export default async function adminRoute(fastify) {
  fastify.post("/admin/lookbook", async (request, reply) => {
    const { kode, nama, image_url, published_at } = request.body;

    if (!kode || !nama || !image_url) {
      reply.code(400);
      return { message: "Missing required fields" };
    }

    const { rows } = await fastify.pg.query(
      `
      INSERT INTO lookbook_items
        (kode, nama, image_url, published_at, is_active)
      VALUES
        ($1, $2, $3, $4, true)
      RETURNING *
      `,
      [kode, nama, image_url, published_at ?? new Date()],
    );

    reply.code(201);
    return rows[0];
  });

  fastify.post("/admin/lookbook/bulk", async (request, reply) => {
    const { items } = request.body;

    if (!Array.isArray(items) || items.length === 0) {
      reply.code(400);
      return { message: "items must be a non-empty array" };
    }

    const values = [];
    const placeholders = [];

    items.forEach((item, i) => {
      const base = i * 5;
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, true)`,
      );

      values.push(
        item.kode,
        item.nama,
        item.image_url,
        item.published_at ?? new Date(),
      );
    });

    const { rowCount } = await fastify.pg.query(
      `
    INSERT INTO lookbook_items
      (kode, nama, image_url, published_at, is_active)
    VALUES
      ${placeholders.join(",")}
    `,
      values,
    );

    reply.code(201);
    return {
      ok: true,
      inserted: rowCount,
    };
  });

  fastify.put("/admin/lookbook/:id", async (request, reply) => {
    const { id } = request.params;
    const { nama, image_url, published_at } = request.body;

    const { rowCount, rows } = await fastify.pg.query(
      `
      UPDATE lookbook_items
      SET
        nama = COALESCE($1, nama),
        image_url = COALESCE($2, image_url),
        published_at = COALESCE($3, published_at)
      WHERE id = $4
      RETURNING *
      `,
      [nama, image_url, published_at, id],
    );

    if (!rowCount) {
      reply.code(404);
      return { message: "Not found" };
    }

    return rows[0];
  });

  fastify.patch("/admin/lookbook/:id/publish", async (request) => {
    const { id } = request.params;

    await fastify.pg.query(
      `UPDATE lookbook_items SET is_active = true WHERE id = $1`,
      [id],
    );

    return { ok: true };
  });

  fastify.patch("/admin/lookbook/:id/unpublish", async (request) => {
    const { id } = request.params;

    await fastify.pg.query(
      `UPDATE lookbook_items SET is_active = false WHERE id = $1`,
      [id],
    );

    return { ok: true };
  });

  fastify.delete("/admin/lookbook/:id", async (request, reply) => {
    const { id } = request.params;

    const { rowCount } = await fastify.pg.query(
      `DELETE FROM lookbook_items WHERE id = $1`,
      [id],
    );

    if (!rowCount) {
      reply.code(404);
      return { message: "Not found" };
    }

    return { ok: true };
  });
}
