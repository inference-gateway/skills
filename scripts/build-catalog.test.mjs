import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

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
