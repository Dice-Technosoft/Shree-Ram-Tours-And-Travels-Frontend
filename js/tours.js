/**
 * Tours Page Manager - Enhanced Premium Version
 * Handles tour filtering, animations, parallax effects, and advanced interactions
 * @version 2.0
 */

class ToursManager {
    constructor() {
        this.currentFilter = 'all';
        this.tourCards = [];
        this.filterButtons = [];
        this.isAnimating = false;
        this.init();
    }

    /**
     * Initialize the tours manager
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.initializeAnimations();
        this.showAllTours();
        this.setupScrollReveal();
        this.setupParallaxEffects();
        this.setupIntersectionObservers();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.toursGrid = document.getElementById('toursGrid');
        this.tourCards = document.querySelectorAll('.tour-card');
        this.filterButtons = document.querySelectorAll('.tour-filter-btn');
        this.heroSection = document.getElementById('heroSection');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter button clicks with debouncing
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isAnimating) {
                    const category = button.dataset.category;
                    this.filterTours(category);
                    this.updateActiveButton(button);
                }
            });

            // Keyboard accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });

        // Enhanced tour card hover effects
        this.tourCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.handleCardHover(card));
            card.addEventListener('mouseleave', () => this.handleCardLeave(card));
        });

        // Booking button interactions
        document.querySelectorAll('a[href^="/booking"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const tourId = link.getAttribute('href').split('tour=')[1];
                if (tourId) {
                    this.trackTourClick(tourId);
                    this.showBookingLoader(e.currentTarget);
                }
            });
        });

        // Smooth scroll for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                if (target) {
                    this.smoothScrollTo(target, 100);
                }
            });
        });

        // Window scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 10);
        });
    }

    /**
     * Initialize entry animations
     */
    initializeAnimations() {
        this.tourCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    /**
     * Setup parallax effects for hero section
     */
    setupParallaxEffects() {
        if (!this.heroSection) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const floatingElements = this.heroSection.querySelectorAll(
                '.animate-float, .animate-float-delayed, .animate-float-slow'
            );
            
            floatingElements.forEach((element, index) => {
                const speed = 0.3 + (index * 0.08);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    /**
     * Setup intersection observers for scroll animations
     */
    setupIntersectionObservers() {
        // Observe feature cards
        const featureCards = document.querySelectorAll('.group.transform');
        const featureObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                    }, index * 80);
                    featureObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        featureCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px) scale(0.95)';
            card.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
            featureObserver.observe(card);
        });

