/**
 * Gallery Page JavaScript
 * Handles hero slideshow, photo pile lightbox, and down-down counter
 */

(function() {
  'use strict';

  // ============================================
  // Random Font on Load (commented out - keeping Comic Sans)
  // ============================================

  /*
  const fontRandomizer = {
    fonts: ['font-comic', 'font-impact', 'font-papyrus', 'font-mono'],

    init() {
      const randomFont = this.fonts[Math.floor(Math.random() * this.fonts.length)];
      document.body.classList.add(randomFont);
      console.log('🎨 Today\'s font:', randomFont.replace('font-', ''));
    }
  };
  */

  // ============================================
  // NSFW Filter Toggle
  // ============================================

  const nsfwFilter = {
    toggle: null,

    init() {
      this.toggle = document.getElementById('nsfwToggle');
      if (!this.toggle) return;

      this.toggle.addEventListener('click', () => this.toggleFilter());
    },

    toggleFilter() {
      document.body.classList.toggle('nsfw-mode');
      const isOn = document.body.classList.contains('nsfw-mode');
      console.log(isOn ? '🔞 NSFW filter ON - now safe for work!' : '🔥 NSFW filter OFF - viewer discretion advised');
    }
  };

  // ============================================
  // Geocities Counter Animation
  // ============================================

  const geocitiesCounter = {
    digits: [],

    init() {
      this.digits = Array.from(document.querySelectorAll('.geocities-counter__digit'));
      if (this.digits.length === 0) return;

      // Increment counter on each page load for fun
      this.incrementCounter();
    },

    incrementCounter() {
      // Get current value
      let value = parseInt(this.digits.map(d => d.textContent).join(''), 10);

      // Add random increment (1-7)
      value += Math.floor(Math.random() * 7) + 1;

      // Update digits with animation
      const newValue = value.toString().padStart(7, '0');
      this.digits.forEach((digit, i) => {
        if (digit.textContent !== newValue[i]) {
          digit.style.transform = 'scale(1.2)';
          digit.textContent = newValue[i];
          setTimeout(() => {
            digit.style.transform = 'scale(1)';
          }, 200);
        }
      });
    }
  };

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
  // Photo Pile Lightbox
  // ============================================

  const lightbox = {
    element: null,
    image: null,
    counter: null,
    caption: null,
    images: [],
    imagePaths: [],
    captions: {},
    fallbackCaptions: [],
    currentIndex: 0,

    init() {
      this.element = document.querySelector('.lightbox');
      if (!this.element) return;

      this.image = this.element.querySelector('.lightbox__image');
      this.counter = this.element.querySelector('.lightbox__counter');
      this.caption = this.element.querySelector('.lightbox__caption');

      // Load captions from embedded JSON
      this.loadCaptions();

      // Collect all pile images and their paths
      const pileItems = document.querySelectorAll('.photo-pile__item');
      this.images = Array.from(pileItems).map(item => {
        const img = item.querySelector('img');
        return img ? img.src : null;
      }).filter(Boolean);

      this.imagePaths = Array.from(pileItems).map(item => {
        return item.dataset.src || '';
      });

      this.bindEvents();
    },

    loadCaptions() {
      const captionScript = document.getElementById('gallery-captions');
      if (captionScript) {
        try {
          const data = JSON.parse(captionScript.textContent);
          if (data.fallback) {
            this.fallbackCaptions = data.fallback;
          } else {
            this.captions = data;
          }
        } catch (e) {
          console.log('Could not parse captions:', e);
        }
      }
    },

    getCaption(index) {
      const path = this.imagePaths[index];
      if (this.captions[path]) {
        return this.captions[path];
      }
      // Use fallback captions
      if (this.fallbackCaptions.length > 0) {
        return this.fallbackCaptions[index % this.fallbackCaptions.length];
      }
      return '';
    },

    bindEvents() {
      // Open lightbox on pile item click
      const pileItems = document.querySelectorAll('.photo-pile__item');
      pileItems.forEach((item, index) => {
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
      if (this.caption) {
        this.caption.textContent = this.getCaption(this.currentIndex);
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
  // FAQ Accordion (allows multiple open)
  // ============================================

  const faqAccordion = {
    init() {
      const questions = document.querySelectorAll('.faq-item__question');
      questions.forEach(question => {
        question.addEventListener('click', () => {
          const item = question.parentElement;
          // Toggle this one (don't close others)
          item.classList.toggle('active');
        });
      });
    }
  };

  // ============================================
  // Down-Down Counter (Manual click with animated counting)
  // ============================================

  const downCounter = {
    element: null,
    numberEl: null,
    takeover: null,
    current: 6,
    target: 69,
    isCounting: false,
    jiggleTimer: null,
    jiggleInterval: 30000, // 30 seconds

    init() {
      this.element = document.querySelector('.down-counter');
      this.numberEl = document.querySelector('.down-counter__number');
      this.takeover = document.querySelector('.down-takeover');

      if (!this.element || !this.numberEl) return;

      this.bindEvents();
      this.startJiggleTimer();
    },

    bindEvents() {
      // Click counter to start counting
      this.element.addEventListener('click', () => this.drink());

      // Click takeover to dismiss and reset
      if (this.takeover) {
        this.takeover.addEventListener('click', () => this.dismissAndReset());
      }
    },

    startJiggleTimer() {
      this.resetJiggleTimer();
    },

    resetJiggleTimer() {
      if (this.jiggleTimer) {
        clearTimeout(this.jiggleTimer);
      }
      this.jiggleTimer = setTimeout(() => this.jiggle(), this.jiggleInterval);
    },

    jiggle() {
      if (this.isCounting) return;

      this.element.classList.add('jiggle');
      setTimeout(() => {
        this.element.classList.remove('jiggle');
      }, 500);

      // Set up next jiggle
      this.jiggleTimer = setTimeout(() => this.jiggle(), this.jiggleInterval);
    },

    drink() {
      if (this.isCounting) return; // Don't allow clicks while counting

      // Reset jiggle timer on interaction
      this.resetJiggleTimer();

      // Calculate random increment (7-12 range for variety)
      const totalIncrement = Math.floor(Math.random() * 6) + 7;

      this.isCounting = true;
      this.animateCount(totalIncrement);
    },

    animateCount(remaining) {
      if (remaining <= 0) {
        this.isCounting = false;

        // Check if we hit 69 or above
        if (this.current >= this.target) {
          this.triggerTakeover();
        }
        return;
      }

      this.current += 1;
      this.numberEl.textContent = this.current;

      // Add a little pulse animation
      this.numberEl.style.transform = 'scale(1.15)';
      setTimeout(() => {
        this.numberEl.style.transform = 'scale(1)';
      }, 80);

      // Check if we just hit 69 - trigger immediately!
      if (this.current >= this.target) {
        this.isCounting = false;
        setTimeout(() => this.triggerTakeover(), 200);
        return;
      }

      // Continue counting with slight acceleration
      const delay = Math.max(50, 150 - (10 - remaining) * 10);
      setTimeout(() => this.animateCount(remaining - 1), delay);
    },

    triggerTakeover() {
      // Clear jiggle timer
      if (this.jiggleTimer) {
        clearTimeout(this.jiggleTimer);
      }

      // Hide counter
      this.element.style.display = 'none';

      // Show takeover
      if (this.takeover) {
        this.takeover.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Create beer rain
        this.createBeerRain();
      }
    },

    createBeerRain() {
      const emojis = ['🍺', '🍻', '🍺', '🥴', '🏃', '🍺'];
      const container = this.takeover;

      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const beer = document.createElement('div');
          beer.className = 'beer-rain';
          beer.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          beer.style.left = Math.random() * 100 + 'vw';
          beer.style.animationDuration = (3 + Math.random() * 4) + 's';
          beer.style.animationDelay = Math.random() * 2 + 's';
          container.appendChild(beer);

          // Remove after animation
          setTimeout(() => beer.remove(), 8000);
        }, i * 200);
      }
    },

    dismissAndReset() {
      if (this.takeover) {
        this.takeover.classList.remove('active');
        document.body.style.overflow = '';

        // Remove any remaining beer rain
        this.takeover.querySelectorAll('.beer-rain').forEach(el => el.remove());
      }

      // Reset counter
      this.current = 6;
      this.numberEl.textContent = this.current;

      // Show counter again
      this.element.style.display = '';

      // Restart jiggle timer
      this.startJiggleTimer();
    }
  };

  // ============================================
  // Initialize on DOM ready
  // ============================================

  document.addEventListener('DOMContentLoaded', () => {
    // fontRandomizer.init(); // Commented out - keeping Comic Sans
    nsfwFilter.init();
    geocitiesCounter.init();
    slideshow.init();
    lightbox.init();
    faqAccordion.init();
    downCounter.init();
  });

})();
