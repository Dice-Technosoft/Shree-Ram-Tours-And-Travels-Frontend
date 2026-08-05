/**
 * Hides full-page loader after DOM is ready and a short minimum display time.
 */
(function () {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    const MIN_VISIBLE_MS = 100;
    const startedAt = performance.now();

    function hideLoader() {
        const elapsed = performance.now() - startedAt;
        const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

        window.setTimeout(function () {
            loader.classList.add('is-hidden');
            loader.setAttribute('aria-busy', 'false');
            loader.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('page-loader-active');

            function removeFromLayout() {
                loader.style.display = 'none';
                loader.removeEventListener('transitionend', onEnd);
            }

            function onEnd(e) {
                if (e.propertyName === 'opacity') {
                    removeFromLayout();
                }
            }

            loader.addEventListener('transitionend', onEnd);
            window.setTimeout(removeFromLayout, 600);
        }, remaining);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideLoader, { once: true });
    } else {
        hideLoader();
    }
})();
