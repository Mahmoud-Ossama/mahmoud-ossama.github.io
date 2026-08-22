document.addEventListener('DOMContentLoaded', () => {
    // biome-ignore lint/suspicious/noRedundantUseStrict: <explanation>
    'use strict';

    // Initialize EmailJS
    (() => {
        // Replace with your EmailJS public key
        emailjs.init("TDvO0361pl2j9X9bX");
    })();

    // Dark mode toggle
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const body = document.body;
    
    // Check if user previously enabled dark mode
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        // Save user preference to localStorage
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', null);
        }
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.querySelector('.scroll-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            scrollTopBtn.classList.add('active');
        } else {
            navbar.classList.remove('scrolled');
            scrollTopBtn.classList.remove('active');
        }
    });

    // Update text rotation in hero section
    const textRotate = document.querySelector('.text-rotate');
    if (textRotate) {
        const words = [
            'AI Agents', 
            'Intelligent Systems', 
            'LLM Applications',
            'ML Models'
        ];
        textRotate.textContent = ''; // Clear the text
        
        let currentWordIndex = 0;
        let currentLetterIndex = 0;
        let isDeleting = false;
        let typingSpeed = 150;

        function type() {
            const currentWord = words[currentWordIndex];
            
            if (isDeleting) {
                textRotate.textContent = currentWord.substring(0, currentLetterIndex - 1);
                currentLetterIndex--;
                typingSpeed = 100;
            } else {
                textRotate.textContent = currentWord.substring(0, currentLetterIndex + 1);
                currentLetterIndex++;
                typingSpeed = 150;
            }

            if (!isDeleting && currentLetterIndex === currentWord.length) {
                isDeleting = true;
                typingSpeed = 1000; // Pause at end of word
            } else if (isDeleting && currentLetterIndex === 0) {
                isDeleting = false;
                currentWordIndex = (currentWordIndex + 1) % words.length;
                typingSpeed = 500; // Pause before starting new word
            }

            setTimeout(type, typingSpeed);
        }

        // Start the typing animation
        setTimeout(type, 1000);
    }

    // Skill tabs
    const skillTabs = document.querySelectorAll('.skill-tab');
    const skillContents = document.querySelectorAll('.skill-content');

    // biome-ignore lint/complexity/noForEach: <explanation>
    skillTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            // biome-ignore lint/complexity/noForEach: <explanation>
                        skillTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all contents
            // biome-ignore lint/complexity/noForEach: <explanation>
                                    skillContents.forEach(content => content.classList.remove('active'));
            
            // Show the selected content
            const targetContent = document.getElementById(tab.getAttribute('data-target'));
            targetContent.classList.add('active');
        });
    });

    // Project filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    // biome-ignore lint/complexity/noForEach: <explanation>
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            // biome-ignore lint/complexity/noForEach: <explanation>
                        filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            // biome-ignore lint/complexity/noForEach: <explanation>
                        projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Mobile menu toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    let menuOpen = false;

    menuBtn.addEventListener('click', () => {
        if (!menuOpen) {
            menuBtn.classList.add('open');
            navLinks.classList.add('active');
            menuOpen = true;
        } else {
            menuBtn.classList.remove('open');
            navLinks.classList.remove('active');
            menuOpen = false;
        }
    });

    // Close menu when clicking on a nav link (mobile)
    const navItems = document.querySelectorAll('.nav-links li a');
    // biome-ignore lint/complexity/noForEach: <explanation>
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('open');
            menuOpen = false;
        });
    });

    // Active navigation link based on scroll
    const sections = document.querySelectorAll('section');
    
    function setActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        
        // biome-ignore lint/complexity/noForEach: <explanation>
                sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // biome-ignore lint/complexity/noForEach: <explanation>
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });

        // Check for hero section (home)
        if (scrollPosition < sections[0].offsetTop) {
            // biome-ignore lint/complexity/noForEach: <explanation>
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === '#home') {
                    item.classList.add('active');
                }
            });
        }
    }

    window.addEventListener('scroll', setActiveNavLink);

    // Scroll to top button
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Enhanced form submission with EmailJS
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Change button text to loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Collect form data
            const templateParams = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                to_email: 'vip.m.osama@gmail.com'
            };
            
            // Send the email using EmailJS
            emailjs.send('service_b559ynh', 'template_4heoeht', templateParams)
                .then(() => {
                    // Show success message
                    formStatus.innerHTML = '<div class="alert alert-success">Thank you! Your message has been sent.</div>';
                    contactForm.reset();
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    // Clear success message after 5 seconds
                    setTimeout(() => {
                        formStatus.innerHTML = '';
                    }, 5000);
                })
                .catch((error) => {
                    // Show error message
                    console.error('Email error:', error);
                    formStatus.innerHTML = '<div class="alert alert-error">Sorry, there was a problem sending your message. Please try again or email me directly.</div>';
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Add animations when elements are in view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        // biome-ignore lint/complexity/noForEach: <explanation>
                elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    
    // Education toggle functionality
    const toggleBtn = document.querySelector('.toggle-btn');
    const educationDetails = document.querySelector('.education-details');

    toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('active');
        educationDetails.classList.toggle('active');
    });

    // Initial call to set proper states
    setActiveNavLink();
    animateOnScroll();
});
