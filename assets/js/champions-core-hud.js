(function () {
    'use strict';

    const VALID_STATES = new Set([
        'idle',
        'loading',
        'active',
        'attention',
        'critical',
        'offline'
    ]);

    const VALID_VARIANTS = new Set([
        'hero',
        'standard',
        'compact'
    ]);

    class ChampionsCoreHUD {
        constructor(element) {
            this.element = element;
            this.boundVisibility = this.handleDocumentVisibility.bind(this);

            this.init();
        }

        init() {
            this.setState(
                this.element.dataset.state || 'active'
            );

            this.setVariant(
                this.element.dataset.variant || 'hero'
            );

            this.initLogo();

            document.addEventListener(
                'visibilitychange',
                this.boundVisibility
            );

            this.handleDocumentVisibility();
        }

        initLogo() {
            const image = this.element.querySelector(
                '.hud-brand-image'
            );

            if (!image) return;

            const source = image.getAttribute('src');

            if (!source) return;

            const enableLogo = () => {
                this.element.classList.add('has-logo');
            };

            const disableLogo = () => {
                this.element.classList.remove('has-logo');
            };

            if (
                image.complete &&
                image.naturalWidth > 0
            ) {
                enableLogo();
            }

            image.addEventListener(
                'load',
                enableLogo
            );

            image.addEventListener(
                'error',
                disableLogo
            );
        }

        setState(state) {
            const normalizedState =
                VALID_STATES.has(state)
                    ? state
                    : 'idle';

            this.element.dataset.state =
                normalizedState;

            this.element.dispatchEvent(
                new CustomEvent(
                    'champions:hud-state',
                    {
                        detail: {
                            state: normalizedState
                        }
                    }
                )
            );
        }

        getState() {
            return this.element.dataset.state;
        }

        setVariant(variant) {
            const normalizedVariant =
                VALID_VARIANTS.has(variant)
                    ? variant
                    : 'standard';

            this.element.dataset.variant =
                normalizedVariant;
        }

        getVariant() {
            return this.element.dataset.variant;
        }

        pause() {
            this.element.classList.add(
                'is-paused'
            );
        }

        resume() {
            this.element.classList.remove(
                'is-paused'
            );
        }

        handleDocumentVisibility() {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        }

        destroy() {
            document.removeEventListener(
                'visibilitychange',
                this.boundVisibility
            );

            delete this.element.championsCoreHUD;
        }
    }

    function bootChampionsCoreHUD() {
        const elements =
            document.querySelectorAll(
                '[data-champions-core-hud]'
            );

        elements.forEach((element) => {
            if (
                element.championsCoreHUD
            ) {
                return;
            }

            element.championsCoreHUD =
                new ChampionsCoreHUD(
                    element
                );
        });
    }

    if (
        document.readyState === 'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            bootChampionsCoreHUD,
            {
                once: true
            }
        );
    } else {
        bootChampionsCoreHUD();
    }

    window.ChampionsCoreHUD =
        ChampionsCoreHUD;

    window.bootChampionsCoreHUD =
        bootChampionsCoreHUD;
})();