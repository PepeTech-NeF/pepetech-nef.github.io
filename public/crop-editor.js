(() => {
  const $ = (id) => document.getElementById(id);
  const canvas = $('preview');
  const ctx = canvas.getContext('2d');
  const fileInput = $('file');
  const controls = $('controls');
  const aspect = $('aspect');
  const zoomInput = $('zoom');
  const widthInput = $('width');
  const formatInput = $('format');
  const qualityInput = $('quality');
  const status = $('status');
  const download = $('download');
  const dropzone = $('dropzone');
  let source = null;
  let sourceName = 'pepe-tech';
  let rotation = 0;
  let mirrored = false;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let dragging = null;

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const bytes = (size) => size >= 1048576
    ? (size / 1048576).toFixed(2) + ' МБ'
    : Math.max(1, Math.round(size / 1024)) + ' КБ';

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.dataset.error = String(isError);
  };

  const dimensions = () => {
    if (!source) return { width: 1, height: 1 };
    const turned = rotation % 2 === 1;
    return {
      width: turned ? source.naturalHeight : source.naturalWidth,
      height: turned ? source.naturalWidth : source.naturalHeight,
    };
  };

  const ratio = () => {
    if (aspect.value === 'original') {
      const size = dimensions();
      return size.width / size.height;
    }
    const [w, h] = aspect.value.split(':').map(Number);
    return w / h;
  };

  const resetPosition = () => {
    zoom = 1;
    panX = 0;
    panY = 0;
    zoomInput.value = '100';
    $('zoom-value').textContent = '100%';
  };

  const draw = (target, width, height, guides = false) => {
    const c = target;
    c.clearRect(0, 0, width, height);
    c.fillStyle = '#101114';
    c.fillRect(0, 0, width, height);
    if (!source) return;
    const size = dimensions();
    const scale = Math.max(width / size.width, height / size.height) * zoom;
    const left = Math.max(0, (size.width * scale - width) / 2);
    const top = Math.max(0, (size.height * scale - height) / 2);
    const x = clamp(panX * width / canvas.width, -left, left);
    const y = clamp(panY * height / canvas.height, -top, top);

    if (guides) {
      panX = x;
      panY = y;
    }

    c.save();
    c.translate(width / 2 + x, height / 2 + y);
    c.rotate(rotation * Math.PI / 2);
    c.scale(mirrored ? -scale : scale, scale);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(source, -source.naturalWidth / 2, -source.naturalHeight / 2);
    c.restore();

    if (guides) {
      c.save();
      c.strokeStyle = 'rgba(255,255,255,0.2)';
      c.lineWidth = Math.max(1, width / 900);
      c.beginPath();
      for (const portion of [1 / 3, 2 / 3]) {
        c.moveTo(width * portion, 0);
        c.lineTo(width * portion, height);
        c.moveTo(0, height * portion);
        c.lineTo(width, height * portion);
      }
      c.stroke();
      c.restore();
    }
  };

  const render = () => {
    if (!source) return;
    const r = ratio();
    canvas.width = r < 1 ? Math.max(1, Math.round(960 * r)) : 960;
    canvas.height = r < 1 ? 960 : Math.max(1, Math.round(960 / r));
    draw(ctx, canvas.width, canvas.height, true);
    const selectedWidth = Number(widthInput.value);
    $('resolution').textContent = selectedWidth + ' × ' + Math.round(selectedWidth / r) + ' px';
  };

  const changeZoom = (value) => {
    zoom = clamp(value, 1, 3);
    zoomInput.value = String(Math.round(zoom * 100));
    $('zoom-value').textContent = zoomInput.value + '%';
    render();
  };

  const load = async (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(file.type)) {
      setStatus('Выберите PNG, JPG, WebP или AVIF.', true);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setStatus('Максимальный размер исходного файла — 50 МБ.', true);
      return;
    }
    setStatus('Открываем изображение…');
    const url = URL.createObjectURL(file);
    try {
      const next = new Image();
      next.src = url;
      await next.decode();
      if (!next.naturalWidth || !next.naturalHeight) throw new Error('Файл не содержит изображения.');
      source = next;
      sourceName = (file.name.replace(/\.[^.]+$/, '') || 'pepe-tech')
        .replace(/[^a-z0-9а-яё_-]+/gi, '-').slice(0, 100);
      rotation = 0;
      mirrored = false;
      resetPosition();
      controls.disabled = false;
      $('empty').hidden = true;
      canvas.hidden = false;
      $('file-info').textContent = file.name + ' · ' + next.naturalWidth + ' × ' + next.naturalHeight + ' px · ' + bytes(file.size);
      setStatus('Готово. Настройте кадр и скачайте файл.');
      render();
    } catch (error) {
      setStatus('Не удалось открыть изображение. Попробуйте другой формат.', true);
    } finally {
      URL.revokeObjectURL(url);
      fileInput.value = '';
    }
  };

  fileInput.addEventListener('change', (event) => load(event.target.files[0]));
  for (const name of ['dragenter', 'dragover']) {
    dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      dropzone.classList.add('dragging');
    });
  }
  for (const name of ['dragleave', 'drop']) {
    dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      dropzone.classList.remove('dragging');
    });
  }
  dropzone.addEventListener('drop', (event) => load(event.dataTransfer.files[0]));

  aspect.addEventListener('change', () => { resetPosition(); render(); });
  zoomInput.addEventListener('input', () => changeZoom(Number(zoomInput.value) / 100));
  widthInput.addEventListener('change', render);
  qualityInput.addEventListener('input', () => {
    $('quality-value').textContent = qualityInput.value + '%';
  });
  formatInput.addEventListener('change', () => {
    $('quality-field').hidden = formatInput.value === 'image/png';
  });
  $('rotate-left').addEventListener('click', () => {
    rotation = (rotation + 3) % 4;
    resetPosition();
    render();
  });
  $('rotate-right').addEventListener('click', () => {
    rotation = (rotation + 1) % 4;
    resetPosition();
    render();
  });
  $('flip').addEventListener('click', () => {
    mirrored = !mirrored;
    render();
  });
  $('reset').addEventListener('click', () => {
    rotation = 0;
    mirrored = false;
    resetPosition();
    render();
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (!source || (event.pointerType === 'mouse' && event.button !== 0)) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging || dragging.id !== event.pointerId) return;
    const rect = canvas.getBoundingClientRect();
    panX += (event.clientX - dragging.x) * canvas.width / rect.width;
    panY += (event.clientY - dragging.y) * canvas.height / rect.height;
    dragging.x = event.clientX;
    dragging.y = event.clientY;
    render();
  });
  const endDrag = (event) => {
    if (dragging && dragging.id === event.pointerId) dragging = null;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', () => { dragging = null; });
  canvas.addEventListener('wheel', (event) => {
    if (!source) return;
    event.preventDefault();
    changeZoom(zoom + (event.deltaY < 0 ? 0.1 : -0.1));
  }, { passive: false });

  download.addEventListener('click', async () => {
    if (!source) return;
    download.disabled = true;
    setStatus('Создаём файл…');
    try {
      const r = ratio();
      let width = Number(widthInput.value);
      let height = Math.max(1, Math.round(width / r));
      if (height > 4096) {
        height = 4096;
        width = Math.max(1, Math.round(height * r));
      }
      const output = document.createElement('canvas');
      output.width = width;
      output.height = height;
      draw(output.getContext('2d'), width, height, false);
      const requestedType = formatInput.value;
      const blob = await new Promise((resolve, reject) => {
        output.toBlob((result) => result ? resolve(result) : reject(new Error('Не удалось сохранить файл.')),
          requestedType, Number(qualityInput.value) / 100);
      });
      const extensions = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };
      const extension = extensions[blob.type] || 'png';
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = sourceName + '-pepetech.' + extension;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      const fallback = blob.type !== requestedType ? ' Формат не поддерживается браузером, использован PNG.' : '';
      setStatus('Файл готов: ' + width + ' × ' + height + ' px, ' + bytes(blob.size) + '.' + fallback);
    } catch (error) {
      setStatus('Ошибка при сохранении файла. Попробуйте другой формат или размер.', true);
    } finally {
      download.disabled = false;
    }
  });
})();
