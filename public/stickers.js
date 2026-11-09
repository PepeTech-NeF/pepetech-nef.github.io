// Randomized decorative background. Runs in the browser, not in GitHub Actions.
const backdrop = document.querySelector('.sticker-backdrop');

if (backdrop) {
  let urls = [];
  try {
    urls = JSON.parse(backdrop.dataset.stickers || '[]');
  } catch {
    // Invalid or absent data must never affect the catalog.
  }

  if (Array.isArray(urls) && urls.length) {
    const shuffle = (array) => {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };

    // Fixed zones keep stickers distributed instead of clustering over each other.
    const positions = [
      [10, 13], [85, 18], [12, 48], [85, 51],
      [15, 82], [77, 80], [46, 12], [51, 86],
    ];
    const narrow = window.matchMedia('(max-width: 620px)').matches;
    const medium = window.matchMedia('(max-width: 980px)').matches;
    const count = Math.min(urls.length, narrow ? 3 : medium ? 5 : 8);
    const selected = shuffle(urls).slice(0, count);
    const locations = shuffle(positions).slice(0, count);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < selected.length; i++) {
      const image = document.createElement('img');
      const [x, y] = locations[i];
      image.className = 'background-sticker';
      image.src = selected[i];
      image.alt = '';
      image.draggable = false;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.style.left = `${x + (Math.random() - 0.5) * 7}%`;
      image.style.top = `${y + (Math.random() - 0.5) * 8}%`;
      image.style.width = `${Math.round((narrow ? 72 : 110) + Math.random() * (narrow ? 40 : 70))}px`;
      image.style.rotate = `${Math.round((Math.random() - 0.5) * 38)}deg`;
      fragment.append(image);
    }

    backdrop.append(fragment);
  }
}
