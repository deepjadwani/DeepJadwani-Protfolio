// site.js — animations + navbar active link (static-site safe)
(() => {
    'use strict';

    const getSiteConfig = () => window.__SITE_CONFIG__ || {};

    const applyConfiguredLinks = () => {
        const config = getSiteConfig();

        document.querySelectorAll('[data-config-href]').forEach(el => {
            const key = el.getAttribute('data-config-href');
            const href = config[key];

            if (!href) {
                return;
            }

            el.setAttribute('href', href);

            if (el.getAttribute('target') === '_blank') {
                el.setAttribute('rel', 'noopener noreferrer');
            }
        });
    };

    const applyCanonicalUrl = () => {
        const config = getSiteConfig();
        const canonicalEl = document.querySelector('link[rel="canonical"][data-page-path]');
        const pagePath = canonicalEl?.getAttribute('data-page-path');

        if (!canonicalEl || !config.siteUrl || !pagePath) {
            return;
        }

        canonicalEl.setAttribute('href', `${config.siteUrl}${pagePath}`);
    };

    /* ===================== FADE-IN-UP ANIMATION ===================== */

    const ioOptions = { root: null, rootMargin: '0px', threshold: 0.12 };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up--shown');
                obs.unobserve(entry.target);
            }
        });
    }, ioOptions);

    const initAnimations = () => {
        document.querySelectorAll('.fade-in-up').forEach((el, index) => {
            el.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
            el.style.opacity = 0;
            el.style.transform = 'translateY(12px)';
            observer.observe(el);
        });

        // Reveal already visible items
        document.querySelectorAll('.fade-in-up').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
                el.classList.add('fade-in-up--shown');
            }
        });
    };

    /* ===================== NAVBAR ACTIVE LINK ===================== */

    const setActiveNavLink = () => {
        const path = location.pathname.split('/').pop().toLowerCase() || 'index.html';

        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href')?.toLowerCase();
            if (href === path) {
                link.classList.add('active');
            }
        });
    };

    const initHeroMotion = () => {
        const hero = document.querySelector('.home-hero');
        const visual = document.querySelector('.hero-visual');

        if (!hero || !visual || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        hero.addEventListener('pointermove', event => {
            const rect = hero.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;

            visual.style.setProperty('--hero-move-x', `${x}px`);
            visual.style.setProperty('--hero-move-y', `${y}px`);
        });

        hero.addEventListener('pointerleave', () => {
            visual.style.setProperty('--hero-move-x', '0px');
            visual.style.setProperty('--hero-move-y', '0px');
        });
    };

    /* ===================== INIT AFTER PARTIALS LOAD ===================== */

    document.addEventListener('DOMContentLoaded', () => {
        applyConfiguredLinks();
        applyCanonicalUrl();
        initAnimations();
        initHeroMotion();

        // Navbar is loaded via include.js → wait a bit
        const navCheck = setInterval(() => {
            if (document.querySelector('.nav-link')) {
                setActiveNavLink();
                clearInterval(navCheck);
            }
        }, 50);
    });

    document.addEventListener('partial:loaded', () => {
        applyConfiguredLinks();
    });

    /* ===================== CSS HOOK ===================== */

    const style = document.createElement('style');
    style.innerHTML = `
        .fade-in-up--shown {
            opacity: 1 !important;
            transform: translateY(0) !important;
            transition: opacity .6s var(--ease),
                        transform .6s var(--ease);
            transition-delay: var(--reveal-delay, 0ms);
        }
    `;
    document.head.appendChild(style);

})();
