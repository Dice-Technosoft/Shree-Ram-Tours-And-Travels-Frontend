/**
 * HEADER SLIDER - Bold Full-Width Design
 */

class HeaderSlider {
    constructor() {
        this.slider = document.querySelector('.slider-wrapper');
        if (!this.slider) return;

        this.slides = this.slider.querySelectorAll('.hero-slide');
        this.dots = document.querySelectorAll('.header-slider-dot');
        this.prevBtn = document.querySelector('.header-slider-prev');
        this.nextBtn = document.querySelector('.header-slider-next');
        this.currentSlide = 0;
        this.autoPlayInterval = null;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        // Show first slide
        this.slides[0].classList.add('active');
        this.slides[0].classList.remove('opacity-0', 'invisible');
        if (this.dots[0]) {
            this.dots[0].classList.add('active', 'bg-yellow-400');
            this.dots[0].classList.remove('bg-white/50');
        }

        // Setup controls
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeSlide(this.currentSlide - 1);
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeSlide(this.currentSlide + 1);
            });
        }

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeSlide(index);
            });
        });

        // Auto-play
        this.startAutoPlay();
        this.slider.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    changeSlide(index) {
        // Normalize index
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;

        // Remove active from all
        this.slides.forEach(slide => {
            slide.classList.remove('active');
            slide.classList.add('opacity-0', 'invisible');
        });
        this.dots.forEach(dot => {
            dot.classList.remove('active', 'bg-yellow-400', 'w-3');
            dot.classList.add('bg-white/50', 'w-3');
        });

        // Add active to current
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        this.slides[this.currentSlide].classList.remove('opacity-0', 'invisible');
        
        if (this.dots[this.currentSlide]) {
            this.dots[this.currentSlide].classList.add('active', 'bg-yellow-400');
            this.dots[this.currentSlide].classList.remove('bg-white/50');
        }
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.changeSlide(this.currentSlide + 1);
        }, 8000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new HeaderSlider();
});
