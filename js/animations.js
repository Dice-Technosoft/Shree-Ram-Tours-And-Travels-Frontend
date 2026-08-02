/**
 * ANIMATIONS.JS - Global Animation Utilities
 * Handles scroll animations, intersection observers, and utility functions
 */

class AnimationManager {
    constructor() {
        this.observerConfig = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        this.init();
    }

    /**
     * Initialize animation manager
     */
    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupCountUp();
    }

    /**
     * Setup intersection observer for scroll animations
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class
                    if (entry.target.dataset.animation) {
                        entry.target.classList.add(`animate-${entry.target.dataset.animation}`);
                    } else {
                        entry.target.classList.add('animate-fade-in-up');
                    }

                    // Add delay if specified
                    if (entry.target.dataset.delay) {
                        entry.target.style.animationDelay = entry.target.dataset.delay;
                    }

                    observer.unobserve(entry.target);
                }
            });
        }, this.observerConfig);

        // Observe all elements with animation data attribute
        document.querySelectorAll('[data-animation]').forEach(el => {
            observer.observe(el);
        });

        // Observe all elements with animate- class
        document.querySelectorAll('[class*="animate-fade-in"], [class*="animate-slide"], [class*="animate-scale"]')
            .forEach(el => observer.observe(el));
    }

    /**
     * Setup scroll-triggered animations
     */
    setupScrollAnimations() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Handle scroll-based animations
     */
    handleScrollAnimations() {
        const scrollPercentage = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

        // Trigger animations at specific scroll percentages
        document.querySelectorAll('[data-scroll-animation]').forEach(el => {
            const trigger = parseInt(el.dataset.scrollAnimation);
            if (scrollPercentage >= trigger && !el.classList.contains('animated')) {
                el.classList.add('animated');
                if (el.dataset.animation) {
                    el.classList.add(`animate-${el.dataset.animation}`);
                }
            }
        });
    }

    /**
     * Setup count-up animations for numbers
     */
    setupCountUp() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const elements = entry.target.querySelectorAll('[data-count]');
                    elements.forEach(el => {
                        this.countUp(el);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerConfig);

        document.querySelectorAll('[class*="stats"], [class*="counter"]')
            .forEach(el => observer.observe(el));
    }

    /**
     * Animate number count-up
     */
    countUp(element) {
        if (element.classList.contains('counted')) return;

        const target = parseInt(element.dataset.count);
        const duration = parseInt(element.dataset.duration || 2000);
        const increment = target / (duration / 16);
        let current = 0;

        const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (element.dataset.suffix || '');
                clearInterval(counter);
                element.classList.add('counted');
            } else {
                element.textContent = Math.floor(current) + (element.dataset.suffix || '');
            }
        }, 16);
    }

    /**
     * Trigger animation on element
     */
    static triggerAnimation(element, animationName, duration = 600) {
        if (!element) return;

        element.classList.remove(animationName);
        // Trigger reflow to restart animation
        void element.offsetWidth;
        element.classList.add(animationName);

        setTimeout(() => {
            element.classList.remove(animationName);
        }, duration);
    }

    /**
     * Animate element to position
     */
    static animateToPosition(element, targetX, targetY, duration = 1000) {
        const startX = element.offsetLeft;
        const startY = element.offsetTop;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeInOutCubic(progress);

            element.style.transform = `translate(${startX + (targetX - startX) * easeProgress}px, ${startY + (targetY - startY) * easeProgress}px)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Easing function
     */
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Create ripple effect
     */
    static createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Parallax scroll effect
     */
    static setupParallax(selector, intensity = 0.5) {
        const elements = document.querySelectorAll(selector);
        
        window.addEventListener('scroll', () => {
            elements.forEach(el => {
                const scrollPosition = window.pageYOffset;
                const elementPosition = el.getBoundingClientRect().top + scrollPosition;
                const distance = scrollPosition - elementPosition;
                
                el.style.transform = `translateY(${distance * intensity}px)`;
            });
        }, { passive: true });
    }

    /**
     * Fade in animation on scroll
     */
    static observeFadeIn(selector) {
        const elements = document.querySelectorAll(selector);
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    /**
     * Stagger animation for multiple elements
     */
    static staggerAnimation(selector, animationName, delay = 100) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add(`animate-${animationName}`);
            }, delay * index);
        });
    }
}

/**
 * Initialize animation manager when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    new AnimationManager();
});

/**
 * Global animation utilities
 */
window.AnimationUtils = {
    triggerAnimation: AnimationManager.triggerAnimation,
    animateToPosition: AnimationManager.animateToPosition,
    createRipple: AnimationManager.createRipple,
    setupParallax: AnimationManager.setupParallax,
    observeFadeIn: AnimationManager.observeFadeIn,
    staggerAnimation: AnimationManager.staggerAnimation,
};
