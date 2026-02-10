import { pool } from "../plugins/db.js";

export async function getLookbook() {
  const { rows } = await pool.query(`
    SELECT id, kode, nama, image_url
    FROM lookbook_items
    WHERE is_active = true
    ORDER BY published_at DESC
    LIMIT 20
  `);

  if (rows.length === 0) {
    return { hero: null, items: [] };
  }

  const [hero, ...items] = rows;

  return {
    hero: mapItem(hero),
    items: items.map(mapItem),
    meta: {
      generated_at: new Date().toISOString(),
    },
  };
}

function mapItem(row) {
  return {
    id: row.id,
    kode: row.kode,
    nama: row.nama,
    image: row.image_url,
  };
}
