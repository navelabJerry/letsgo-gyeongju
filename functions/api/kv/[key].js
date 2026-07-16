export async function onRequestGet(context) {
    const key = context.params.key;
    const row = await context.env["letsgo-gyeongju-db"]
      .prepare("SELECT value FROM kv WHERE key = ?")
      .bind(key)
      .first();
    return Response.json({ key, value: row ? row.value : null });
}

export async function onRequestPut(context) {
    const key = context.params.key;
    const body = await context.request.json();
    const value = body && body.value;
    if (typeof value !== "string") {
          return new Response("value(string) is required", { status: 400 });
    }
    await context.env["letsgo-gyeongju-db"]
      .prepare(
              "INSERT INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now')) " +
              "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
            )
      .bind(key, value)
      .run();
    return Response.json({ ok: true });
}
