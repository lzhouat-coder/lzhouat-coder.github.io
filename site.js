(() => {
  if (window.lucide) window.lucide.createIcons();
  const navigation = document.getElementById('navigation');
  const menu = document.querySelector('.nav-toggle');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.querySelectorAll('.abstract-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
    });
  });
  const viewer = document.getElementById('figure-dialog');
  const viewerImage = document.getElementById('figure-image');
  const stage = document.getElementById('figure-stage');
  const zoomIn = document.getElementById('figure-zoom-in');
  const zoomOut = document.getElementById('figure-zoom-out');
  const zoomValue = document.getElementById('figure-zoom-value');
  let zoom = 1;
  let fittedWidth = 0;
  let opener;
  let previousOverflow = '';
  const drawZoom = () => {
    viewerImage.style.width = `${fittedWidth * zoom}px`;
    viewerImage.style.height = 'auto';
    zoomValue.value = `${Math.round(zoom * 100)}%`;
    zoomIn.disabled = zoom >= 4;
    zoomOut.disabled = zoom <= 1;
  };
  const fitImage = () => {
    if (!viewer.open || !viewerImage.naturalWidth) return;
    fittedWidth = Math.min(viewerImage.naturalWidth, stage.clientWidth - 40,
      (stage.clientHeight - 40) * viewerImage.naturalWidth / viewerImage.naturalHeight);
    drawZoom();
  };
  document.querySelectorAll('.research-figure a').forEach(link => {
    if (viewer.showModal) link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', async event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !viewer.showModal) return;
      event.preventDefault();
      const figure = link.closest('figure');
      opener = link;
      document.getElementById('figure-heading').textContent = figure.querySelector('figcaption strong').textContent;
      document.getElementById('figure-description').textContent = figure.querySelector('.figure-note').textContent;
      document.getElementById('figure-open').href = link.href;
      viewerImage.alt = figure.querySelector('img').alt;
      viewerImage.hidden = true;
      viewerImage.src = link.href;
      zoom = 1;
      previousOverflow = document.body.style.overflow;
      viewer.showModal();
      document.body.style.overflow = 'hidden';
      document.getElementById('figure-close').focus();
      try {
        await viewerImage.decode();
        if (!viewer.open) return;
        viewerImage.hidden = false;
        fitImage();
        stage.scrollTo(0, 0);
      } catch {
        document.getElementById('figure-description').textContent = 'The image could not be loaded.';
      }
    });
  });
  zoomIn.addEventListener('click', () => { zoom = Math.min(4, zoom + .5); drawZoom(); });
  zoomOut.addEventListener('click', () => { zoom = Math.max(1, zoom - .5); drawZoom(); });
  document.getElementById('figure-fit').addEventListener('click', () => { zoom = 1; fitImage(); stage.scrollTo(0, 0); });
  const restorePage = () => {
    if (viewer.open) return;
    document.body.style.overflow = previousOverflow;
    opener?.focus();
  };
  const closeViewer = () => { viewer.close(); restorePage(); };
  document.getElementById('figure-close').addEventListener('click', closeViewer);
  viewer.addEventListener('click', event => { if (event.target === viewer) closeViewer(); });
  viewer.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
  viewer.addEventListener('close', restorePage);
  window.addEventListener('resize', fitImage);
  const sections = [...document.querySelectorAll('main > section[id]')];
  const updateNavigation = () => {
    const active = sections.filter(section => section.getBoundingClientRect().top <= 155).at(-1);
    navigation.querySelectorAll('a').forEach(link => {
      if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', updateNavigation, { passive: true });
  updateNavigation();
})();
