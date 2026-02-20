// 1. Loading screen
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    const progress = document.querySelector('.loader-progress');
    
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 25;
        if (width >= 100) {
            width = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('finished');
            }, 500);
        }
        progress.style.width = width + '%';
    }, 100);
});

// 2. Parallax & Lip Logic (Native Sync)
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    
    const layerBg = document.querySelector('.layer-bg');

    // Only execute if we are in or near the Hero
    if (scrollY <= vh) {
        // CLAMP: translateY(0) is the limit. It can't go negative (overlap the top).
        const bgMove = Math.max(0, scrollY * 0.2);
        layerBg.style.transform = `translateY(${bgMove}px) scale(${1 + scrollY / 5000})`;
    } else {
        // If we've scrolled past the hero, reset hero styles to "hidden/away" 
        // to prevent ghosting if the user scrolls back up very fast.
        layerBg.style.opacity = "0";
    }
});