/**
 * Vercel serverless entry point.
 *
 * Vercel turns every file in /api into a function. `vercel.json` rewrites all
 * /api/* traffic here, and Express then routes it internally exactly as it does
 * locally — so there is one set of route handlers, not one for dev and one for
 * production.
 *
 * An Express app is itself a (req, res) function, which is precisely what the
 * Node runtime expects a handler to be, so it can be re-exported as-is.
 */

import app from '../server';

export default app;
