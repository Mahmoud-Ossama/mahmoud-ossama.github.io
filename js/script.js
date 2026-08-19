document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // EmailJS initialization
    emailjs.init("TDvO0361pl2j9X9bX");

    // ===== Language Switching =====
    let currentLanguage = localStorage.getItem('language') || 'en';
    const langBtn = document.getElementById('langBtn');
    const html = document.documentElement;

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        html.setAttribute('lang', lang);
        html.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
        html.classList.toggle('rtl', lang === 'ar');

        // Update button
        langBtn.textContent = lang === 'en' ? 'العربية' : 'English';

        // Update all elements with data attributes
        updatePageText();
    }

    function updatePageText() {
        const elements = document.querySelectorAll('[data-key]');
        elements.forEach(el => {
            const key = el.getAttribute('data-key');
            if (translations[currentLanguage] && translations[currentLanguage][key]) {
                el.textContent = translations[currentLanguage][key];
            }
        });

        // Update form placeholders
        const formInputs = document.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            const placeholder = input.getAttribute('data-placeholder');
            if (placeholder && translations[currentLanguage][placeholder]) {
                input.placeholder = translations[currentLanguage][placeholder];
            }
        });
    }

    langBtn.addEventListener('click', () => {
        setLanguage(currentLanguage === 'en' ? 'ar' : 'en');
    });

    // Initialize language
    setLanguage(currentLanguage);

    // ===== Navigation =====
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.querySelector('.nav-toggle');
    const navItems = document.querySelectorAll('.nav-links a');

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when link clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveNavLink();
    });

    // Update active nav link based on scroll position
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 150;
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    // ===== Contact Form =====
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const templateParams = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                to_email: 'vip.m.osama@gmail.com'
            };

            emailjs.send('service_b559ynh', 'template_4heoeht', templateParams)
                .then(() => {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;

                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.className = 'form-status';
                    }, 5000);
                })
                .catch((error) => {
                    console.error('Email error:', error);
                    formStatus.className = 'form-status error';
                    formStatus.textContent = 'Error sending message. Please email directly: vip.m.osama@gmail.com';
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
        });
    }

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                const offsetTop = target.offsetTop - 80;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== Scroll Animations =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.service-card, .system-card, .stat').forEach(el => {
        observer.observe(el);
    });

    // ===== Initial Active Link =====
    updateActiveNavLink();
});
