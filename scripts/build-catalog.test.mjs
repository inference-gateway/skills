import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { preserveFetchedAt } from './build-catalog.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(resolve(ROOT, 'catalog.json'), 'utf8'));

test('language and logo are emitted together, or not at all', () => {
  for (const skill of catalog.skills) {
    assert.equal('language' in skill, 'logo' in skill, `${skill.name}: language/logo must be paired`);
    if (skill.logo) {
      assert.match(skill.logo, /^https:\/\/cdn\.jsdelivr\.net\/gh\/devicons\/devicon\/icons\/.+\.svg$/);
    }
  }
});

test('cpp skills carry the C++ logo', () => {
  const cpp = catalog.skills.find((s) => s.name === 'cpp-best-practices');
  assert.equal(cpp.language, 'cpp');
  assert.match(cpp.logo, /cplusplus-original\.svg$/);
});

test('only entries whose content changed get a new fetchedAt', () => {
  const entry = (name, description, fetchedAt) => ({ name, description, _source: { url: 'u', ref: 'main', fetchedAt } });
  const existing = { skills: [entry('a', 'same', 't0'), entry('b', 'old', 't0')] };
  const next = { skills: [entry('a', 'same', 't1'), entry('b', 'new', 't1'), entry('c', 'added', 't1')] };

  preserveFetchedAt(next, existing);

  assert.deepEqual(
    next.skills.map((s) => s._source.fetchedAt),
    ['t0', 't1', 't1'],
  );
});
