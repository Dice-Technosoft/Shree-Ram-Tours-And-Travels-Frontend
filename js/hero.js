/**
 * HERO.JS - Hero Section Interactions & Quick Booking with AJAX
 * Handles hero section animations and real-time booking functionality
 */

class HeroManager {
    constructor() {
        this.heroSection = document.querySelector('[class*="hero-section"]');
        this.quickBookingForm = document.getElementById('quickBookingForm');
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        this.bookingInProgress = false;
        
        this.init();
    }

    /**
     * Initialize hero section
     */
    init() {
        this.setupScrollIndicator();
        this.setupQuickBooking();
        this.setupHeroAnimations();
        this.setupSlider();
        this.setupResponsiveImg();
    }

    /**
     * Setup slider behavior if `.hero-slider` exists
     */
    setupSlider() {
        this.slider = document.querySelector('.hero-slider');
        if (!this.slider) return;

        this.sliderTrack = this.slider.querySelector('.hero-slider-track');
        this.slides = this.sliderTrack ? Array.from(this.sliderTrack.querySelectorAll('.hero-slide')) : [];
        this.prevBtn = this.slider.querySelector('.slider-control.prev');
        this.nextBtn = this.slider.querySelector('.slider-control.next');
        this.indicators = Array.from(this.slider.querySelectorAll('.slider-indicators .indicator'));
        this.currentSlide = 0;
        this.autoPlayInterval = null;

        // make slider focusable for keyboard navigation
        this.slider.setAttribute('tabindex', '0');

        // Bind controls
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.prevBtn?.addEventListener('click', () => this.prevSlide());

        // Indicators
        this.indicators.forEach(ind => {
            ind.addEventListener('click', (e) => {
                const idx = parseInt(ind.getAttribute('data-slide'), 10) || 0;
                this.goToSlide(idx);
            });
        });

        // Pause on hover
        this.slider.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.slider.addEventListener('mouseleave', () => this.startAutoPlay());

        // Keyboard navigation
        this.slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Initialize
        this.loadSlideBackgrounds();
        this.updateSliderPosition();
        this.startAutoPlay();
    }

    /**
     * Lazy-load slide backgrounds defined in `data-bg` attribute.
     */
    loadSlideBackgrounds() {
        if (!this.slides || this.slides.length === 0) return;
        this.slides.forEach(slide => {
            const bg = slide.getAttribute('data-bg');
            if (bg) {
                const img = new Image();
                img.onload = () => {
                    // set background image and mark as having bg
                    slide.style.backgroundImage = `url('%24%7bbg%7d.html')`;
                    slide.classList.add('has-bg');
                };
                img.onerror = () => {
                    // keep gradient fallback
                    slide.classList.remove('has-bg');
                };
                img.src = bg;
            }
        });
    }

    updateSliderPosition() {
        if (!this.sliderTrack) return;
        const offset = -this.currentSlide * 100;
        this.sliderTrack.style.transform = `translateX(${offset}%)`;
        // update indicators
        this.indicators?.forEach((ind, i) => {
            ind.setAttribute('aria-selected', i === this.currentSlide ? 'true' : 'false');
        });
        // update active slide class to enable scale/opacity styling
        this.slides?.forEach((s, i) => {
            if (i === this.currentSlide) s.classList.add('active'); else s.classList.remove('active');
        });
    }

    goToSlide(index) {
        if (!this.slides || this.slides.length === 0) return;
        const len = this.slides.length;
        this.currentSlide = (index + len) % len;
        this.updateSliderPosition();
    }

    nextSlide() {
        this.goToSlide(this.currentSlide + 1);
    }

