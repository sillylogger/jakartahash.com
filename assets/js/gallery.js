/**
 * Gallery Page JavaScript
 * Handles hero slideshow and photo lightbox functionality
 */

(function() {
  'use strict';

  // ============================================
  // Hero Slideshow
  // ============================================

  const slideshow = {
    container: null,
    slides: [],
    indicators: [],
    currentIndex: 0,
    interval: null,
    autoPlayDelay: 5000,
    isPaused: false,

    init() {
      this.container = document.querySelector('.hero__slides');
      if (!this.container) return;

      this.slides = Array.from(document.querySelectorAll('.hero__slide'));
      this.indicators = Array.from(document.querySelectorAll('.hero__indicator'));

      if (this.slides.length <= 1) return;

      this.bindEvents();
      this.startAutoPlay();
    },

    bindEvents() {
      // Navigation buttons
      const prevBtn = document.querySelector('.hero__nav--prev');
      const nextBtn = document.querySelector('.hero__nav--next');

      if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
      if (nextBtn) nextBtn.addEventListener('click', () => this.next());

      // Indicator dots
      this.indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => this.goTo(index));
      });

      // Pause on hover
      const hero = document.querySelector('.hero');
      if (hero) {
        hero.addEventListener('mouseenter', () => this.pause());
        hero.addEventListener('mouseleave', () => this.resume());
      }

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (document.querySelector('.lightbox.active')) return; // Don't interfere with lightbox
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });
    },

    goTo(index) {
      if (index === this.currentIndex) return;

      // Remove active class from current
      this.slides[this.currentIndex].classList.remove('active');
      if (this.indicators[this.currentIndex]) {
        this.indicators[this.currentIndex].classList.remove('active');
      }

      // Update index (wrap around)
      this.currentIndex = (index + this.slides.length) % this.slides.length;

      // Add active class to new slide
      this.slides[this.currentIndex].classList.add('active');
      if (this.indicators[this.currentIndex]) {
        this.indicators[this.currentIndex].classList.add('active');
      }
    },

    next() {
      this.goTo(this.currentIndex + 1);
    },

    prev() {
      this.goTo(this.currentIndex - 1);
    },

    startAutoPlay() {
      this.interval = setInterval(() => {
        if (!this.isPaused) this.next();
      }, this.autoPlayDelay);
    },

    pause() {
      this.isPaused = true;
    },

    resume() {
      this.isPaused = false;
    }
  };

  // ============================================
  // Photo Lightbox
  // ============================================

  const lightbox = {
    element: null,
    image: null,
    counter: null,
    images: [],
    currentIndex: 0,

    init() {
      this.element = document.querySelector('.lightbox');
      if (!this.element) return;

      this.image = this.element.querySelector('.lightbox__image');
      this.counter = this.element.querySelector('.lightbox__counter');

      // Collect all gallery images
      const gridItems = document.querySelectorAll('.photo-grid__item');
      this.images = Array.from(gridItems).map(item => {
        const img = item.querySelector('img');
        return img ? img.src : null;
      }).filter(Boolean);

      this.bindEvents();
    },

    bindEvents() {
      // Open lightbox on grid item click
      const gridItems = document.querySelectorAll('.photo-grid__item');
      gridItems.forEach((item, index) => {
        item.addEventListener('click', () => this.open(index));
      });

      // Close button
      const closeBtn = this.element.querySelector('.lightbox__close');
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());

      // Navigation buttons
      const prevBtn = this.element.querySelector('.lightbox__nav--prev');
      const nextBtn = this.element.querySelector('.lightbox__nav--next');
      if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
      if (nextBtn) nextBtn.addEventListener('click', () => this.next());

      // Close on overlay click
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) this.close();
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.element.classList.contains('active')) return;

        switch (e.key) {
          case 'Escape':
            this.close();
            break;
          case 'ArrowLeft':
            this.prev();
            break;
          case 'ArrowRight':
            this.next();
            break;
        }
      });

      // Touch swipe support
      let touchStartX = 0;
      let touchEndX = 0;

      this.element.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.element.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) this.next();
          else this.prev();
        }
      }, { passive: true });
    },

    open(index) {
      this.currentIndex = index;
      this.updateImage();
      this.element.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Preload adjacent images
      this.preload(index - 1);
      this.preload(index + 1);
    },

    close() {
      this.element.classList.remove('active');
      document.body.style.overflow = '';
    },

    goTo(index) {
      this.currentIndex = (index + this.images.length) % this.images.length;
      this.updateImage();

      // Preload adjacent images
      this.preload(this.currentIndex - 1);
      this.preload(this.currentIndex + 1);
    },

    next() {
      this.goTo(this.currentIndex + 1);
    },

    prev() {
      this.goTo(this.currentIndex - 1);
    },

    updateImage() {
      if (this.image && this.images[this.currentIndex]) {
        this.image.src = this.images[this.currentIndex];
      }
      if (this.counter) {
        this.counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
      }
    },

    preload(index) {
      const normalizedIndex = (index + this.images.length) % this.images.length;
      if (this.images[normalizedIndex]) {
        const img = new Image();
        img.src = this.images[normalizedIndex];
      }
    }
  };

  // ============================================
  // Initialize on DOM ready
  // ============================================

  document.addEventListener('DOMContentLoaded', () => {
    slideshow.init();
    lightbox.init();
  });

})();
