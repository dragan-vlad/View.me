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
        layerBg.style.opacity = "1";
        const bgMove = Math.max(0, scrollY * 0.2);
        layerBg.style.transform = `translateY(${bgMove}px) scale(${1 + scrollY / 5000})`;
    } else {
        // If we've scrolled past the hero, reset hero styles to "hidden/away" 
        // to prevent ghosting if the user scrolls back up very fast.
        layerBg.style.opacity = "0";
    }
});

const ctx = document.getElementById('projectChart');
if (ctx) {
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'At Risk'],
            datasets: [{
                data: [7, 15, 5],
                backgroundColor: ['#4caf50', '#00dff3', '#f44336'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#fcf1e5', font: { size: 10 } } } } }
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.bar-fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target') + '%';
            });
        }
    });
}, { threshold: 0.15 });

const targetSec = document.querySelector('.next-level');
if (targetSec) observer.observe(targetSec);