// Pick one decorative sticker for the current page load.
// Its fixed position and size are controlled by CSS.
const backdrop = document.querySelector('.sticker-backdrop');

if (backdrop) {
  let urls = [];
  try {
    urls = JSON.parse(backdrop.dataset.stickers || '[]');
  } catch {
    // Invalid or absent sticker data must not affect the catalog.
  }

  if (Array.isArray(urls)) {
    const available = urls.filter((url) => typeof url === 'string' && url.startsWith('/'));
    if (available.length > 0) {
      const image = document.createElement('img');
      image.className = 'background-sticker';
      image.src = available[Math.floor(Math.random() * available.length)];
      image.alt = '';
      image.draggable = false;
      image.loading = 'eager';
      image.decoding = 'async';
      backdrop.append(image);
    }
  }
}
