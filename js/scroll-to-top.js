/**
 * Global scroll-to-top control — hidden while body.page-loader-active (full-page loader).
 */
(function () {
    const BTN_ID = 'scroll-to-top-btn';
    const SCROLL_THRESHOLD = 300;

    function loaderActive() {
        return document.body.classList.contains('page-loader-active');
    }

    function createButton() {
        var existing = document.getElementById(BTN_ID);
        if (existing) {
            existing.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            return existing;
        }

        // Find or create floating container
        var container = document.querySelector('.fixed-floating-actions');
        if (!container) {
            container = document.createElement('div');
            container.className = 'fixed-floating-actions';
            document.body.appendChild(container);
        }

        var btn = document.createElement('button');
        btn.id = BTN_ID;
        btn.type = 'button';
        btn.className = 'floating-btn floating-btn--scroll-top scroll-to-top-btn';
        btn.setAttribute('aria-label', 'Scroll to top');
        btn.innerHTML =
            '<span class="floating-btn__tooltip">Scroll to Top</span>' +
            '<div class="floating-btn__icon">' +
            '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>' +
            '</svg>' +
            '</div>';

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        container.appendChild(btn);
        return btn;
    }

    function sync(btn) {
        if (!btn) return;
        if (loaderActive()) {
            btn.classList.remove('scroll-to-top-btn--visible');
            return;
        }
        if (window.pageYOffset > SCROLL_THRESHOLD) {
            btn.classList.add('scroll-to-top-btn--visible');
        } else {
            btn.classList.remove('scroll-to-top-btn--visible');
        }
    }

    function init() {
        var btn = createButton();
        sync(btn);

        window.addEventListener(
            'scroll',
            function () {
                sync(btn);
            },
            { passive: true }
        );

        if (typeof MutationObserver !== 'undefined') {
            var obs = new MutationObserver(function () {
                sync(btn);
            });
            obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
