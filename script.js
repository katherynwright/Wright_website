// Dynamic Portfolio Website JavaScript

// Splash Screen Variables
let telephoneAudio;
let soundEnabled = true;

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navList = document.querySelector('.nav-list');

// Splash Screen Functions
function initializeSplashScreen() {
    // Get audio element
    telephoneAudio = document.getElementById('telephone-ring');
    
    // Create a better telephone ring sound using Web Audio API
    createTelephoneRingSound();
    
    // Start playing the ring sound
    if (soundEnabled && telephoneAudio) {
        telephoneAudio.play().catch(e => {
            console.log('Audio autoplay prevented:', e);
            // Fallback: play sound on first user interaction
            document.addEventListener('click', playRingSound, { once: true });
        });
    }
    
    // Auto-enter after 10 seconds if user doesn't interact
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash && splash.classList.contains('active')) {
            enterSite();
        }
    }, 10000);
}

function createTelephoneRingSound() {
    // Create a more realistic telephone ring using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Set frequencies for classic telephone ring
        oscillator1.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator2.frequency.setValueAtTime(480, audioContext.currentTime); // A4#
        
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        // Connect oscillators to gain and then to destination
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set volume
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        // Create ring pattern (ring for 1s, pause for 3s, repeat)
        let isRinging = false;
        
        function createRingPattern() {
            if (!soundEnabled) return;
            
            if (!isRinging) {
                oscillator1.start();
                oscillator2.start();
                isRinging = true;
                
                // Stop after 1 second
                setTimeout(() => {
                    if (isRinging) {
                        oscillator1.stop();
                        oscillator2.stop();
                        isRinging = false;
                        
                        // Start next ring after 3 seconds
                        setTimeout(createRingPattern, 3000);
                    }
                }, 1000);
            }
        }
        
        // Start the ring pattern
        setTimeout(createRingPattern, 500);
        
    } catch (error) {
        console.log('Web Audio API not supported, using fallback audio');
    }
}

function playRingSound() {
    if (soundEnabled && telephoneAudio) {
        telephoneAudio.play().catch(e => console.log('Could not play audio:', e));
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('sound-toggle');
    const icon = soundBtn.querySelector('i');
    
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        soundBtn.classList.remove('muted');
        playRingSound();
    } else {
        icon.className = 'fas fa-volume-mute';
        soundBtn.classList.add('muted');
        if (telephoneAudio) {
            telephoneAudio.pause();
        }
    }
}

function enterSite() {
    const splashScreen = document.getElementById('splash-screen');
    const mainPortfolio = document.getElementById('main-portfolio');
    
    // Stop the telephone ring
    if (telephoneAudio) {
        telephoneAudio.pause();
        telephoneAudio.currentTime = 0;
    }
    
    // Add fade out animation to splash screen
    splashScreen.classList.remove('active');
    splashScreen.classList.add('hidden');
    
    // Show main portfolio after animation
    setTimeout(() => {
        mainPortfolio.classList.add('visible');
        splashScreen.style.display = 'none';
        
        // Initialize the main portfolio
        initializeMainPortfolio();
    }, 1000);
}

function initializeMainPortfolio() {
    // Show default tab (home)
    showTab('home');
    
    // Add event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                toggleMobileMenu();
            }
        });
    });
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.tab) {
            showTab(e.state.tab);
        }
    });
    
    // Initialize scroll-based navigation highlighting
    initializeScrollSpy();
    
    // Add smooth scrolling for internal links
    initializeSmoothScrolling();
    
    // Initialize animations on scroll
    initializeScrollAnimations();
}

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    // Check if splash screen should be shown (first visit)
    const hasVisited = sessionStorage.getItem('hasVisitedSplash');
    
    if (!hasVisited) {
        // First visit - show splash screen
        initializeSplashScreen();
        sessionStorage.setItem('hasVisitedSplash', 'true');
    } else {
        // Already visited - skip splash screen
        enterSite();
    }
});

// Main function to show/hide tabs
function showTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show the selected tab
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        
        // Add active class to corresponding nav link
        const activeNavLink = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
        
        // Update URL without page reload
        updateURL(tabId);
        
        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Track page view (for analytics if needed)
        trackPageView(tabId);
    }
}

// Update URL for better navigation
function updateURL(tabId) {
    const newURL = `${window.location.origin}${window.location.pathname}#${tabId}`;
    history.pushState({ tab: tabId }, '', newURL);
}

