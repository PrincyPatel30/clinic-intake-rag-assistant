/**
 * Vercel serverless entry point.
 *
 * Vercel turns every file in /api into a function, and vercel.json rewrites all
 * /api/* traffic here. Express then routes internally exactly as it does
 * locally, so there is one set of route handlers rather than one for dev and
 * one for production.
 *
 * It imports ./_server.js -- a single self-contained bundle that the build step
 * produces from server.ts with esbuild. That indirection exists because this
 * project uses `"type": "module"` with `moduleResolution: "bundler"`: Vercel
 * transpiles each file rather than bundling, so an extensionless cross-directory
 * import like `../server` emits unchanged and Node ESM cannot resolve it at
 * runtime (ERR_MODULE_NOT_FOUND on /var/task/server). Bundling first means the
 * function has exactly one relative import, with an explicit extension, to a
 * sibling file.
 *
 * The app is imported lazily inside the handler rather than at module scope.
 * If loading it throws — a missing dependency, a bad environment variable read
 * at import time — a top-level import would kill the whole function and Vercel
 * would return an opaque FUNCTION_INVOCATION_FAILED with the real cause visible
 * only in the dashboard logs. Catching it here turns that into a readable JSON
 * response, which is the difference between a five-minute fix and an hour of
 * guessing.
 */

import type { IncomingMessage, ServerResponse } from 'http';

type ExpressLike = (req: IncomingMessage, res: ServerResponse) => void;

let cachedApp: ExpressLike | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!cachedApp) {
      const mod = await import('./_server.js');
      cachedApp = mod.default as unknown as ExpressLike;
    }
    return cachedApp(req, res);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api] failed to load the Express app:', err);

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'The API failed to start.',
        detail: message,
        hint:
          'Usually a missing environment variable (GEMINI_API_KEY, SUPABASE_URL, ' +
          'SUPABASE_PUBLISHABLE_KEY) or a dependency that is not installed in the ' +
          'deployed function.',
      })
    );
  }
}
