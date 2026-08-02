/**
 * Contact Page JavaScript
 * Handles form validation, FAQ accordion, animations, and interactions
 */

class ContactManager {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.initializeAOS();
        this.setupFormValidation();
        this.setupFAQAccordion();
        this.setupRippleEffects();
        this.setupFormTracking();
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
     * Setup comprehensive form validation
     */
    setupFormValidation() {
        if (!this.form) return;

        // Real-time validation on input
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    /**
     * Validate individual form field
     */
    validateField(field) {
        if (!field.name || field.name === 'website' || field.type === 'hidden' || field.name === '_token') {
            return true;
        }

        const value = field.value.trim();
        const fieldName = field.name;
        const group = field.closest('.form-group') || field.parentElement;
        const errorSpan = group?.querySelector('.error-message');
        let isValid = true;
        let errorMessage = '';

        field.classList.remove('error', 'success');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
        }

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        if (fieldName === 'phone') {
            const digits = value.replace(/\D/g, '');
            if (field.hasAttribute('required') && digits.length < 10) {
                isValid = false;
                errorMessage = 'Please enter a valid mobile number';
            } else if (value) {
                const phoneRegex = /^[\d\s\+\-\(\)]+$/;
                if (!phoneRegex.test(value) || digits.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a valid mobile number';
                }
            }
        }

        if (fieldName === 'name' && value && value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters';
        }

        if (fieldName === 'message' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Please add a bit more detail (at least 10 characters)';
        }

        if (!isValid) {
            field.classList.add('error');
            if (errorSpan) {
                errorSpan.textContent = errorMessage;
                errorSpan.classList.add('show');
            }
        } else if (value && field.type !== 'checkbox') {
            field.classList.add('success');
        }

        return isValid;
    }

    clearFieldErrors() {
        if (!this.form) return;
        this.form.querySelectorAll('.error-message').forEach((el) => {
            el.textContent = '';
            el.classList.remove('show');
        });
        this.form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
        const serverEl = document.getElementById('formServerError');
        if (serverEl) {
            serverEl.textContent = '';
            serverEl.classList.add('hidden');
        }
    }

    applyServerErrors(errors) {
        if (!errors || typeof errors !== 'object') return;
        Object.keys(errors).forEach((key) => {
            const input = this.form.querySelector(`[name="${key}"]`);
            const messages = errors[key];
            const text = Array.isArray(messages) ? messages[0] : String(messages);
            if (!input) return;
            const group = input.closest('.form-group') || input.parentElement;
            const errorSpan = group?.querySelector('.error-message');
            input.classList.add('error');
            if (errorSpan) {
                errorSpan.textContent = text;
                errorSpan.classList.add('show');
            }
        });
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        this.clearFieldErrors();

        const fields = this.form.querySelectorAll('input:not([type="checkbox"]):not([type="hidden"]), textarea, select');
        let isFormValid = true;
        fields.forEach((input) => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please check the highlighted fields.', 'error');
            return;
        }

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalButtonContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <div class="spinner"></div>
            <span>Sending...</span>
        `;

        const url = window.SMK_ROUTES?.contactSubmit || this.form.getAttribute('action');
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                },
                body: formData,
            });

            const payload = await response.json().catch(() => ({}));

            if (response.status === 422 && payload.errors) {
                this.applyServerErrors(payload.errors);
                this.showNotification('Please correct the errors and try again.', 'error');
                return;
            }

            if (!response.ok) {
                const msg = payload.message || 'Something went wrong. Please try call or WhatsApp.';
                const serverEl = document.getElementById('formServerError');
                if (serverEl) {
                    serverEl.textContent = msg;
                    serverEl.classList.remove('hidden');
                }
                this.showNotification(msg, 'error');
                return;
            }

            this.showSuccessMessage(payload.message);

            this.form.reset();
            fields.forEach((input) => {
                input.classList.remove('success', 'error');
            });

            this.trackFormSubmission(data);
        } catch (error) {
            this.showNotification('Network error. Please call +91 99091 40334 or use WhatsApp.', 'error');
            console.error('Form submission error:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
        }
    }

    showSuccessMessage(message) {
        const successMessage = document.getElementById('successMessage');
        const textEl = document.getElementById('successMessageText');
        if (textEl && message) {
            textEl.textContent = message;
        }
        if (successMessage) {
            successMessage.classList.remove('hidden');
            successMessage.classList.add('success-animate');

            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 8000);

            successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-50 transform transition-all duration-300`;
        notification.style.transform = 'translateX(400px)';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Setup FAQ accordion functionality
     */
    setupFAQAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');

            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                faqItems.forEach((i) => i.classList.remove('active'));
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        });
    }

    /**
     * Setup ripple effects on buttons
     */
    setupRippleEffects() {
        const buttons = document.querySelectorAll('button, .ripple-container');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });
    }

    /**
     * Create ripple effect
     */
    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Setup form field tracking
     */
    setupFormTracking() {
        const formFields = this.form?.querySelectorAll('input, textarea, select') || [];

        formFields.forEach(field => {
            field.addEventListener('focus', () => {
                console.log(`Field focused: ${field.name}`);
            });
        });
    }

    /**
     * Track form submission for analytics
     */
    trackFormSubmission(data) {
        if (typeof gtag === 'function') {
            gtag('event', 'contact_submit', { subject: data.subject || '' });
        }
    }
}