// Toggle mobile menu
function toggleMobileMenu() {
    if (navList) {
        navList.classList.toggle('mobile-open');
        mobileMenuToggle.classList.toggle('active');
    }
}

// Initialize scroll spy for navigation highlighting
function initializeScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                updateActiveNavLink(sectionId);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-80px 0px -50% 0px'
    });
    
    tabContents.forEach(section => {
        observer.observe(section);
    });
}

// Update active navigation link based on scroll position
function updateActiveNavLink(sectionId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tab') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Initialize smooth scrolling for internal links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize scroll animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.course-card, .highlight-card, .cv-item, .principle-card, .area-card, .research-project');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(el);
    });
}

// Track page views (placeholder for analytics)
function trackPageView(tabId) {
    // Placeholder for analytics tracking
    console.log(`Page view: ${tabId}`);
    
    // Example: Google Analytics 4
    // if (typeof gtag !== 'undefined') {
    //     gtag('config', 'GA_TRACKING_ID', {
    //         page_title: getPageTitle(tabId),
    //         page_location: window.location.href
    //     });
    // }
}

// Get page title based on tab
function getPageTitle(tabId) {
    const titles = {
        'home': 'Home - Katheryn Wright',
        'cv': 'CV - Katheryn Wright',
        'courses': 'Teaching - Katheryn Wright',
        'curriculum': 'Curriculum Design - Katheryn Wright',
        'research': 'Research & Creative Practice - Katheryn Wright'
    };
    return titles[tabId] || 'Katheryn Wright - Portfolio';
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Close mobile menu on desktop
    if (window.innerWidth > 768) {
        navList.classList.remove('mobile-open');
        mobileMenuToggle.classList.remove('active');
    }
});

// Search functionality (if needed in the future)
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length > 2) {
                performSearch(query);
            } else {
                hideSearchResults();
            }
        });
    }
}

// Perform search across content (placeholder)
function performSearch(query) {
    // This would search through all content sections
    // and display relevant results
    console.log(`Searching for: ${query}`);
}

// Hide search results
function hideSearchResults() {
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Utility function to debounce function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle tab switching from external triggers
function switchToTab(tabId) {
    showTab(tabId);
}

// Initialize based on URL hash
function initializeFromURL() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showTab(hash);
    } else {
        showTab('home');
    }
}

// Call initialization when page loads
document.addEventListener('DOMContentLoaded', initializeFromURL);

// Export functions for global access
window.showTab = showTab;
window.switchToTab = switchToTab;
window.enterSite = enterSite;
window.toggleSound = toggleSound;

// Add CSS for mobile menu (dynamic styles)
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-list {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 1rem;
                box-shadow: var(--shadow-lg);
                border-top: 1px solid var(--border-color);
            }
            
            .nav-list.mobile-open {
                display: flex;
            }
            
            .mobile-menu-toggle.active {
                color: var(--primary-color);
            }
            
            .nav-list li {
                width: 100%;
            }
            
            .nav-link {
                display: block;
                width: 100%;
                text-align: center;
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .nav-link:last-child {
                border-bottom: none;
            }
        }
    `;
    document.head.appendChild(style);
});

// Form handling (if forms are added later)
function handleFormSubmission(formElement, callback) {
    formElement.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData.entries());
        
        if (callback) {
            callback(data);
        }
    });
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Navigate tabs with arrow keys when focused on navigation
    if (e.target.classList.contains('nav-link')) {
        const currentIndex = Array.from(navLinks).indexOf(e.target);
        let nextIndex;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % navLinks.length;
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            nextIndex = (currentIndex - 1 + navLinks.length) % navLinks.length;
            e.preventDefault();
        }
        
        if (nextIndex !== undefined) {
            navLinks[nextIndex].focus();
        }
    }
    
    // Quick navigation with number keys
    if (e.altKey || e.ctrlKey) {
        const tabKeys = {
            '1': 'home',
            '2': 'cv',
            '3': 'courses',
            '4': 'curriculum',
            '5': 'research'
        };
        
        if (tabKeys[e.key]) {
            e.preventDefault();
            showTab(tabKeys[e.key]);
        }
    }
});

// Performance optimization: Lazy load images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', initializeLazyLoading);

// Theme switching (if dark mode is added later)
function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

console.log('Portfolio website initialized successfully!');
