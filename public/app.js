
const gallery = document.getElementById('gallery');
const search = document.getElementById('search');
const countrySelect = document.getElementById('country');
const results = document.getElementById('results');
const empty = document.getElementById('empty');
const emptyTitle = document.getElementById('empty-title');
const emptyText = document.getElementById('empty-text');
const cards = [...gallery.querySelectorAll('[data-card]')];
const filters = [...document.querySelectorAll('[data-filter]')];
let category = 'all';
const normalize = (value) => value.toLocaleLowerCase('ru').trim();

function applyFilters() {
  const term = normalize(search.value);
  const selectedCountry = countrySelect?.value ?? '';
  let count = 0;
  for (const card of cards) {
    const visible = (category === 'all' || card.dataset.category === category) && (!selectedCountry || card.dataset.country === selectedCountry) && normalize(card.dataset.search).includes(term);
    card.hidden = !visible;
    if (visible) count++;
  }
  results.textContent = 'Найдено: ' + count;
  empty.hidden = count > 0;
  emptyTitle.textContent = cards.length ? 'Ничего не найдено' : 'Пока нет техники';
  emptyText.textContent = cards.length ? 'Измените фильтры или поисковый запрос.' : 'Новые работы появятся здесь.';
}
search.addEventListener('input', applyFilters);
countrySelect?.addEventListener('change', applyFilters);
for (const filter of filters) {
  filter.addEventListener('click', () => {
    category = filter.dataset.filter;
    for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
    applyFilters();
  });
}

const viewer = document.getElementById('viewer');
const viewerTitle = document.getElementById('viewer-title');
const viewerImage = document.getElementById('viewer-image');
const counter = document.getElementById('counter');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
let images = [];
let index = 0;

function showImage() {
  viewerImage.src = images[index];
  viewerImage.alt = viewerTitle.textContent + ' - фото ' + (index + 1);
  counter.textContent = (index + 1) + ' / ' + images.length;
  prev.hidden = images.length < 2;
  next.hidden = images.length < 2;
}
for (const card of cards) {
  card.querySelector('[data-open]').addEventListener('click', () => {
    images = JSON.parse(card.dataset.images);
    if (!images.length) return;
    index = 0;
    viewerTitle.textContent = card.dataset.title;
    showImage();
    viewer.showModal();
  });
}
document.getElementById('viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
prev.addEventListener('click', () => { index = (index - 1 + images.length) % images.length; showImage(); });
next.addEventListener('click', () => { index = (index + 1) % images.length; showImage(); });
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' && images.length > 1) prev.click();
  if (event.key === 'ArrowRight' && images.length > 1) next.click();
});

for (const button of document.querySelectorAll('[data-copy-contact]')) {
  button.addEventListener('click', async () => {
    const status = button.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(button.dataset.copyContact);
      status.textContent = 'Скопировано';
      button.dataset.copyState = 'success';
      window.setTimeout(() => { status.textContent = 'Копировать'; delete button.dataset.copyState; }, 1800);
    } catch {
      status.textContent = 'Не удалось скопировать';
      button.dataset.copyState = 'error';
      window.setTimeout(() => { status.textContent = 'Копировать'; delete button.dataset.copyState; }, 1800);
    }
  });
}

const contactMenu = document.querySelector('.header-contact-menu');
if (contactMenu) {
  document.addEventListener('pointerdown', (event) => {
    if (contactMenu.open && !contactMenu.contains(event.target)) contactMenu.open = false;
  });
  contactMenu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      contactMenu.open = false;
      contactMenu.querySelector('summary').focus();
    }
  });
}