        // Observe testimonials
        const testimonials = document.querySelectorAll('.bg-white.rounded-3xl');
        const testimonialObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 120);
                    testimonialObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        testimonials.forEach(testimonial => {
            testimonial.style.opacity = '0';
            testimonial.style.transform = 'translateY(30px)';
            testimonial.style.transition = 'all 0.6s ease-out';
            testimonialObserver.observe(testimonial);
        });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrolled = window.pageYOffset;
        
        // Add shadow to filter bar when scrolled
        const filterSection = document.querySelector('.sticky');
        if (filterSection) {
            if (scrolled > 100) {
                filterSection.classList.add('shadow-lg');
            } else {
                filterSection.classList.remove('shadow-lg');
            }
        }
    }

    /**
     * Handle card hover effect
     */
    handleCardHover(card) {
        card.style.transform = 'translateY(-12px) scale(1.02)';
        const image = card.querySelector('img');
        if (image) {
            image.style.transform = 'scale(1.15)';
        }
    }

    /**
     * Handle card leave effect
     */
    handleCardLeave(card) {
        card.style.transform = 'translateY(0) scale(1)';
        const image = card.querySelector('img');
        if (image) {
            image.style.transform = 'scale(1)';
        }
    }

    /**
     * Show booking loader animation
     */
    showBookingLoader(button) {
        const originalContent = button.innerHTML;
        button.innerHTML = `
            <svg class="animate-spin w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2">Loading...</span>
        `;
        button.style.pointerEvents = 'none';
    }

    /**
     * Smooth scroll to element
     */
    smoothScrollTo(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Setup scroll reveal for elements
     */
    setupScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    entry.target.style.opacity = '1';
                }
            });
        }, observerOptions);

        // Observe all tour cards
        this.tourCards.forEach(card => {
            observer.observe(card);
        });
    }

    /**
     * Filter tours by category
     */
    filterTours(category) {
        this.currentFilter = category;

        this.tourCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const shouldShow = category === 'all' || cardCategory === category;

            if (shouldShow) {
                this.showCard(card);
            } else {
                this.hideCard(card);
            }
        });

        // Track filter usage
        this.trackFilter(category);
    }

    /**
     * Show a tour card with animation
     */
    showCard(card) {
        card.classList.remove('fade-out', 'hidden');
        
        // Trigger reflow
        void card.offsetWidth;
        
        setTimeout(() => {
            card.classList.add('fade-in');
            card.style.opacity = '1';
        }, 10);
    }

    /**
     * Hide a tour card with animation
     */
    hideCard(card) {
        card.classList.remove('fade-in');
        card.classList.add('fade-out');
        
        setTimeout(() => {
            card.classList.add('hidden');
            card.style.opacity = '0';
        }, 400);
    }

    /**
     * Show all tours
     */
    showAllTours() {
        this.tourCards.forEach(card => {
            card.classList.remove('hidden', 'fade-out');
            card.style.opacity = '1';
        });
    }

    /**
     * Update active filter button
     */
    updateActiveButton(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    /**
     * Handle card hover effect
     */
    handleCardHover(card) {
        // Add subtle animation or effect
        card.style.transform = 'translateY(-8px)';
        
        setTimeout(() => {
            if (!card.matches(':hover')) {
                card.style.transform = '';
            }
        }, 300);
    }

    /**
     * Track tour click for analytics
     */
    trackTourClick(tourId) {
        console.log(`Tour clicked: ${tourId}`);
        
        // You can add analytics tracking here
        // Example: gtag('event', 'tour_click', { tour_id: tourId });
        
        // Store in localStorage for booking page
        try {
            localStorage.setItem('selectedTour', tourId);
        } catch (e) {
            console.error('LocalStorage not available:', e);
        }
    }

    /**
     * Track filter usage
     */
    trackFilter(category) {
        console.log(`Filter applied: ${category}`);
        
        // You can add analytics tracking here
        // Example: gtag('event', 'filter_tours', { category: category });
    }

    /**
     * Get visible tours count
     */
    getVisibleToursCount() {
        return Array.from(this.tourCards).filter(card => 
            !card.classList.contains('hidden')
        ).length;
    }

    /**
     * Reset filters
     */
    resetFilters() {
        this.filterTours('all');
        this.updateActiveButton(this.filterButtons[0]);
    }
}

/**
 * Utility: Smooth scroll to element
 */
function smoothScrollTo(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Utility: Format price
 */
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * Initialize tours page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Tours Manager
    const toursManager = new ToursManager();

    // Make manager globally accessible for debugging
    window.toursManager = toursManager;

    // Handle URL parameters (e.g., ?category=spiritual)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        const filterButton = document.querySelector(`[data-category="${categoryParam}"]`);
        if (filterButton) {
            filterButton.click();
            
            // Scroll to tours grid after a short delay
            setTimeout(() => {
                const toursGrid = document.getElementById('toursGrid');
                if (toursGrid) {
                    smoothScrollTo(toursGrid, 100);
                }
            }, 500);
        }
    }

    // Add keyboard navigation for filters
    document.querySelectorAll('.tour-filter-btn').forEach((button, index) => {
        button.setAttribute('tabindex', '0');
        
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });

    // Add loading animation when clicking booking buttons
    document.querySelectorAll('a[href^="/booking"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const originalText = button.innerHTML;
            
            button.innerHTML = `
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
            `;
            
            // Note: The page will navigate, so we don't need to restore the text
        });
    });

    // Add parallax effect to hero section
    const heroSection = document.querySelector('.relative.overflow-hidden');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const floatingElements = heroSection.querySelectorAll('.animate-float, .animate-float-delayed, .animate-float-slow');
            
            floatingElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Add entrance animation to features
    const featureCards = document.querySelectorAll('.group.transform');
    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.2 });

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        featureObserver.observe(card);
    });

    console.log('Tours page initialized successfully ✨');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToursManager, smoothScrollTo, formatPrice };
}
