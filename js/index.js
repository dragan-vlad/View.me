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

// Checklist API Operations
let activeRules = [];
let isLoaded = false;

async function fetchChecklist() {
    try {
        const response = await fetch('/api/mail-checklist');
        if (response.ok) {
            activeRules = await response.json();
            isLoaded = true;
            renderRules();
        } else {
            console.error('Failed to load rules, status:', response.status);
        }
    } catch (err) {
        console.error('Failed to load checklist rules:', err);
    }
}

async function saveChecklist() {
    if (!isLoaded && activeRules.length === 0) {
        console.warn('Blocked save: State not fetched from server yet.');
        return;
    }

    try {
        await fetch('/api/mail-checklist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activeRules)
        });
        renderRules();
    } catch (err) {
        console.error('Failed to update checklist:', err);
    }
}

function renderRules() {
    const listContainer = document.getElementById('ruleList');
    if (!listContainer) return;

    if (activeRules.length === 0) {
        listContainer.innerHTML = `<div style="opacity:0.6; font-size:0.8rem; padding:0.5rem;">No active rules configured.</div>`;
        return;
    }

    listContainer.innerHTML = activeRules.map((rule, idx) => `
        <div class="rule-item">
            <div class="rule-info">
                <span class="badge">${rule.category}</span>
                <span>${rule.match_field}: <strong>${rule.match_value}</strong></span>
            </div>
            <div class="rule-actions">
                <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleRule(${idx})">
                <button type="button" class="btn-delete" onclick="deleteRule(${idx})">&times;</button>
            </div>
        </div>
    `).join('');
}

window.toggleRule = function(index) {
    activeRules[index].enabled = !activeRules[index].enabled;
    saveChecklist();
};

window.deleteRule = function(index) {
    activeRules.splice(index, 1);
    saveChecklist();
};

// Modal Controls & DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    fetchChecklist();

    const modal = document.getElementById('ruleModal');
    const openBtn = document.getElementById('openRuleModal');
    const closeBtn = document.getElementById('closeRuleModal');
    const ruleForm = document.getElementById('ruleForm');

    if (openBtn && modal) openBtn.onclick = () => modal.classList.add('active');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('active');

    if (ruleForm) {
        ruleForm.onsubmit = (e) => {
            e.preventDefault();
            const newRule = {
                id: `rule_${Date.now()}`,
                enabled: true,
                category: document.getElementById('ruleCategory').value,
                match_field: document.getElementById('ruleField').value,
                match_value: document.getElementById('ruleValue').value
            };
            activeRules.push(newRule);
            saveChecklist();
            ruleForm.reset();
            modal.classList.remove('active');
        };
    }
});