document.addEventListener('DOMContentLoaded', function() {
    // Add animation to the error icon
    const errorIcon = document.querySelector('.error-icon i');
    
    // Add shake animation when hovering over the error icon
    if (errorIcon) {
        errorIcon.addEventListener('mouseenter', function() {
            this.classList.add('fa-shake');
        });
        
        errorIcon.addEventListener('mouseleave', function() {
            this.classList.remove('fa-shake');
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
});