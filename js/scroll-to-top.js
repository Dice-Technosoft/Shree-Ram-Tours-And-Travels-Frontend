/**
 * Global scroll-to-top control — hidden while body.page-loader-active (full-page loader).
 */
(function () {
    const BTN_ID = 'scroll-to-top-btn';
    const SCROLL_THRESHOLD = 400;

    function loaderActive() {
        return document.body.classList.contains('page-loader-active');
    }

    function createButton() {
        var existing = document.getElementById(BTN_ID);
        if (existing) return existing;

        var btn = document.createElement('button');
        btn.id = BTN_ID;
        btn.type = 'button';
        btn.className = 'scroll-to-top-btn';
        btn.setAttribute('aria-label', 'Scroll to top');
        btn.innerHTML =
            '<svg class="scroll-to-top-btn__icon" width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
            '<path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/>' +
            '</svg>';

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(btn);
        return btn;
    }

    function sync(btn) {
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
