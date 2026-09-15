/**
 * Local development server.
 *
 * Kept separate from server.ts so the deployed serverless function never even
 * references Vite (a devDependency that does not exist in the deployed bundle).
 *
 *   pnpm dev  ->  http://localhost:3000
 */
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import app from './server';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clinic Intake RAG Assistant running on http://localhost:${PORT}`);
  });
}

start();
