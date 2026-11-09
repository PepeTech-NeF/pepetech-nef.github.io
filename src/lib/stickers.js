import { readdirSync } from 'node:fs';

const IMAGE_FILE = /\.(?:png|jpe?g|webp|avif)$/i;
const STICKER_FOLDER = 'Стикеры';

/**
 * Build a list of sticker URLs from Pages CMS's public/images/Стикеры directory.
 * Files are not converted or re-encoded; this runs once per site build.
 */
export function listStickerUrls(directory, base = '') {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    // The directory may not be present in a fresh clone before the first upload.
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const prefix = String(base).replace(/\/$/, '');
  return entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.') && IMAGE_FILE.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'ru'))
    .map((name) => `${prefix}/images/${encodeURIComponent(STICKER_FOLDER)}/${encodeURIComponent(name)}`);
}
