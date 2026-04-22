document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Caching ---
    const sections = document.querySelectorAll('.full-section');
    const pageDots = document.querySelectorAll('.page-dot');
    const navLinks = document.querySelectorAll('.nav-links a');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const navbar = document.getElementById('navbar');
    const aboutSectionContainer = document.querySelector('#about .about-section-container');
    const homeSection = document.querySelector('#home');
    let currentSectionIdx = 0;
    let aboutAnimationTriggered = false;

    // --- Debounce Utility ---
    function debounce(fn, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // --- Section Intersection Observer (page transitions & dots) ---
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(sections).indexOf(entry.target);
                entry.target.classList.add('visible');
                pageDots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
                currentSectionIdx = index;
            }
        });
    }, { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' });
    sections.forEach(section => sectionObserver.observe(section));

    // --- Page Dot Navigation ---
    pageDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const targetSection = dot.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: targetSection === 'journey' ? 'start' : 'center'
                });
                currentSectionIdx = index;
                pageDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            }
        });
    });

    // --- Typewriter Effect ---
    const typewriterTextElement = document.getElementById('typewriter-text');
    const text = "Hi, I'm Thu (or \"two\"✌️)";
    let i = 0, isDeleting = false;
    function typewriterLoop() {
        typewriterTextElement.textContent = text.substring(0, i);
        let typeSpeed = isDeleting ? 75 : 150;
        if (!isDeleting && i === text.length) {
            typeSpeed = 2500; isDeleting = true;
        } else if (isDeleting && i === 0) {
            isDeleting = false; typeSpeed = 500;
        }
        i += isDeleting ? -1 : 1;
        setTimeout(typewriterLoop, typeSpeed);
    }
    setTimeout(typewriterLoop, 1000);

    // --- Timeline Filtering ---
    setTimeout(function () {
        const filterButtons = document.querySelectorAll('.filter-button');
        const yearButtons = document.querySelectorAll('.year-button');
        const timelineItems = document.querySelectorAll('.timeline-item');

        function applyFilter(type, value) {
            timelineItems.forEach(item => {
                let show = false;
                if (type === 'all') show = true;
                else if (type === 'category') show = (value === 'all') || (item.getAttribute('data-category') === value);
                else if (type === 'year') show = (value === 'all') || (item.getAttribute('data-year') === value);
                item.style.display = show ? '' : 'none';
            });

            // Hide year groups where all items are filtered out
            document.querySelectorAll('.timeline-year-group').forEach(group => {
                const hasVisible = Array.from(group.querySelectorAll('.timeline-item'))
                    .some(item => item.style.display !== 'none');
                group.style.display = hasVisible ? 'grid' : 'none';
            });
        }

        filterButtons.forEach(btn => btn.addEventListener('click', function (e) {
            e.preventDefault();
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const val = this.getAttribute('data-filter');
            applyFilter(val === 'all' ? 'all' : 'category', val);
        }));

        yearButtons.forEach(btn => btn.addEventListener('click', function (e) {
            e.preventDefault();
            yearButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyFilter('year', this.getAttribute('data-year'));

            // Scroll to journey section when year button is clicked
            const journeySection = document.getElementById('journey');
            if (journeySection) {
                journeySection.scrollIntoView({
                    behavior: 'instant',
                    block: 'end'
                });
            }
        }));

        applyFilter('all', 'all');
    }, 500);

    // --- Intersection Observer for Section Animations ---
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                // Enhanced mobile detection for different iPhone models
                const isMobile = window.innerWidth <= 768;
                const isSmallScreen = window.innerWidth <= 375; // iPhone SE territory

                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                if (entry.target.id == 'journey' && (isMobile || isSmallScreen)) {
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    }, 100);
                }
            }
        });
    }, {
        threshold: window.innerWidth <= 768 ? 0.05 : 0.1,
        rootMargin: window.innerWidth <= 768 ? '0px 0px -20px 0px' : '0px 0px -50px 0px'
    });

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        animObserver.observe(section);
    });

    // --- Flying Cards Animation (one-time trigger) ---
    function triggerAboutAnimation(container) {
        if (aboutAnimationTriggered) return;
        aboutAnimationTriggered = true;

        const sectionTitle = document.querySelector('#about .section-title');
        const textParagraph = container.querySelector('.text-paragraph-flying');
        const skillCards = container.querySelectorAll('.skill-card-flying');

        if (sectionTitle) sectionTitle.classList.add('reveal');

        if (textParagraph) {
            setTimeout(() => textParagraph.classList.add('fly-in'), 150);
        }

        skillCards.forEach((card, idx) => {
            setTimeout(() => card.classList.add('fly-in'), 350 + (idx * 120));
        });
    }

    if (aboutSectionContainer) {
        const flyingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !aboutAnimationTriggered) {
                    triggerAboutAnimation(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px 0px 0px'
        });

        flyingObserver.observe(aboutSectionContainer);

        // Force trigger on iPhone SE if the observer doesn't fire
        if (window.innerWidth === 375 && window.innerHeight === 667) {
            setTimeout(() => {
                if (!aboutAnimationTriggered) triggerAboutAnimation(aboutSectionContainer);
            }, 1000);
        }
    }

    // --- Navigation Highlighting (Click & Scroll) ---
    document.querySelector('.nav-links').addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;
        if (link.classList.contains('nav-contact-btn') || link.classList.contains('nav-resume-btn') || link.getAttribute('target') === '_blank') return;
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Combined Scroll Handler (debounced) ---
    window.addEventListener('scroll', debounce(() => {
        // Scroll indicator
        const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        scrollIndicator.style.width = scrolled + '%';

        // Navbar scroll effect
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Use the same logic as the section observer for consistency
        const sections = document.querySelectorAll('.full-section');
        let currentSection = '';

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const isIntersecting = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;

            if (isIntersecting) {
                // Map section index to section name
                const sectionNames = ['home', 'about', 'journey', 'projects'];
                currentSection = `#${sectionNames[index]}`;
            }
        });

        if (currentSection) {
            // Highlight navigation links
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-links a[href="${currentSection}"]`);

            if (activeLink) activeLink.classList.add('active');

            // Highlight page dots
            pageDots.forEach(dot => dot.classList.remove('active'));
            const activeDot = document.querySelector(`.page-dot[data-section="${currentSection.replace('#', '')}"]`);
            if (activeDot) activeDot.classList.add('active');
        }
    }, 20));

    // --- Hero Section Animation (immediate) ---
    if (homeSection) {
        homeSection.style.opacity = '1';
        homeSection.style.transform = 'translateY(0)';
    }


    // --- Hamburger Menu for Mobile ---
    const navToggle = document.querySelector('.nav-toggle');
    const navLinksList = document.querySelector('.nav-links');

    if (navToggle && navLinksList) {
        navToggle.addEventListener('click', () => {
            navLinksList.classList.toggle('open');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksList.classList.remove('open');
            });
        });
    }

    // --- Timeline Item Click Handlers ---
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', function () {
            // Remove active class from all timeline items
            document.querySelectorAll('.timeline-item').forEach(ti => {
                ti.classList.remove('active');
            });
            // Add active class to clicked item
            this.classList.add('active');
        });
    });

    // --- Spotlight follow on stat cards ---
    document.querySelectorAll('.about-stat-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
        });
    });

    // --- Resize Handler ---
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.nav-links').forEach(nav => {
                nav.classList.remove('open');
            });
        }
    }, 250));
});