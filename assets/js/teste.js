(function () {
    'use strict';

    const VALID_STATES = new Set(['idle', 'loading', 'active', 'attention', 'critical', 'offline']);
    const VALID_VARIANTS = new Set(['hero', 'standard', 'compact']);

    class ChampionsCoreHUD {
        constructor(element) {
            this.element = element;
            this.visibilityObserver = null;
            this.boundVisibility = this.handleDocumentVisibility.bind(this);
            this.init();
        }

        init() {
            this.setState(this.element.dataset.state || 'active');
            this.setVariant(this.element.dataset.variant || 'hero');
            this.initLogo();
            this.observeVisibility();
            document.addEventListener('visibilitychange', this.boundVisibility);
        }

        initLogo() {
            const image = this.element.querySelector('.hud-brand-image');
            if (!image || !image.getAttribute('src')) return;

            const enable = () => this.element.classList.add('has-logo');
            const disable = () => this.element.classList.remove('has-logo');

            if (image.complete && image.naturalWidth > 0) enable();
            image.addEventListener('load', enable, { once: true });
            image.addEventListener('error', disable, { once: true });
        }

        setState(state) {
            const normalized = VALID_STATES.has(state) ? state : 'idle';
            this.element.dataset.state = normalized;
            this.element.dispatchEvent(new CustomEvent('champions:hud-state', {
                detail: { state: normalized }
            }));
        }

        setVariant(variant) {
            this.element.dataset.variant = VALID_VARIANTS.has(variant) ? variant : 'standard';
        }

        pause() {
            this.element.classList.add('is-paused');
        }

        resume() {
            if (!document.hidden) this.element.classList.remove('is-paused');
        }

        observeVisibility() {
            if (!('IntersectionObserver' in window)) return;
            this.visibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => entry.isIntersecting ? this.resume() : this.pause());
            }, { threshold: 0.04 });
            this.visibilityObserver.observe(this.element);
        }

        handleDocumentVisibility() {
            document.hidden ? this.pause() : this.resume();
        }

        destroy() {
            if (this.visibilityObserver) this.visibilityObserver.disconnect();
            document.removeEventListener('visibilitychange', this.boundVisibility);
        }
    }

    function boot() {
        document.querySelectorAll('[data-champions-core-hud]').forEach((element) => {
            if (!element.championsCoreHUD) element.championsCoreHUD = new ChampionsCoreHUD(element);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();

    window.ChampionsCoreHUD = ChampionsCoreHUD;
})();
