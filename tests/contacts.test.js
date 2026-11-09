import test from 'node:test';
import assert from 'node:assert/strict';
import { getContacts } from '../src/lib/contacts.js';

test('empty configuration has no contacts', () => {
  assert.deepEqual(getContacts({}), []);
  assert.deepEqual(getContacts({ discord: '', telegram: '', discord_server: '', telegram_channel: '' }), []);
});

test('Discord username is copyable, not a fabricated profile URL', () => {
  assert.deepEqual(getContacts({ discord: '@nef1c' }), [
    { label: 'Discord', detail: '@nef1c', copy: 'nef1c' },
  ]);
});

test('Discord user ID URL is clickable', () => {
  assert.equal(getContacts({ discord: 'https://discord.com/users/1234567890' })[0].href,
    'https://discord.com/users/1234567890');
});

test('Telegram username accepts a handle or a link', () => {
  assert.equal(getContacts({ telegram: '@nef1c' })[0].href, 'https://t.me/nef1c');
  assert.equal(getContacts({ telegram: 'https://t.me/nef1c' })[0].detail, '@nef1c');
});

test('all four contacts are independent', () => {
  const contacts = getContacts({
    discord: 'nef1c',
    telegram: '@nef1c',
    discord_server: 'https://discord.gg/example',
    telegram_channel: 'https://t.me/pepetech',
  });
  assert.deepEqual(contacts.map((item) => item.label),
    ['Discord', 'Telegram', 'Discord-сервер', 'Telegram-канал']);
  assert.equal(contacts[2].href, 'https://discord.gg/example');
  assert.equal(contacts[3].href, 'https://t.me/pepetech');
});

test('only populated fields appear', () => {
  assert.deepEqual(getContacts({ telegram_channel: 'https://t.me/examplechannel' }).map((item) => item.label),
    ['Telegram-канал']);
});

test('untrusted links are not rendered', () => {
  assert.deepEqual(getContacts({
    discord: 'javascript:alert(1)',
    telegram: 'https://malicious.test/profile',
    discord_server: 'https://example.com/invite/test',
    telegram_channel: 'https://evil.t.me.example.com/channel',
  }), []);
});

test('invalid or incomplete links are ignored', () => {
  assert.deepEqual(getContacts({
    telegram: 'xx',
    discord_server: 'https://discord.gg/',
    telegram_channel: 'https://t.me/',
  }), []);
});
