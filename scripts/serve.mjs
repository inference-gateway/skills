#!/usr/bin/env bun
// Local preview of the generated catalog.json over HTTP. No hosted endpoint
// serves this path: the registry UI and the CLI both read catalog.json straight
// from this repo (jsDelivr @latest and raw.githubusercontent.com/...@main).
//
// Run with: bun run serve
//
// ponytail: reads catalog.json off disk per request, no cache, one route.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CATALOG = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'catalog.json');

const server = Bun.serve({
  port: Number(process.env.PORT ?? 8787),
  fetch(req) {
    if (new URL(req.url).pathname !== '/skills/') {
      return new Response('not found\n', { status: 404 });
    }
    return new Response(Bun.file(CATALOG), {
      headers: { 'content-type': 'application/json' },
    });
  },
});

console.log(`catalog: ${server.url}skills/`);
