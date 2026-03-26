/**
 * PinBoard — script.js
 *
 * Módulos:
 *  1. ThemeToggle   — alterna dark/light mode com persistência em localStorage
 *  2. ToastManager  — notificações flutuantes acessíveis
 *  3. DragManager   — drag-and-drop livre para imagens (mouse + touch)
 *  4. GalleryManager— filtros de categoria e lightbox de imagens
 *  5. MasonryManager— inicializa/recalcula layout Masonry após imagens carregarem
 *  6. BannerManager — exibe/fecha o banner informativo de drag & drop
 *
 * Nenhuma dependência além das já declaradas no HTML:
 *   - Masonry 4 (via CDN)
 *   - imagesLoaded 5 (via CDN) — nova adição: garante que o Masonry só
 *     posicione itens depois que as imagens remotas tenham suas dimensões reais.
 */

'use strict';

/* ================================================================
   UTILITÁRIO: seletor curto
   ================================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================================
   1. THEME TOGGLE
   ================================================================ */
class ThemeToggle {
  constructor() {
    this.body       = document.body;
    this.btn        = $('#theme-toggle');
    this.sunIcon    = $('.sun-icon');
    this.moonIcon   = $('.moon-icon');

    if (!this.btn) return;
    this._init();
  }

  _init() {
    const saved = localStorage.getItem('theme') || 'dark-mode';
    this._apply(saved);

    this.btn.addEventListener('click', () => {
      const next = this.body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
      this._apply(next);
      localStorage.setItem('theme', next);
      Toast.show(next === 'light-mode' ? 'Modo claro ativado' : 'Modo escuro ativado', 'info');
    });
  }

  _apply(theme) {
    this.body.classList.remove('light-mode', 'dark-mode');
    this.body.classList.add(theme);

    if (this.sunIcon)  this.sunIcon.style.display  = theme === 'light-mode' ? 'none'  : 'block';
    if (this.moonIcon) this.moonIcon.style.display = theme === 'light-mode' ? 'block' : 'none';
  }
}

/* ================================================================
   2. TOAST MANAGER
   ================================================================ */
