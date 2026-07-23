import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scanTargets } from './scan-skills.mjs';

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
