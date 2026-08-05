/**
 * About Page JavaScript
 * Handles animations, counters, scroll effects, and interactions
 */

class AboutManager {
    constructor() {
        this.initializeAOS();
        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setup3DCardEffects();
        this.setupSmoothScroll();
        this.setupParallaxEffect();
        this.observeVisibility();
    }

    /**
     * Initialize AOS (Animate On Scroll) library
     */
    initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100,
                easing: 'ease-out-cubic',
                mirror: false
            });
        }
    }

    /**
     * Setup scroll-based reveal animations
     */
    setupScrollAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('aos-animate');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all elements with data-aos attributes
        const elements = document.querySelectorAll('[data-aos]');
        elements.forEach(el => observer.observe(el));
    }

    /**
     * Animated counter for statistics
     */
    setupCounterAnimations() {
        const counters = document.querySelectorAll('.counter');
        const animationDuration = 2000; // 2 seconds

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    this.animateCounter(entry.target, animationDuration);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    /**
     * Animate individual counter
     */
    animateCounter(element, duration) {
        const target = parseInt(element.getAttribute('data-count'));
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '+';
            }
        };

        requestAnimationFrame(updateCounter);
    }

    /**
     * 3D tilt effect on mission/vision cards
     */
    setup3DCardEffects() {
        const cards = document.querySelectorAll('.mission-vision-card, .value-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                this.handleCardTilt(e, card);
            });

            card.addEventListener('mouseleave', () => {
                this.resetCardTilt(card);
            });
        });
    }

    /**
     * Handle 3D card tilt on mouse move
     */
    handleCardTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    }

    /**
     * Reset card tilt to original position
     */
    resetCardTilt(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    }

    /**
     * Smooth scroll for anchor links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Parallax effect for hero section elements
     */
    setupParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.parallax');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    /**
     * Observe elements coming into view
     */
    observeVisibility() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        this.trackVisibility(entry.target);
                    }
                });
            },
            {
                threshold: 0.2
            }
        );

        const sections = document.querySelectorAll('section');
        sections.forEach(section => observer.observe(section));
    }

    /**
     * Track section visibility for analytics
     */
    trackVisibility(element) {
        const sectionName = element.querySelector('h2, h3')?.textContent || 'Unknown Section';
        console.log(`Section viewed: ${sectionName}`);
        
        // You can integrate Google Analytics or other tracking here
        // Example: gtag('event', 'section_view', { section_name: sectionName });
    }

    /**
     * Add ripple effect to buttons
     */
    static addRippleEffect(button, e) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }
}

/**
 * Image lazy loading with fade-in effect
 */
class ImageLoader {
    constructor() {
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

/**
 * Timeline animation controller
 */
class TimelineAnimator {
    constructor() {
        this.setupTimelineAnimations();
    }

    setupTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('aos-animate');
                        }, index * 200);
                    }
                });
            },
            { threshold: 0.3 }
        );

        timelineItems.forEach(item => observer.observe(item));
    }
}

/**
 * Performance monitoring
 */
class PerformanceMonitor {
    constructor() {
        this.logPerformance();
    }

    logPerformance() {
        if (window.performance) {
            window.addEventListener('load', () => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;

                console.log(`Page Load Time: ${pageLoadTime}ms`);
                console.log(`DOM Ready Time: ${domReady}ms`);
            });
        }
    }
}

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main about page manager
    const aboutManager = new AboutManager();

    // Initialize image loader
    const imageLoader = new ImageLoader();

    // Initialize timeline animator
    const timelineAnimator = new TimelineAnimator();

    // Initialize performance monitor
    const performanceMonitor = new PerformanceMonitor();

    // Add ripple effect to CTA buttons
    const ctaButtons = document.querySelectorAll('.btn-ripple');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            AboutManager.addRippleEffect(button, e);
        });
    });

    // Add click tracking to important links
    const trackableLinks = document.querySelectorAll('a[href*="booking-taxi-ahmedabad"], a[href*="contact-taxi-ahmedabad"]');
    trackableLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log(`User clicked: ${link.textContent.trim()}`);
            // Add analytics tracking here
        });
    });

    // Console greeting
    console.log('%c👋 Welcome to Shree Ram Tours and Travels Taxi Service!', 
        'font-size: 16px; font-weight: bold; color: #fbbf24;');
    console.log('%cAbout Page loaded successfully ✓', 
        'font-size: 12px; color: #10b981;');
});

/**
 * Handle visibility changes (tab switching)
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('User switched away from tab');
    } else {
        console.log('User returned to tab');
        // Refresh AOS animations if needed
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
});

/**
 * Export for external use if needed
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AboutManager, ImageLoader, TimelineAnimator };
}