const Toast = (() => {
  const ICONS = { success: 'checkmark-circle', error: 'close-circle', info: 'information-circle' };
  let container;

  function _getContainer() {
    if (!container) container = $('#toast-container');
    return container;
  }

  function show(message, type = 'info', duration = 3000) {
    const ct = _getContainer();
    if (!ct) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <ion-icon name="${ICONS[type] || ICONS.info}"></ion-icon>
      <span>${message}</span>
    `;

    ct.appendChild(toast);

    const remove = () => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };

    const timer = setTimeout(remove, duration);
    toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
  }

  return { show };
})();

/* ================================================================
   3. DRAG MANAGER
   Permite que qualquer elemento com classe .draggable-img seja
   clicado, arrastado livremente pela tela e solto em qualquer
   posição (tanto por mouse quanto por touch).

   Fluxo:
     a) Ao iniciar o arrasto, cria um clone .floating-img fixo na tela.
     b) O clone segue o ponteiro com posição CSS left/top.
     c) Ao soltar, o clone fica "planted" (fixo onde foi solto),
        podendo ser re-arrastado ou duplo-clicado para remover.
     d) A imagem original recebe classe .dragging (fica semitransparente).
   ================================================================ */
class DragManager {
  constructor() {
    this._activeClone  = null;
    this._activeSrc    = null;
    this._originEl     = null;
    this._offsetX      = 0;
    this._offsetY      = 0;
    this._planted      = [];   // lista de clones fixados
    this._draggingPlanted = null; // re-arrasto de um planted

    this._onMove   = this._onMove.bind(this);
    this._onUp     = this._onUp.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd  = this._onTouchEnd.bind(this);

    this._bindAll();
  }

  /* Vincula eventos a todas as imagens draggable presentes agora e futuras */
  _bindAll() {
    document.addEventListener('mousedown', e => {
      const img = e.target.closest('.draggable-img');
      if (img) { e.preventDefault(); this._startDrag(img, e.clientX, e.clientY); }

      /* Re-arrasto de planted */
      const planted = e.target.closest('.floating-img.planted');
      if (planted) { e.preventDefault(); this._startPlantedDrag(planted, e.clientX, e.clientY); }
    });

    document.addEventListener('touchstart', e => {
      const img = e.target.closest('.draggable-img');
      if (img) {
        const t = e.touches[0];
        this._startDrag(img, t.clientX, t.clientY);
      }
      const planted = e.target.closest('.floating-img.planted');
      if (planted) {
        const t = e.touches[0];
        this._startPlantedDrag(planted, t.clientX, t.clientY);
      }
    }, { passive: true });
  }

  /* Inicia arrasto de uma imagem da galeria */
  _startDrag(img, cx, cy) {
    const rect = img.getBoundingClientRect();
    this._offsetX  = cx - rect.left;
    this._offsetY  = cy - rect.top;
    this._originEl = img;

    const clone = this._createClone(img.src, img.alt, rect.width, rect.height);
    clone.style.left = `${cx - this._offsetX}px`;
    clone.style.top  = `${cy - this._offsetY}px`;

    document.body.appendChild(clone);
    this._activeClone = clone;

    img.classList.add('dragging');

    document.addEventListener('mousemove', this._onMove);
    document.addEventListener('mouseup',   this._onUp);
    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend',  this._onTouchEnd);
  }

  /* Inicia re-arrasto de um clone já fixado */
  _startPlantedDrag(planted, cx, cy) {
    const rect = planted.getBoundingClientRect();
    this._offsetX = cx - rect.left;
    this._offsetY = cy - rect.top;
    this._draggingPlanted = planted;

    planted.classList.remove('planted');
    planted.style.pointerEvents = 'none';
    planted.style.opacity = '.92';
    planted.style.transform = 'scale(1.06) rotate(1.5deg)';
    this._activeClone = planted;

    document.addEventListener('mousemove', this._onMove);
    document.addEventListener('mouseup',   this._onUp);
    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend',  this._onTouchEnd);
  }

  _createClone(src, alt, w, h) {
    const clone = document.createElement('img');
    clone.className = 'floating-img';
    clone.src = src;
    clone.alt = alt || 'Imagem arrastada';
    clone.style.width  = `${Math.min(w, 280)}px`;
    clone.style.height = `${Math.min(h, 400)}px`;
    clone.style.objectFit = 'cover';
    return clone;
  }

  _onMove(e) {
    if (!this._activeClone) return;
    this._moveClone(e.clientX, e.clientY);
  }

  _onTouchMove(e) {
    if (!this._activeClone) return;
    e.preventDefault();
    const t = e.touches[0];
    this._moveClone(t.clientX, t.clientY);
  }

  _moveClone(cx, cy) {
    this._activeClone.style.left = `${cx - this._offsetX}px`;
    this._activeClone.style.top  = `${cy - this._offsetY}px`;
  }

  _onUp(e)        { this._endDrag(); }
  _onTouchEnd(e)  { this._endDrag(); }

  _endDrag() {
    if (!this._activeClone) return;

    /* Remove listeners de movimento */
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup',   this._onUp);
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend',  this._onTouchEnd);

    const clone = this._activeClone;

    /* Restaura a imagem original */
    if (this._originEl) {
      this._originEl.classList.remove('dragging');
      this._originEl = null;
    }

    /* Planta o clone na posição atual */
    this._plantClone(clone);

    this._activeClone      = null;
    this._draggingPlanted  = null;
  }

  /* Fixa o clone na tela e habilita duplo-clique para remover */
  _plantClone(clone) {
    clone.classList.add('planted');
    clone.style.pointerEvents = 'auto';
    clone.style.opacity  = '1';
    clone.style.transform = 'scale(1) rotate(0)';

    /* Duplo clique / toque para remover */
    if (!clone._plantedBound) {
      clone._plantedBound = true;
      clone.addEventListener('dblclick', () => this._removePlanted(clone));
      clone.addEventListener('dblclick', () => Toast.show('Imagem removida', 'info', 1800));

      /* Touch: dois taps rápidos simulam dblclick */
      let lastTap = 0;
      clone.addEventListener('touchend', () => {
        const now = Date.now();
        if (now - lastTap < 350) { this._removePlanted(clone); }
        lastTap = now;
      });
    }

    this._planted.push(clone);
    Toast.show('Imagem fixada! Duplo clique para remover.', 'success', 2500);
  }

  _removePlanted(clone) {
    clone.classList.add('dropping');
    clone.addEventListener('transitionend', () => clone.remove(), { once: true });
    this._planted = this._planted.filter(c => c !== clone);
  }
}

/* ================================================================
   4. GALLERY MANAGER — filtros de categoria + lightbox
   ================================================================ */
class GalleryManager {
  constructor() {
    this._items    = $$('.masonry-item');
    this._chips    = $$('.filter-chip');
    this._imgs     = $$('.pin-img');
    this._lightbox = $('#lightbox');
    this._lbImg    = $('#lightbox-img');
    this._lbClose  = $('#lightbox-close');
    this._lbPrev   = $('#lightbox-prev');
    this._lbNext   = $('#lightbox-next');
    this._lbBack   = $('#lightbox-backdrop');
    this._current  = 0;

    if (this._lightbox) this._bindLightbox();
    if (this._chips.length)  this._bindFilters();
    this._markLoaded();
  }

  /* Adiciona classe .loaded quando imagem termina de carregar (remove shimmer) */
  _markLoaded() {
    this._imgs.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      }
    });
  }

  /* Filtros de categoria */
  _bindFilters() {
    this._chips.forEach(chip => {
      chip.addEventListener('click', () => {
        this._chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.dataset.filter;
        this._items.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !match);
        });

        /* Recalcula Masonry após filtrar */
        window.__msnry && window.__msnry.layout();
      });
    });
  }

  /* Lightbox */
  _bindLightbox() {
    /* Abre ao clicar em qualquer pin-card (exceto nos botões de ação) */
    document.addEventListener('click', e => {
      const img = e.target.closest('.pin-img');
      if (!img || e.target.closest('.pin-action')) return;

      const idx = this._imgs.indexOf(img);
      if (idx !== -1) this._open(idx);
    });

    this._lbClose.addEventListener('click', () => this._close());
    this._lbBack.addEventListener('click',  () => this._close());
    this._lbPrev.addEventListener('click',  () => this._navigate(-1));
    this._lbNext.addEventListener('click',  () => this._navigate(1));

    document.addEventListener('keydown', e => {
      if (!this._lightbox || this._lightbox.hidden) return;
      if (e.key === 'Escape')      this._close();
      if (e.key === 'ArrowLeft')   this._navigate(-1);
      if (e.key === 'ArrowRight')  this._navigate(1);
    });
  }

  _open(idx) {
    this._current = idx;
    const src = this._imgs[idx].src;
    const alt = this._imgs[idx].alt;
    this._lbImg.src = src;
    this._lbImg.alt = alt;
    this._lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  _close() {
    this._lightbox.hidden = true;
    this._lbImg.src = '';
    document.body.style.overflow = '';
  }

  _navigate(dir) {
    const visible = this._imgs.filter(img => {
      const item = img.closest('.masonry-item');
      return item && !item.classList.contains('hidden');
    });
    if (!visible.length) return;

    let newIdx = visible.indexOf(this._imgs[this._current]) + dir;
    if (newIdx < 0) newIdx = visible.length - 1;
    if (newIdx >= visible.length) newIdx = 0;

    const globalIdx = this._imgs.indexOf(visible[newIdx]);
    this._open(globalIdx);
  }
}

/* ================================================================
   5. MASONRY MANAGER
   Aguarda imagens carregarem (via imagesLoaded) para inicializar
   o Masonry, evitando colunas desalinhadas no carregamento inicial.
   ================================================================ */
class MasonryManager {
  constructor() {
    const grid = $('#masonry-grid');
    if (!grid || typeof Masonry === 'undefined') return;

    const init = () => {
      window.__msnry = new Masonry(grid, {
        itemSelector: '.masonry-item:not(.hidden)',
        percentPosition: true,
        gutter: 16,
        fitWidth: false,
      });
    };

    /* imagesLoaded (nova biblioteca) garante dimensões corretas */
    if (typeof imagesLoaded !== 'undefined') {
      imagesLoaded(grid, init);
    } else {
      init();
    }
  }
}

/* ================================================================
   6. BANNER MANAGER — banner de instrução drag & drop
   ================================================================ */
class BannerManager {
  constructor() {
    this._banner = $('#drag-banner');
    this._close  = $('#close-banner');

    if (!this._banner) return;

    /* Só mostra se o usuário nunca fechou antes */
    if (localStorage.getItem('banner-dismissed') === '1') {
      this._banner.classList.add('hidden');
      return;
    }

    document.body.classList.add('banner-visible');

    this._close && this._close.addEventListener('click', () => this._dismiss());

    /* Auto-fecha após 10s */
    this._timer = setTimeout(() => this._dismiss(), 10000);
  }

  _dismiss() {
    clearTimeout(this._timer);
    this._banner.classList.add('hidden');
    document.body.classList.remove('banner-visible');
    localStorage.setItem('banner-dismissed', '1');
  }
}

/* ================================================================
   INICIALIZAÇÃO — espera o DOM estar pronto
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  new ThemeToggle();
  new BannerManager();
  new MasonryManager();
  new GalleryManager();
  new DragManager();
});
