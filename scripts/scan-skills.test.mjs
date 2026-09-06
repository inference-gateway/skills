import { expect, test } from 'bun:test';
import { mkdtempSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mergeSarif } from './scan-skills.mjs';

const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));

const sarif = (rules, results) => ({
  version: '2.1.0',
  $schema: 'x',
  runs: [{ tool: { driver: { name: 'skillspector', rules } }, results }],
});

async function write(name, doc) {
  const p = join(dir, `${name}.sarif`);
  await writeFile(p, JSON.stringify(doc));
  return p;
}

test('merges runs into one, deduping rules and remapping indices', async () => {
  const merged = {};
  await mergeSarif(merged, await write('a', sarif([{ id: 'SHARED' }, { id: 'A' }], [{ ruleIndex: 1, message: { text: 'hit' } }])), 'a');
  await mergeSarif(merged, await write('b', sarif([{ id: 'B' }, { id: 'SHARED' }], [{ ruleIndex: 1, message: { text: 'hit' } }])), 'b');

  const rules = merged.run.tool.driver.rules;
  expect(rules.map((r) => r.id)).toEqual(['SHARED', 'A', 'B']);
  expect(merged.run.results.map((r) => [r.message.text, rules[r.ruleIndex].id])).toEqual([
    ['[a] hit', 'A'],
    ['[b] hit', 'SHARED'],
  ]);
  expect(merged.run.automationDetails).toEqual({ id: 'skillspector' });
});
