/* ================================================================
   V4 — THE SECURITY VAULT: UI Interactions
   Features:
   - Custom cursor with magnetic hover effects
   - Scroll reveal animations with IntersectionObserver
   - 3D card tilt on mouse move (perspective transform)
   - Card glow follow (radial gradient tracks mouse)
   - Header scroll detection
   - Live footer clock
   - Smooth scroll anchor links
   ================================================================ */

(function () {
    'use strict';

    // ==================== CUSTOM CURSOR ====================
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (cursor && follower) {
        let cx = 0, cy = 0;
        let fx = 0, fy = 0;
        let targetCx = 0, targetCy = 0;

        document.addEventListener('mousemove', (e) => {
            targetCx = e.clientX;
            targetCy = e.clientY;
        });

        function animateCursor() {
            // Cursor follows instantly
            cx += (targetCx - cx) * 0.2;
            cy += (targetCy - cy) * 0.2;
            cursor.style.left = cx + 'px';
            cursor.style.top = cy + 'px';

            // Follower trails behind
            fx += (targetCx - fx) * 0.08;
            fy += (targetCy - fy) * 0.08;
            follower.style.left = fx + 'px';
            follower.style.top = fy + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover detection for interactive elements
        const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], .project-card, .contact-card, .tag, .cert-item, .nav-link');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                follower.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
                follower.classList.remove('hovering');
            });
        });
    }

    // ==================== MAGNETIC HOVER EFFECT ====================
    const magneticEls = document.querySelectorAll('[data-magnetic]');
    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { el.style.transition = ''; }, 500);
        });
    });

    // ==================== 3D CARD TILT ====================
    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const tiltX = (y - 0.5) * -8;  // degrees
            const tiltY = (x - 0.5) * 8;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;

            // Move glow to follow mouse
            const glow = card.querySelector('.card-glow');
            if (glow) {
                card.style.setProperty('--mouse-x', (x * 100) + '%');
                card.style.setProperty('--mouse-y', (y * 100) + '%');
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.5s';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });
    });

    // ==================== SCROLL REVEAL ANIMATIONS ====================
    const revealEls = document.querySelectorAll('[data-reveal]');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseFloat(entry.target.dataset.delay || 0);
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay * 1000);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));

    // ==================== SMOOTH SCROLL ANCHORS ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ==================== LIVE FOOTER CLOCK ====================
    const footerTime = document.getElementById('footer-time');
    if (footerTime) {
        function updateTime() {
            const now = new Date();
            footerTime.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata'
            }) + ' IST';
        }
        updateTime();
        setInterval(updateTime, 1000);
    }

    // ==================== STAGGER PROJECT CARDS REVEAL ====================
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.15}s`;
    });

    // ==================== TAG HOVER GLOW RIPPLE ====================
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            tag.style.transform = 'scale(1.08)';
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'scale(1)';
        });
    });

})();
