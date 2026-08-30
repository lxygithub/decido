export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/views') {
      const kv = env.VIEWS_KV;
      if (!kv) {
        return new Response(JSON.stringify({ views: null, error: 'VIEWS_KV not bound' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }

      try {
        const key = 'site_views';
        const current = parseInt((await kv.get(key)) || '0', 10) || 0;
        const next = current + 1;
        await kv.put(key, String(next));

        return new Response(JSON.stringify({ views: next }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ views: null, error: String(e?.message || e) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
    }

    // 静态资源由 Cloudflare Assets 处理
    return env.ASSETS.fetch(request);
  },
};
