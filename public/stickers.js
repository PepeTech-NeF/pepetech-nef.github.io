// Choose one sticker and a random position in the lower-right viewport quadrant.
const backdrop = document.querySelector('.sticker-backdrop');

if (backdrop) {
  let urls = [];
  try {
    urls = JSON.parse(backdrop.dataset.stickers || '[]');
  } catch {
    // Invalid sticker data must never affect the catalog.
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

      // Keep the chosen random coordinates on viewport resize.
      const horizontal = Math.random();
      const vertical = Math.random();
      const positionSticker = () => {
        const { width, height } = image.getBoundingClientRect();
        const compact = window.innerWidth <= 620;
        const rightMargin = compact ? 24 : 46;
        const bottomMargin = compact ? 30 : 50;
        const maxRight = Math.max(rightMargin, window.innerWidth / 2 - width);
        const maxBottom = Math.max(bottomMargin, window.innerHeight / 2 - height);
        image.style.right = `${Math.round(rightMargin + horizontal * (maxRight - rightMargin))}px`;
        image.style.bottom = `${Math.round(bottomMargin + vertical * (maxBottom - bottomMargin))}px`;
      };

      backdrop.append(image);
      positionSticker();
      window.addEventListener('resize', positionSticker);
    }
  }
}
