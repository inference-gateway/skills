#!/usr/bin/env bun
// Local preview of the registry endpoint. Mirrors the /skills/ path served at
// https://registry.inference-gateway.com so a locally-pointed CLI works unchanged.
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
