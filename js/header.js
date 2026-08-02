/**
 * Site header — mobile drawer, body offset, light scroll styling (no strip hide / no ResizeObserver).
 */

class HeaderManager {
    constructor() {
        this.header = document.getElementById('site-header') || document.querySelector('header.site-header');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.mobileNav = document.getElementById('mobile-nav');
        this.navMenu = document.getElementById('nav-menu');
        this.topStrip = this.header?.querySelector('.site-header__top') ?? null;
        this.mainBar = this.header?.querySelector('.site-header__bar') ?? null;

        this.lockedScrollY = 0;
        this.scrollTicking = false;
        this.resizeTimer = null;
        this._lastMenuToggleAt = 0;
        this._htmlScrollBehaviorBeforeMenu = '';

        this.onResize = this.onResize.bind(this);
        this.onDocClick = this.onDocClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);

        this.init();
    }

    init() {
        if (!this.header) return;

        this.applyBodyOffset();

        this.setupMobileMenu();
        this.setupActiveLinks();
        this.setupSmoothScroll();
        this.setupScrollShadow();

        window.addEventListener('resize', this.onResize, { passive: true });
        window.addEventListener('load', () => this.applyBodyOffset(), { once: true });

        requestAnimationFrame(() => {
            this.applyBodyOffset();
            document.body.classList.add('header-offset-ready');
        });
    }

    /** Matches header.css mobile breakpoint (max-width: 960px) */
    isNarrowViewport() {
        try {
            return window.matchMedia('(max-width: 960px)').matches;
        } catch {
            return window.innerWidth <= 960;
        }
    }

    onResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            if (!this.isNarrowViewport()) {
                this.closeMobileMenu();
            }
            this.applyBodyOffset();
        }, 120);
    }

    applyBodyOffset() {
        if (!this.header) return;

        const rect = this.header.getBoundingClientRect();
        const full = Math.ceil(Math.max(this.header.offsetHeight, rect.height));
        const stripH = this.topStrip ? Math.ceil(this.topStrip.offsetHeight) : 0;
        const barH = this.mainBar ? Math.ceil(this.mainBar.offsetHeight) : Math.max(0, full - stripH);

        document.documentElement.style.setProperty('--site-header-offset', `${full}px`);
        document.documentElement.style.setProperty('--header-height', `${full}px`);
        document.documentElement.style.setProperty('--header-strip-height', `${stripH}px`);
        document.documentElement.style.setProperty('--header-nav-height', `${barH}px`);
    }

    setupMobileMenu() {
        if (!this.mobileMenuBtn || !this.mobileNav) return;

        const onBurgerClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.isNarrowViewport()) return;
            const now = Date.now();
            if (now - this._lastMenuToggleAt < 280) return;
            this._lastMenuToggleAt = now;
            if (this.isNavOpen()) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        };

        this.mobileMenuBtn.addEventListener('click', onBurgerClick);

        this.mobileNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        document.addEventListener('click', this.onDocClick);
        document.addEventListener('keydown', this.onKeydown);
    }

    onDocClick(e) {
        if (!this.header || !this.isNavOpen()) return;
        if (this.header.contains(e.target)) return;
        this.closeMobileMenu();
    }

    onKeydown(e) {
        if (e.key === 'Escape') {
            this.closeMobileMenu();
        }
    }

    isNavOpen() {
        return Boolean(this.header?.classList.contains('site-header--nav-open'));
    }

    openMobileMenu() {
        if (!this.mobileNav || !this.mobileMenuBtn || !this.header) return;
        if (!this.isNarrowViewport()) return;

        this._htmlScrollBehaviorBeforeMenu = document.documentElement.style.scrollBehavior;

        this.header.classList.add('site-header--nav-open');
        this.mobileMenuBtn.classList.add('is-open');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
        this.mobileMenuBtn.setAttribute('aria-label', 'Close navigation menu');
        this.mobileNav.setAttribute('aria-hidden', 'false');

        this.lockBodyScroll();
        this.applyBodyOffset();
    }

    closeMobileMenu() {
        if (!this.mobileNav || !this.mobileMenuBtn || !this.header || !this.isNavOpen()) return;

        const y = Math.max(0, Math.round(this.lockedScrollY || 0));

        this.header.classList.remove('site-header--nav-open');
        this.mobileMenuBtn.classList.remove('is-open');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        this.mobileMenuBtn.setAttribute('aria-label', 'Open navigation menu');
        this.mobileNav.setAttribute('aria-hidden', 'true');

        this.unlockBodyScroll();

        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);

        requestAnimationFrame(() => {
            window.scrollTo(0, y);
            this.applyBodyOffset();
            requestAnimationFrame(() => {
                window.scrollTo(0, y);
                if (this._htmlScrollBehaviorBeforeMenu) {
                    document.documentElement.style.scrollBehavior = this._htmlScrollBehaviorBeforeMenu;
                } else {
                    document.documentElement.style.removeProperty('scroll-behavior');
                }
            });
        });
    }

    lockBodyScroll() {
        if (!this.isNarrowViewport()) return;

        this.lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);

        document.documentElement.style.setProperty('--site-nav-lock-y', `-${this.lockedScrollY}px`);
        document.documentElement.classList.add('site-nav-locked');
        document.body.classList.add('site-nav-scroll-locked');

        if (scrollbar > 0) {
            document.body.style.paddingRight = `${scrollbar}px`;
            this.header.style.paddingRight = `${scrollbar}px`;
        }
    }

    unlockBodyScroll() {
        document.documentElement.classList.remove('site-nav-locked');
        document.body.classList.remove('site-nav-scroll-locked');
        document.documentElement.style.removeProperty('--site-nav-lock-y');
        document.body.style.paddingRight = '';
        if (this.header) {
            this.header.style.paddingRight = '';
        }
    }

    setupActiveLinks() {
        this.updateActiveLinks();
        window.addEventListener('popstate', () => this.updateActiveLinks());
    }

    updateActiveLinks() {
        const currentPath = window.location.pathname;

        if (this.navMenu) {
            this.navMenu.querySelectorAll('.nav-link').forEach((link) => {
                this.setLinkActive(link, currentPath);
            });
        }

        const mobileLinks = this.mobileNav?.querySelectorAll('.mobile-nav-link') || [];
        mobileLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (this.isActivePath(href, currentPath)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setLinkActive(link, currentPath) {
        const href = link.getAttribute('href');
        if (this.isActivePath(href, currentPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    }

    isActivePath(href, currentPath) {
        if (!href) return false;
        try {
            const u = new URL(href%2c%20window.location.origin.html);
            const path = u.pathname || '/';
            if (path === '/' && currentPath === 'index.html') return true;
            if (path !== '/' && currentPath.startsWith(path)) return true;
        } catch {
            return false;
        }
        return false;
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const headerOffset = this.getCurrentHeaderOffset();
                const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 8;
                window.scrollTo({ top: targetTop, behavior: 'smooth' });
                this.closeMobileMenu();
            });
        });

        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (!target) return;
                const headerOffset = this.getCurrentHeaderOffset();
                const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 8;
                window.scrollTo({ top: targetTop, behavior: 'smooth' });
            }, 80);
        }
    }

    getCurrentHeaderOffset() {
        const pad = parseFloat(window.getComputedStyle(document.body).paddingTop);
        if (!Number.isNaN(pad) && pad > 0) return pad;
        return this.header ? this.header.offsetHeight : 0;
    }

    setupScrollShadow() {
        if (!this.header) return;

        const run = () => {
            const y = window.pageYOffset || 0;
            this.header.classList.toggle('site-header--scrolled', y > 12);
            this.scrollTicking = false;
        };

        window.addEventListener(
            'scroll',
            () => {
                if (!this.scrollTicking) {
                    this.scrollTicking = true;
                    requestAnimationFrame(run);
                }
            },
            { passive: true }
        );

        run();
    }

    updateBodyPadding() {
        this.applyBodyOffset();
    }
}

function initHeaderManagerOnce() {
    if (window.__smkHeaderManager) {
        return window.__smkHeaderManager;
    }
    window.__smkHeaderManager = new HeaderManager();
    return window.__smkHeaderManager;
}

function scheduleHeaderInit() {
    initHeaderManagerOnce();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleHeaderInit);
} else {
    scheduleHeaderInit();
}

window.initializeHeader = function () {
    initHeaderManagerOnce();
};
