import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../public/stickers.js', import.meta.url), 'utf8');

function runStickers(input, random = 0, viewport = { width: 1280, height: 800 }) {
  const added = [];
  const listeners = new Map();
  const backdrop = {
    dataset: { stickers: input },
    append(element) { added.push(element); },
  };
  const math = Object.create(Math);
  math.random = () => random;
  const window = {
    innerWidth: viewport.width,
    innerHeight: viewport.height,
    addEventListener(name, callback) { listeners.set(name, callback); },
  };
  const getDimensions = () => ({
    width: window.innerWidth <= 620 ? 92 : Math.max(100, Math.min(window.innerWidth * 0.11, 150)),
    height: window.innerWidth <= 620 ? Math.min(110, window.innerHeight * 0.22) : Math.min(170, window.innerHeight * 0.28),
  });
  const document = {
    querySelector(selector) {
      assert.equal(selector, '.sticker-backdrop');
      return backdrop;
    },
    createElement(tag) {
      assert.equal(tag, 'img');
      return { style: {}, getBoundingClientRect: getDimensions };
    },
  };

  runInNewContext(script, { document, Math: math, window });
  return { added, window, listeners, getDimensions };
}

test('chooses exactly one of 16 stickers', () => {
  const urls = Array.from({ length: 16 }, (_, i) => `/images/%D0%A1%D1%82%D0%B8%D0%BA%D0%B5%D1%80%D1%8B/${i}.webp`);
  const first = runStickers(JSON.stringify(urls), 0).added;
  const last = runStickers(JSON.stringify(urls), 0.999).added;

  assert.equal(first.length, 1);
  assert.equal(last.length, 1);
  assert.equal(first[0].src, urls[0]);
  assert.equal(last[0].src, urls[15]);
  assert.equal(first[0].className, 'background-sticker');
  assert.equal(first[0].alt, '');
});

test('random positions stay entirely in lower-right quadrant on desktop and mobile', () => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 780 }]) {
    for (const random of [0, 0.25, 0.5, 0.999]) {
      const result = runStickers('["/images/sticker.webp"]', random, viewport);
      const image = result.added[0];
      const right = Number.parseInt(image.style.right, 10);
      const bottom = Number.parseInt(image.style.bottom, 10);
      const dimensions = result.getDimensions();
      assert.ok(right >= (viewport.width <= 620 ? 24 : 46));
      assert.ok(bottom >= (viewport.width <= 620 ? 30 : 50));
      assert.ok(right + dimensions.width <= viewport.width / 2 + 1, `right quadrant violated: ${right}`);
      assert.ok(bottom + dimensions.height <= viewport.height / 2 + 1, `bottom quadrant violated: ${bottom}`);
    }
  }
});

test('repositions within the same quadrant on viewport resize', () => {
  const result = runStickers('["/images/sticker.webp"]', 0.75);
  const sticker = result.added[0];
  const initialRight = sticker.style.right;
  assert.ok(result.listeners.has('resize'));

  result.window.innerWidth = 390;
  result.window.innerHeight = 780;
  result.listeners.get('resize')();

  assert.notEqual(sticker.style.right, initialRight);
  assert.ok(Number.parseInt(sticker.style.right, 10) + result.getDimensions().width <= 196);
  assert.ok(Number.parseInt(sticker.style.bottom, 10) + result.getDimensions().height <= 391);
});

test('empty, malformed, or unsafe lists do not create a sticker', () => {
  assert.equal(runStickers('[]').added.length, 0);
  assert.equal(runStickers('bad json').added.length, 0);
  assert.equal(runStickers('{"not":"an array"}').added.length, 0);
  assert.equal(runStickers('["https://example.com/x.webp"]').added.length, 0);
});
