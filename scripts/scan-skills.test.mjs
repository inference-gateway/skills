import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { mergeSarif, scanTargets } from './scan-skills.mjs';

test('scanTargets: local, external, and root SKILL.md', () => {
  const [local, external, root] = scanTargets([
    { url: 'https://github.com/inference-gateway/skills', path: 'skills/adl/SKILL.md' },
    { url: 'https://github.com/Xquik-dev/x-twitter-scraper', ref: 'v2.4.16', path: 'skills/x-twitter-scraper/SKILL.md' },
    { url: 'https://github.com/acme/solo-skill' }, // no path/ref -> defaults
  ]);

  assert.equal(local.isSelf, true);
  assert.equal(local.name, 'adl');
  assert.equal(local.dir, 'skills/adl');

  assert.equal(external.isSelf, false);
  assert.equal(external.name, 'x-twitter-scraper');
  assert.equal(external.ref, 'v2.4.16');
  assert.equal(external.owner, 'Xquik-dev');

  assert.equal(root.name, 'solo-skill'); // falls back to repo name
  assert.equal(root.ref, 'main'); // default ref
  assert.equal(root.path, 'SKILL.md'); // default path
});

test('scanTargets: rejects a non-GitHub url', () => {
  assert.throws(() => scanTargets([{ url: 'https://example.com/foo' }]), /invalid or missing GitHub url/);
});

test('mergeSarif: one run, rules deduped, ruleIndex remapped, skill named in message', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'sarif-test-'));
  const sarif = async (name, rules, results) => {
    const p = join(dir, `${name}.sarif`);
    await writeFile(p, JSON.stringify({ version: '2.1.0', $schema: 'x', runs: [{ tool: { driver: { name: 'skillspector', rules } }, results }] }));
    return p;
  };

  const merged = {};
  await mergeSarif(merged, await sarif('a', [{ id: 'SHARED' }, { id: 'A' }], [{ ruleIndex: 1, message: { text: 'hit' } }]), 'a');
  await mergeSarif(merged, await sarif('b', [{ id: 'B' }, { id: 'SHARED' }], [{ ruleIndex: 1, message: { text: 'hit' } }]), 'b');

  const rules = merged.run.tool.driver.rules;
  assert.deepEqual(rules.map((r) => r.id), ['SHARED', 'A', 'B']);
  assert.deepEqual(
    merged.run.results.map((r) => [r.message.text, rules[r.ruleIndex].id]),
    [['[a] hit', 'A'], ['[b] hit', 'SHARED']],
  );
  assert.deepEqual(merged.run.automationDetails, { id: 'skillspector' });
});
