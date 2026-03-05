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

    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : null);
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
        const words = [
            'AI Engineer',
            'Backend Developer',
            'LLM & Agent Builder',
            'ML Pipeline Engineer'
        ];
        textRotate.textContent = '';

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let speed = 120;

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

            setTimeout(type, speed);
        }

        setTimeout(type, 800);
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
        rootMargin: '0px 0px -60px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe section elements for reveal animation
    document.querySelectorAll('.section-header, .about-content, .timeline-item, .skill-group, .project-card, .contact-content, .education-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Initial calls
    setActiveNavLink();
});