/**
 * Phone number formatter
 */
class PhoneFormatter {
    constructor() {
        this.setupFormatter();
    }

    setupFormatter() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Auto-format Indian phone numbers
            if (value.length > 0) {
                if (value.startsWith('91')) {
                    value = '+' + value;
                } else if (!value.startsWith('+')) {
                    value = '+91' + value;
                }
            }

            e.target.value = value.slice(0, 14); // Limit to +91 and 10 digits
        });
    }
}

/**
 * Auto-save form data to localStorage
 */
class FormAutoSave {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.storageKey = `contactForm_${formId}`;
        this.loadSavedData();
        this.setupAutoSave();
    }

    setupAutoSave() {
        const inputs = this.form.querySelectorAll('input:not([type="checkbox"]), textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveData();
            });
        });
    }

    saveData() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    loadSavedData() {
        const savedData = localStorage.getItem(this.storageKey);
        if (!savedData) return;

        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = this.form.querySelector(`[name="${key}"]`);
                if (input && input.type !== 'checkbox') {
                    input.value = data[key];
                }
            });
        } catch (error) {
            console.error('Failed to load saved form data:', error);
        }
    }

    clearSavedData() {
        localStorage.removeItem(this.storageKey);
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

                console.log(`Contact Page Load Time: ${pageLoadTime}ms`);
                console.log(`DOM Ready Time: ${domReady}ms`);
            });
        }
    }
}

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main contact manager
    const contactManager = new ContactManager();

    // Initialize phone formatter
    const phoneFormatter = new PhoneFormatter();

    // Initialize form auto-save
    const formAutoSave = new FormAutoSave('contactForm');

    // Clear auto-saved data on successful submission
    const originalShowSuccess = contactManager.showSuccessMessage.bind(contactManager);
    contactManager.showSuccessMessage = function() {
        originalShowSuccess();
        formAutoSave.clearSavedData();
    };

    // Initialize performance monitor
    const performanceMonitor = new PerformanceMonitor();

    // Setup smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Console greeting
    console.log('%c📞 Contact Page Loaded Successfully!', 
        'font-size: 16px; font-weight: bold; color: #fbbf24;');
    console.log('%cShree Ram Tours and Travels Taxi Service - Contact Us', 
        'font-size: 12px; color: #1a3a52;');
});

/**
 * Handle visibility changes (tab switching)
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('User switched away from contact page');
    } else {
        console.log('User returned to contact page');
        // Refresh AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
});

/**
 * Export for external use if needed
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContactManager, FormAutoSave };
}