    prevSlide() {
        this.goToSlide(this.currentSlide - 1);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        // slightly faster autoplay for snappier UX
        const interval = 5000;
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, interval);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    /**
     * Setup scroll indicator click behavior
     */
    setupScrollIndicator() {
        if (!this.scrollIndicator) return;

        this.scrollIndicator.addEventListener('click', () => {
            const nextSection = this.heroSection?.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        // Remove scroll indicator on first scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100 && this.scrollIndicator) {
                this.scrollIndicator.style.opacity = '0';
                this.scrollIndicator.style.pointerEvents = 'none';
            }
        }, { once: true });
    }

    /**
     * Setup quick booking form with AJAX
     */
    setupQuickBooking() {
        if (!this.quickBookingForm) return;

        // Set today's date as default
        const dateInput = this.quickBookingForm.querySelector('[name="travelDate"]');
        if (dateInput) {
            const today = new Date();
            today.setDate(today.getDate());
            dateInput.value = today.toISOString().split('T')[0];
            dateInput.min = today.toISOString().split('T')[0];
        }

        // Handle form submission
        this.quickBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickBooking();
        });

        // Real-time validation
        this.setupFormValidation();
    }

    /**
     * Handle quick booking form submission with AJAX
     */
    handleQuickBooking() {
        if (this.bookingInProgress) return;

        const fromLocation = this.quickBookingForm.querySelector('[name="fromLocation"]');
        const toLocation = this.quickBookingForm.querySelector('[name="toLocation"]');
        const travelDate = this.quickBookingForm.querySelector('[name="travelDate"]');
        const travelTime = this.quickBookingForm.querySelector('[name="travelTime"]');

        // Validation
        if (!fromLocation?.value.trim() || !toLocation?.value.trim()) {
            this.showBookingError('Please enter both pickup and destination locations');
            return;
        }

        if (!travelDate?.value) {
            this.showBookingError('Please select a travel date');
            return;
        }

        this.bookingInProgress = true;
        const submitBtn = this.quickBookingForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent;

        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            submitBtn.classList.add('opacity-50');
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('from_location', fromLocation.value);
        formData.append('to_location', toLocation.value);
        formData.append('travel_date', travelDate.value);
        formData.append('travel_time', travelTime?.value || '');
        formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.content || '');

        // Send AJAX request
        fetch('/api/booking/quick-check', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showBookingSuccess(data);
                // Redirect or open booking page
                if (data.booking_url) {
                    // Give feedback before redirecting
                    setTimeout(() => {
                        window.location.href = data.booking_url;
                    }, 1500);
                }
            } else {
                this.showBookingError(data.message || 'Booking check failed');
            }
        })
        .catch(error => {
            console.error('Booking error:', error);
            this.showBookingError('Unable to process booking. Please try again.');
        })
        .finally(() => {
            this.bookingInProgress = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.classList.remove('opacity-50');
            }
        });
    }

    /**
     * Show booking success message
     */
    showBookingSuccess(data) {
        const successDiv = document.createElement('div');
        successDiv.className = 'booking-alert booking-success';
        successDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>${data.message || 'Availability checked! Proceeding to booking...'}</span>
            </div>
        `;
        
        this.showAlert(successDiv);
    }

    /**
     * Show booking error message
     */
    showBookingError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'booking-alert booking-error';
        errorDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        this.showAlert(errorDiv);
    }

    /**
     * Show alert message in form
     */
    showAlert(alertElement) {
        // Remove previous alerts
        const previousAlerts = this.quickBookingForm?.querySelectorAll('.booking-alert');
        previousAlerts?.forEach(alert => alert.remove());

        // Insert new alert
        const firstFormGroup = this.quickBookingForm?.querySelector('[class*="form-group"]');
        if (firstFormGroup) {
            firstFormGroup.parentElement?.insertBefore(alertElement, firstFormGroup);
        }

        // Auto-remove alert after 5 seconds if success
        if (alertElement.classList.contains('booking-success')) {
            setTimeout(() => {
                alertElement.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => alertElement.remove(), 300);
            }, 5000);
        }
    }

    /**
     * Setup real-time form validation
     */
    setupFormValidation() {
        const inputs = this.quickBookingForm?.querySelectorAll('input, select');
        inputs?.forEach(input => {
            input.addEventListener('change', (e) => {
                this.validateField(e.target);
            });

            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
        });
    }

    /**
     * Validate individual form field
     */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        if (field.name === 'fromLocation' || field.name === 'toLocation') {
            isValid = value.length >= 2;
            errorMessage = 'Location must be at least 2 characters';
        } else if (field.name === 'travelDate') {
            isValid = !!value;
            errorMessage = 'Travel date is required';
        }

        // Visual feedback
        if (!isValid && field.value) {
            field.classList.add('input-error');
        } else {
            field.classList.remove('input-error');
        }
    }

    /**
     * Setup hero animations on scroll
     */
    setupHeroAnimations() {
        if (!this.heroSection) return;

        // Observe hero elements for intersection
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animatable elements in hero section
        const animatableElements = this.heroSection.querySelectorAll('[class*="animate-"]');
        animatableElements.forEach(el => observer.observe(el));
    }

    /**
     * Setup responsive images
     */
    setupResponsiveImg() {
        const images = this.heroSection?.querySelectorAll('img');
        images?.forEach(img => {
            if (!img.src && img.dataset.src) {
                img.src = img.dataset.src;
            }

            // Handle image loading states
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });

            img.addEventListener('error', () => {
                img.classList.add('error');
            });
        });
    }
}

/**
 * Initialize hero when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    new HeroManager();
});

/**
 * Fallback for dynamic content loading
 */
window.initializeHero = function() {
    new HeroManager();
};
