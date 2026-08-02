// Home Page Manager
class HomeManager {
    constructor() {
        this.init();
    }

    init() {
        this.initAOS();
        this.initHeroRouteAnimation();
        this.initCounters();
        this.initScrollEffects();
        this.initServiceCards();
    }

    initHeroRouteAnimation() {
        const routeTextElement = document.getElementById('heroRouteText');
        if (!routeTextElement) return;

        const routes = ['Dwarka', 'Somnath', 'Junagadh', 'Kutch'];
        let index = 0;

        setInterval(() => {
            routeTextElement.classList.add('is-switching');

            setTimeout(() => {
                index = (index + 1) % routes.length;
                routeTextElement.textContent = routes[index];
                routeTextElement.classList.remove('is-switching');
            }, 250);
        }, 2200);
    }

    initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100,
                easing: 'ease-out'
            });
        }
    }

    initCounters() {
        const counters = document.querySelectorAll('.counter');
        
        if (counters.length === 0) return;

        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60 FPS
            let current = 0;

            const updateCounter = () => {
                current += increment;
                
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        };

        // Intersection Observer for counters
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    if (!counter.classList.contains('counted')) {
                        counter.classList.add('counted');
                        animateCounter(counter);
                    }
                }
            });
        }, {
            threshold: 0.5
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    initScrollEffects() {
        // Parallax effect for hero blobs
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const blobs = document.querySelectorAll('.blob');
            
            blobs.forEach((blob, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                blob.style.transform = `translateY(${yPos}px)`;
            });
        });

        // Navbar background on scroll (if needed)
        const handleNavScroll = () => {
            const nav = document.querySelector('nav');
            if (!nav) return;

            if (window.scrollY > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleNavScroll);
    }

    initServiceCards() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createRipple(e, card);
            });
        });
    }

    createRipple(event, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(251, 191, 36, 0.1);
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
        `;

        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleEffect {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        
        if (!document.querySelector('#ripple-animation-style')) {
            style.id = 'ripple-animation-style';
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Smooth scroll to section
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Testimonial Slider (Simple Implementation)
class TestimonialSlider {
    constructor(selector) {
        this.container = document.querySelector(selector);
        if (!this.container) return;

        this.currentIndex = 0;
        this.testimonials = this.container.querySelectorAll('.testimonial-card');
        this.autoPlayInterval = null;
        
        // Uncomment if you want auto-rotating testimonials
        // this.startAutoPlay();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.updateSlider();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
        this.updateSlider();
    }

    updateSlider() {
        this.testimonials.forEach((testimonial, index) => {
            testimonial.style.display = index === this.currentIndex ? 'block' : 'none';
        });
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, 5000); // Change testimonial every 5 seconds
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

// Lazy Loading Images
class LazyImageLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
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

            this.images.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            this.images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
}

// Performance Monitor (Optional - for debugging)
class PerformanceMonitor {
    constructor() {
        if ('PerformanceObserver' in window) {
            this.observePerformance();
        }
    }

    observePerformance() {
        // Observe page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
            }
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Home Manager
    const homeManager = new HomeManager();

    // Initialize Lazy Loading
    new LazyImageLoader();

    // Performance Monitor (only in development)
    // new PerformanceMonitor();

    // Add smooth scroll to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Back to top button (if you add one)
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Handle service card interactions
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Only trigger if not clicking on a link
            if (!e.target.closest('a')) {
                const link = this.querySelector('.service-link');
                if (link) {
                    window.location.href = link.href;
                }
            }
        });
    });

    // Handle destination card interactions
    const destinationCards = document.querySelectorAll('.destination-card');
    destinationCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                const link = this.querySelector('.destination-btn');
                if (link) {
                    window.location.href = link.href;
                }
            }
        });
    });

    // Add loading animation complete class
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Preload critical images
    const criticalImages = [
        '/assets/images/taxi-hero.png',
        'assets/images/taxi-1.html',
        'assets/images/taxi-2.html'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Form validation for newsletter (if you add one)
    const newsletterForm = document.querySelector('#newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // Handle newsletter subscription
                console.log('Newsletter subscription:', email);
                // Show success message
                showNotification('Thank you for subscribing!', 'success');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address', 'error');
            }
        });
    }
});

// Utility Functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    } text-white transform transition-all duration-300`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export for use in other scripts (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HomeManager, LazyImageLoader };
}
