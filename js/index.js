window.addEventListener('DOMContentLoaded', () => {
    const heroInner = document.querySelector('.hero-inner');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    heroInner.style.opacity = '0';
    heroInner.style.transform = 'translateY(20px)';
    heroInner.style.transition = 'all 1s cubic-bezier(0.22, 1, 0.36, 1)';
    
    observer.observe(heroInner);
});

window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.padding = '0.5rem 10%';
        nav.style.background = 'rgba(1, 4, 25, 0.98)';
        nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    } else {
        nav.style.padding = '0.6rem 10%';
        nav.style.background = 'rgba(1, 4, 25, 0.95)';
        nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
    }
});