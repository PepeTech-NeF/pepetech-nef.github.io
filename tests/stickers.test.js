import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listStickerUrls } from '../src/lib/stickers.js';

test('missing sticker folder does not stop the build', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pepetech-stickers-'));
  try {
    assert.deepEqual(listStickerUrls(join(dir, 'not-yet-created')), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CMS sticker files become encoded public paths, ignoring other files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pepetech-stickers-'));
  try {
    for (const filename of ['A white space.png', 'пример.webp', 'upper.JPEG', '.gitkeep', 'readme.txt', 'unsafe.svg']) {
      writeFileSync(join(dir, filename), '');
    }
    mkdirSync(join(dir, 'nested.png'));
    const found = listStickerUrls(dir, '');
    assert.equal(found.length, 3);
    assert.ok(found.includes('/images/%D0%A1%D1%82%D0%B8%D0%BA%D0%B5%D1%80%D1%8B/A%20white%20space.png'));
    assert.ok(found.includes('/images/%D0%A1%D1%82%D0%B8%D0%BA%D0%B5%D1%80%D1%8B/%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80.webp'));
    assert.ok(found.includes('/images/%D0%A1%D1%82%D0%B8%D0%BA%D0%B5%D1%80%D1%8B/upper.JPEG'));
    assert.ok(found.every(url => !url.includes('unsafe.svg')));
    assert.ok(listStickerUrls(dir, '/pepetech').every(url => url.startsWith('/pepetech/images/')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
