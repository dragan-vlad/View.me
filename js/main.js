import { load, save, D } from './store.js';
import { renderSidebar, goTo } from './nav.js';
import { initTree, renderTree } from './components/tree.js';
import { renderCalStats } from './modules/calisthenics.js';
import { renderLang } from './modules/languages.js';
import { renderCode, renderLC } from './modules/coding.js';
import { renderCyber } from './modules/cyber.js';
import { renderHabits } from './modules/habits.js';
import { updateDash } from './dashboard.js';
import { closeModal } from './modal.js';
import { renderRubiks } from './modules/rubiks.js';
import { renderWallet, initWallet } from './modules/wallet.js';

window.goTo = goTo;

function render() {
  renderCalStats();
  renderLang();
  renderCode();
  renderLC();
  renderCyber();
  renderHabits();
  updateDash();
  renderTree();
  renderRubiks();
  renderWallet();
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  renderSidebar();
  render();
  initTree();
  initWallet();

  document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
    if (event.key === "Enter") {
      //save modals .. to be continued
    }
  });
});

window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  const progress = document.querySelector('.loader-progress');
  
  if (loader && progress) {
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
  }
});

let lenis;
try {
  lenis = new (window.Lenis || Lenis)();
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
} catch(err) {}

const layerBg = document.querySelector('.layer-bg');
const footerWrap = document.getElementById('footer-wrap');

if (layerBg) {
  lenis.on('scroll', () => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Hero Parallax
    if (scrollY <= vh) {
      layerBg.style.opacity = "1";
      const bgMove = Math.max(0, scrollY * 0.2);
      layerBg.style.transform = `translateY(${bgMove}px) scale(${1 + scrollY / 5000})`;
    } else {
      layerBg.style.opacity = "0";
    }

    // Footer Reveal Logic
    if (footerWrap) {
      const footerTop = footerWrap.offsetTop;
      const distanceToFooter = footerTop - (scrollY + vh);
      
      // Start revealing when the footer enters the viewport
      if (distanceToFooter < 0) {
        const revealPercentage = Math.min(150, Math.abs(distanceToFooter) / vh * 150);
        footerWrap.style.setProperty('--reveal', `${revealPercentage}%`);
      } else {
        footerWrap.style.setProperty('--reveal', `0%`);
      }
    }
  });
}

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
      entry.target.classList.add('visible');
    }
  });
});

const targets = document.querySelectorAll('.parallax-words-inner');
targets.forEach(t => {
  if (t) observer.observe(t);
});

// async function fetchLeetCode(username) {
//   const usernameEl = document.querySelector('.leetcode-username');
//   if (usernameEl) usernameEl.textContent = '@' + username;

//   try {
//     const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
//     if (!res.ok) throw new Error('Network response was not ok');
//     const data = await res.json();

//     const easyTotal = 963;
//     const medTotal = 2111;
//     const hardTotal = 973;

//     const solvedEl = document.querySelector('#leetcode-solved');
//     if (solvedEl) solvedEl.textContent = data.totalSolved || 0;
    
//     document.querySelector('.easy .leetcode-num').textContent = `${data.easySolved || 0}/${easyTotal}`;
//     document.querySelector('.medium .leetcode-num').textContent = `${data.mediumSolved || 0}/${medTotal}`;
//     document.querySelector('.hard .leetcode-num').textContent = `${data.hardSolved || 0}/${hardTotal}`;

//     const radius = 52;
//     const circumference = 2 * Math.PI * radius;
//     const segment = (circumference / 3) - 7;
    
//     const easyRatio = (data.easySolved || 0) / easyTotal;
//     const medRatio = (data.mediumSolved || 0) / medTotal;
//     const hardRatio = (data.hardSolved || 0) / hardTotal;

//     const easyRing = document.querySelector('.leetcode-easy-ring');
//     const medRing = document.querySelector('.leetcode-medium-ring');
//     const hardRing = document.querySelector('.leetcode-hard-ring');

//     if (easyRing) easyRing.dataset.dash = `${easyRatio * segment} ${circumference}`;
//     if (medRing) medRing.dataset.dash = `${medRatio * segment} ${circumference}`;
//     if (hardRing) hardRing.dataset.dash = `${hardRatio * segment} ${circumference}`;

//     const widget = document.querySelector('.leetcode-widget');
//     if (widget) {
//       widget.style.setProperty('--easy-dash', `${easyRatio * segment} ${circumference}`);
//       widget.style.setProperty('--med-dash', `${medRatio * segment} ${circumference}`);
//       widget.style.setProperty('--hard-dash', `${hardRatio * segment} ${circumference}`);
      
//       void widget.offsetHeight;
//       widget.classList.add('visible');
//     }
//   } catch (e) {
//     const solvedEl = document.querySelector('#leetcode-solved');
//     if (solvedEl) solvedEl.textContent = 'Err';
//   }
// }

// fetchLeetCode('wedge155');

window.addEventListener('DOMContentLoaded', () => {
  if (window.$) {
    const $water = $('.water-layer');
    if ($water.length && $water.ripples) {
      $water.ripples({
        resolution: 1024,
        dropRadius: 5,
        perturbance: 0.002,
      });

      setInterval(function() {
        const x = Math.random() * $water.outerWidth();
        const y = $water.outerHeight() - (Math.random() * ($water.outerHeight() / 2));
        const dropRadius = 14;
        const strength = 0.1 + Math.random() * 0.005;

        $water.ripples('drop', x, y, dropRadius, strength);
      }, 3000);
    }
  }
});
