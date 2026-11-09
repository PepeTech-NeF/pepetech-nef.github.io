import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../public/stickers.js', import.meta.url), 'utf8');

function runStickers(input, random = 0) {
  const added = [];
  const backdrop = {
    dataset: { stickers: input },
    append(element) { added.push(element); },
  };
  const math = Object.create(Math);
  math.random = () => random;
  const document = {
    querySelector(selector) {
      assert.equal(selector, '.sticker-backdrop');
      return backdrop;
    },
    createElement(tag) {
      assert.equal(tag, 'img');
      return {};
    },
  };

  runInNewContext(script, { document, Math: math });
  return added;
}

test('selects exactly one of 16 stickers for a fixed corner slot', () => {
  const urls = Array.from({ length: 16 }, (_, i) => `/images/%D0%A1%D1%82%D0%B8%D0%BA%D0%B5%D1%80%D1%8B/${i}.webp`);
  const first = runStickers(JSON.stringify(urls), 0);
  const last = runStickers(JSON.stringify(urls), 0.999);

  assert.equal(first.length, 1);
  assert.equal(last.length, 1);
  assert.equal(first[0].src, urls[0]);
  assert.equal(last[0].src, urls[15]);
  assert.equal(first[0].className, 'background-sticker');
  assert.equal(first[0].alt, '');
});

test('empty, malformed, or unsafe lists do not create a sticker', () => {
  assert.equal(runStickers('[]').length, 0);
  assert.equal(runStickers('bad json').length, 0);
  assert.equal(runStickers('{"not":"an array"}').length, 0);
  assert.equal(runStickers('["https://example.com/x.webp"]').length, 0);
});
