document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Initialize EmailJS
    (() => {
        emailjs.init("TDvO0361pl2j9X9bX");
    })();

    // ========================
    // Dark Mode
    // ========================
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const body = document.body;

    if (localStorage.getItem('darkMode') === 'disabled') {
        body.classList.remove('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    });

    // ========================
    // Navbar Scroll Effect
    // ========================
    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.querySelector('.scroll-top');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 50;
        navbar.classList.toggle('scrolled', scrolled);
        scrollTopBtn.classList.toggle('active', scrolled);
    });

    // ========================
    // Typing Animation
    // ========================
    const textRotate = document.querySelector('.text-rotate');
    if (textRotate) {
        let words = [
            'Building AI that cuts costs & replaces busywork',
            'Shipping ML pipelines from idea to production',
            'Automating workflows with LLMs & agents',
            'Turning security risks into solved problems'
        ];
        textRotate.textContent = '';

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let speed = 120;
        let typeTimeout = null;

        function type() {
            const current = words[wordIndex];

            if (isDeleting) {
                textRotate.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                speed = 60;
            } else {
                textRotate.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                speed = 120;
            }

            if (!isDeleting && charIndex === current.length) {
                isDeleting = true;
                speed = 2000; // pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                speed = 400; // pause before next word
            }

            typeTimeout = setTimeout(type, speed);
        }

        typeTimeout = setTimeout(type, 800);

        // Expose for i18n to update words
        window._updateTypingWords = function(newWords) {
            words = newWords;
            wordIndex = 0;
            charIndex = 0;
            isDeleting = false;
            textRotate.textContent = '';
            if (typeTimeout) clearTimeout(typeTimeout);
            typeTimeout = setTimeout(type, 400);
        };
    }

    // ========================
    // Mobile Menu
    // ========================
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    let menuOpen = false;

    menuBtn.addEventListener('click', () => {
        menuOpen = !menuOpen;
        menuBtn.classList.toggle('open', menuOpen);
        navLinks.classList.toggle('active', menuOpen);
    });

    // Close menu on nav link click
    document.querySelectorAll('.nav-links li a').forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('open');
            menuOpen = false;
        });
    });

    // ========================
    // Active Nav Link on Scroll
    // ========================
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links li a');

    function setActiveNavLink() {
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });
            }
        });

        // Hero section (home)
        if (sections.length && scrollPos < sections[0].offsetTop) {
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === '#home') {
                    item.classList.add('active');
                }
            });
        }
    }

    window.addEventListener('scroll', setActiveNavLink);

    // ========================
    // Scroll to Top
    // ========================
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========================
    // Education Toggle
    // ========================
    const toggleBtn = document.querySelector('.toggle-btn');
    const educationDetails = document.querySelector('.education-details');

    if (toggleBtn && educationDetails) {
        toggleBtn.addEventListener('click', () => {
            toggleBtn.classList.toggle('active');
            educationDetails.classList.toggle('active');
        });
    }

    // ========================
    // Contact Form (EmailJS)
    // ========================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            const templateParams = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                to_email: 'mahmoud@osama.engineer'
            };

            emailjs.send('service_b559ynh', 'template_4heoeht', templateParams)
                .then(() => {
                    formStatus.innerHTML = '<div class="alert alert-success">Message sent successfully. I will get back to you soon.</div>';
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    setTimeout(() => { formStatus.innerHTML = ''; }, 5000);
                })
                .catch((error) => {
                    console.error('Email error:', error);
                    formStatus.innerHTML = '<div class="alert alert-error">Something went wrong. Please try emailing me directly at mahmoud@osama.engineer</div>';
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // ========================
    // Scroll Reveal Animation
    // ========================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                
                // Add staggered delay if data-delay exists
                const delay = el.getAttribute('data-delay');
                if (delay) {
                    el.style.transitionDelay = `${delay}s`;
                }

                el.classList.add('visible');
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    // Initialize observer for all .scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });

    // ========================
    // Slider Drag-to-Scroll & Navigation
    // ========================
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;
        const wrapper = slider.closest('.slider-wrapper');
        const prevBtn = wrapper.querySelector('.prev-btn');
        const nextBtn = wrapper.querySelector('.next-btn');

        // Mouse Drag to Scroll
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            // Disable scroll snap while dragging for smoother feeling
            slider.style.scrollSnapType = 'none';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
            slider.style.scrollSnapType = 'x mandatory';
        });
        
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
            slider.style.scrollSnapType = 'x mandatory';
        });
        
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed
            slider.scrollLeft = scrollLeft - walk;
        });

        // Set initial cursor
        slider.style.cursor = 'grab';

        // Button clicks
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const cardWidth = slider.querySelector('div').offsetWidth + 24; // Card width + gap
                slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const cardWidth = slider.querySelector('div').offsetWidth + 24;
                slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
            });
        }
    });

    // Initial calls
    setActiveNavLink();
    if (typeof initI18n === 'function') initI18n();
});
