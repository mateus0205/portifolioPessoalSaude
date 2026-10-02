/* =========================================================
   PORTFÓLIO DE ENFERMAGEM — INTERAÇÕES
   Tema, menu mobile, progresso de rolagem, link ativo,
   acordeão de FAQ, filtro da trajetória e animações.
   ========================================================= */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Tema claro / escuro ---------- */
    function setupTheme() {
        var toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

        function currentTheme() {
            var saved = document.documentElement.getAttribute('data-theme');
            if (saved) return saved;
            return systemDark.matches ? 'dark' : 'light';
        }

        function paint(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            toggle.setAttribute('aria-label',
                theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
        }

        paint(currentTheme());

        toggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            paint(next);
            try { localStorage.setItem('tema', next); } catch (e) {}
        });

        // Acompanha o sistema enquanto o visitante não escolher manualmente
        systemDark.addEventListener('change', function (event) {
            var saved = null;
            try { saved = localStorage.getItem('tema'); } catch (e) {}
            if (!saved) paint(event.matches ? 'dark' : 'light');
        });
    }

    /* ---------- Menu mobile ---------- */
    function setupMenu() {
        var btn = document.getElementById('menu-btn');
        var nav = document.getElementById('site-nav');
        if (!btn || !nav) return;

        var icon = btn.querySelector('i');

        function close() {
            nav.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Abrir menu');
            icon.classList.replace('fa-xmark', 'fa-bars');
        }

        btn.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
            icon.classList.replace(open ? 'fa-bars' : 'fa-xmark', open ? 'fa-xmark' : 'fa-bars');
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', close);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') close();
        });

        document.addEventListener('click', function (event) {
            if (!nav.classList.contains('is-open')) return;
            if (!nav.contains(event.target) && !btn.contains(event.target)) close();
        });
    }

    /* ---------- Rolagem: progresso, header e botão flutuante ---------- */
    function setupScroll() {
        var bar = document.getElementById('scroll-bar');
        var header = document.getElementById('site-header');
        var floatBtn = document.querySelector('.whats');
        var ticking = false;

        function update() {
            var top = window.scrollY;
            var max = document.documentElement.scrollHeight - window.innerHeight;

            if (bar) bar.style.width = (max > 0 ? (top / max) * 100 : 0) + '%';
            if (header) header.classList.toggle('is-stuck', top > 10);
            if (floatBtn) floatBtn.classList.toggle('is-visible', top > 600);

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        }, { passive: true });

        update();
    }

    /* ---------- Destaque do link da seção visível ---------- */
    function setupActiveLink() {
        var links = Array.prototype.slice.call(document.querySelectorAll('.menu-list a'));
        var sections = links
            .map(function (link) { return document.querySelector(link.getAttribute('href')); })
            .filter(Boolean);

        if (!sections.length || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (link) {
                    link.classList.toggle('is-active',
                        link.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (section) { observer.observe(section); });
    }

    /* ---------- FAQ (acordeão acessível) ---------- */
    function setupFaq() {
        var triggers = document.querySelectorAll('.faq-trigger');

        triggers.forEach(function (trigger) {
            var item = trigger.closest('.faq-item');
            var panel = item.querySelector('.faq-panel');

            trigger.addEventListener('click', function () {
                var isOpen = item.classList.contains('is-open');

                // Mantém apenas um item aberto
                triggers.forEach(function (other) {
                    var otherItem = other.closest('.faq-item');
                    otherItem.classList.remove('is-open');
                    otherItem.querySelector('.faq-panel').style.maxHeight = '0px';
                    other.setAttribute('aria-expanded', 'false');
                });

                if (!isOpen) {
                    item.classList.add('is-open');
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // Recalcula a altura do item aberto quando a janela muda de tamanho
        window.addEventListener('resize', function () {
            var open = document.querySelector('.faq-item.is-open .faq-panel');
            if (open) open.style.maxHeight = open.scrollHeight + 'px';
        });
    }

    /* ---------- Filtro da trajetória ---------- */
    function setupFilters() {
        var buttons = document.querySelectorAll('.filter');
        var items = document.querySelectorAll('.tl-item');
        if (!buttons.length || !items.length) return;

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = button.dataset.filter;

                buttons.forEach(function (other) {
                    other.classList.toggle('is-active', other === button);
                });

                items.forEach(function (item) {
                    var show = filter === 'all' || item.dataset.type === filter;
                    item.classList.toggle('is-hidden', !show);
                });
            });
        });
    }

    /* ---------- Animações de entrada ---------- */
    function setupReveal() {
        var targets = document.querySelectorAll(
            '.head, .opening-text, .portrait, .fact, .prose, .record-list, ' +
            '.column, .inventory, .tl-item, .academics li, .faq-item, .contact-inner'
        );

        if (reduceMotion || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function (target, index) {
            target.classList.add('reveal');
            target.style.transitionDelay = (index % 3) * 60 + 'ms';
            observer.observe(target);
        });
    }

    /* ---------- Ano no rodapé ---------- */
    function setupYear() {
        var year = document.getElementById('year');
        if (year) year.textContent = new Date().getFullYear();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupTheme();
        setupMenu();
        setupScroll();
        setupActiveLink();
        setupFaq();
        setupFilters();
        setupReveal();
        setupYear();
    });
})();
